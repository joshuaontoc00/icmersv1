import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { BUILDINGS, ROOM_ROWS } from "./constants";

export type RequestStatus = "Pending" | "Acknowledged";

export type EmergencyRequest = {
  id: string;
  request_number: string;
  reporter_id: string;
  reporter_name: string;
  building: string;
  room: string;
  description: string;
  status: RequestStatus;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
};

const COLUMNS =
  "id, request_number, reporter_id, reporter_name, building, room, description, status, acknowledged_by, acknowledged_at, created_at";

/** Inserts older than this are treated as restored seed data, not fresh alerts. */
const FRESH_ALERT_WINDOW_MS = 3 * 60 * 1000;

function sortDesc(list: EmergencyRequest[]) {
  return [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

type Handlers = {
  onInsert?: (r: EmergencyRequest) => void;
  onAcknowledged?: (r: EmergencyRequest) => void;
};

/** Shared, live list of emergency requests for every device. */
export function useEmergencyRequests(handlers: Handlers) {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [online, setOnline] = useState(true);
  const handlersRef = useRef(handlers);
  const statusRef = useRef(new Map<string, RequestStatus>());
  const broadcastRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const applyList = useCallback((list: EmergencyRequest[]) => {
    const map = new Map<string, RequestStatus>();
    list.forEach((r) => map.set(r.id, r.status));
    statusRef.current = map;
    setRequests(sortDesc(list));
  }, []);

  const upsertLocal = useCallback((row: EmergencyRequest) => {
    statusRef.current.set(row.id, row.status);
    setRequests((prev) => sortDesc([row, ...prev.filter((r) => r.id !== row.id)]));
  }, []);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select(COLUMNS)
      .is("cleared_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) {
      applyList(data as EmergencyRequest[]);
      setLoaded(true);
    }
  }, [applyList]);

  useEffect(() => {
    void refetch();

    const channel = supabase
      .channel(`icmers-requests-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "emergency_requests" },
        (payload) => {
          const row = payload.new as EmergencyRequest & { cleared_at?: string | null };
          if (row.cleared_at) return;
          const known = statusRef.current.has(row.id);
          upsertLocal(row);
          const age = Date.now() - new Date(row.created_at).getTime();
          if (!known && row.status === "Pending" && age < FRESH_ALERT_WINDOW_MS) {
            handlersRef.current.onInsert?.(row);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "emergency_requests" },
        (payload) => {
          const row = payload.new as EmergencyRequest & { cleared_at?: string | null };
          if (row.cleared_at) {
            statusRef.current.delete(row.id);
            setRequests((prev) => prev.filter((r) => r.id !== row.id));
            return;
          }
          const oldStatus = (payload.old as Partial<EmergencyRequest>)?.status;
          const prevStatus = statusRef.current.get(row.id) ?? oldStatus;
          upsertLocal(row);
          if (row.status === "Acknowledged" && prevStatus !== "Acknowledged") {
            handlersRef.current.onAcknowledged?.(row);
          }
        },
      )
      .subscribe((status) => {
        const ok = status === "SUBSCRIBED";
        setSubscribed(ok);
        if (ok) void refetch();
      });

    // Shared room so a demo reset on one device refreshes every other device.
    const broadcast = supabase
      .channel("icmers-broadcast")
      .on("broadcast", { event: "reset" }, () => void refetch())
      .subscribe();
    broadcastRef.current = broadcast;

    const onVisible = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    const onOnline = () => {
      setOnline(true);
      void refetch();
    };
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      void supabase.removeChannel(channel);
      void supabase.removeChannel(broadcast);
      broadcastRef.current = null;
    };
  }, [refetch, upsertLocal]);

  const resetDemo = useCallback(async () => {
    const { error } = await supabase.rpc("reset_demo_data");
    if (error) throw error;
    await refetch();
    await broadcastRef.current?.send({ type: "broadcast", event: "reset", payload: {} });
  }, [refetch]);

  return { requests, loaded, connected: subscribed && online, upsertLocal, refetch, resetDemo };
}

export async function createRequest(input: {
  reporter_id: string;
  reporter_name: string;
  building: string;
  room: string;
  description: string;
}): Promise<EmergencyRequest> {
  const { data, error } = await supabase
    .from("emergency_requests")
    .insert(input)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data as EmergencyRequest;
}

export async function acknowledgeRequest(id: string, by: string) {
  const { error } = await supabase.rpc("acknowledge_request", { _id: id, _by: by });
  if (error) throw error;
}

const DEMO_DESCRIPTIONS = [
  "Student fainted in the hallway",
  "Feeling dizzy and nauseous",
  "Minor cut, bleeding from hand",
  "Difficulty breathing after class",
  "Sprained ankle on the stairs",
  "High fever and chills",
];

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

export function randomDemoRequest() {
  return {
    reporter_id: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
    reporter_name: "Demo User",
    building: pick(BUILDINGS),
    room: pick(pick(ROOM_ROWS)),
    description: pick(DEMO_DESCRIPTIONS),
  };
}
