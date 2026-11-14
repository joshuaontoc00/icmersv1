import { useCallback, useEffect, useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  DoorOpen,
  FileText,
  Send,
  Siren,
  Timer,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import bgAsset from "@/assets/campus_medical_background.png.asset.json";
import { APP_FULL_NAME, CLINIC_NAME } from "@/lib/icmers/constants";
import {
  acknowledgeRequest,
  createRequest,
  randomDemoRequest,
  useEmergencyRequests,
  type EmergencyRequest,
} from "@/lib/icmers/requests";
import {
  clearSession,
  loadMuted,
  loadSession,
  saveMuted,
  saveSession,
  type Role,
  type Session,
} from "@/lib/icmers/session";
import {
  playAckChime,
  playClinicAlert,
  playSentDing,
  setSoundMuted,
  unlockAudio,
} from "@/lib/icmers/sounds";
import { ClinicPage } from "./ClinicPage";
import { Header } from "./Header";
import { LoginScreen } from "./LoginScreen";
import { DetailRow, Popup } from "./Popup";
import { UserPage } from "./UserPage";

const ACK_SECONDS = 60;
const SENT_SECONDS = 8;

type AckInfo = { building: string; room: string; key: number };

export function IcmersApp() {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [muted, setMuted] = useState(false);

  // Clinic popup
  const [clinicAlert, setClinicAlert] = useState<{ id: string; minimized: boolean } | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  // User popups
  const [ack, setAck] = useState<(AckInfo & { minimized: boolean }) | null>(null);
  const lastAckRef = useRef<AckInfo | null>(null);
  const [sent, setSent] = useState<{ minimized: boolean; key: number } | null>(null);

  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    setSession(loadSession());
    setMuted(loadMuted());
    setHydrated(true);
    // Browsers only allow sound after a user gesture; unlock on the first one.
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    setSoundMuted(muted);
  }, [muted]);

  const showAck = useCallback((info: { building: string; room: string }) => {
    const next = { ...info, key: Date.now() };
    lastAckRef.current = next;
    setAck({ ...next, minimized: false });
  }, []);

  const { requests, connected, upsertLocal, resetDemo } = useEmergencyRequests({
    onInsert: (r) => {
      if (sessionRef.current?.role !== "clinic") return;
      setClinicAlert({ id: r.id, minimized: false });
      playClinicAlert();
    },
    onAcknowledged: (r) => {
      const s = sessionRef.current;
      if (!s) return;
      if (s.role === "clinic") {
        setClinicAlert((cur) => (cur?.id === r.id ? null : cur));
      } else if (r.reporter_id === s.id) {
        showAck(r);
        playAckChime();
      }
    },
  });

  // Close the clinic popup if its request disappears or is acknowledged elsewhere.
  const alertRequest = clinicAlert ? requests.find((r) => r.id === clinicAlert.id) : undefined;
  useEffect(() => {
    if (
      clinicAlert &&
      requests.length > 0 &&
      (!alertRequest || alertRequest.status !== "Pending")
    ) {
      setClinicAlert(null);
    }
  }, [clinicAlert, alertRequest, requests.length]);

  // "Emergency sent" closes itself after 8 seconds.
  useEffect(() => {
    if (!sent) return;
    const t = window.setTimeout(() => setSent(null), SENT_SECONDS * 1000);
    return () => window.clearTimeout(t);
  }, [sent?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (role: Role, id: string) => {
    unlockAudio();
    const s = { role, id };
    saveSession(s);
    setSession(s);
  };

  const logout = () => {
    clearSession();
    setSession(null);
    setClinicAlert(null);
    setAck(null);
    setSent(null);
    lastAckRef.current = null;
  };

  const toggleMute = () => {
    setMuted((m) => {
      saveMuted(!m);
      if (m) unlockAudio();
      return !m;
    });
  };

  const pending = requests.filter((r) => r.status === "Pending");

  const onBell = () => {
    if (!session) return;
    if (session.role === "clinic") {
      const latest = pending[0];
      if (latest) setClinicAlert({ id: latest.id, minimized: false });
      else toast("No new alerts");
    } else {
      if (lastAckRef.current) setAck({ ...lastAckRef.current, key: Date.now(), minimized: false });
      else toast("No notifications");
    }
  };

  const acknowledge = async (id: string) => {
    setAcknowledgingId(id);
    try {
      await acknowledgeRequest(id, CLINIC_NAME);
      const r = requests.find((x) => x.id === id);
      if (r) {
        upsertLocal({
          ...r,
          status: "Acknowledged",
          acknowledged_by: CLINIC_NAME,
          acknowledged_at: new Date().toISOString(),
        });
      }
      setClinicAlert((cur) => (cur?.id === id ? null : cur));
      toast.success("Acknowledged. The reporter has been notified.");
    } catch {
      toast.error("Could not acknowledge. Check your connection and try again.");
    } finally {
      setAcknowledgingId(null);
    }
  };

  const simulateIncoming = async () => {
    setSimulating(true);
    try {
      await createRequest(randomDemoRequest());
    } catch {
      toast.error("Could not create the demo emergency.");
    } finally {
      setSimulating(false);
    }
  };

  const submitReport = async (data: { building: string; room: string; description: string }) => {
    if (!session) return;
    const row = await createRequest({
      reporter_id: session.id,
      reporter_name: `User ${session.id}`.slice(0, 80),
      ...data,
    });
    upsertLocal(row);
    setSent({ minimized: false, key: Date.now() });
    playSentDing();
  };

  const simulateAck = () => {
    if (!session) return;
    const mine = requests.find((r) => r.reporter_id === session.id);
    showAck(mine ? { building: mine.building, room: mine.room } : { building: "CET", room: "101" });
    playAckChime();
  };

  const name = session?.role === "clinic" ? CLINIC_NAME : (session?.id ?? "");

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgAsset.url})` }}
      />
      <div aria-hidden className="page-veil fixed inset-0 -z-10" />

      {!hydrated ? null : !session ? (
        <LoginScreen connected={connected} onLogin={login} onResetDemo={resetDemo} />
      ) : (
        <>
          <Header
            name={name}
            connected={connected}
            muted={muted}
            showDot={session.role === "clinic" && pending.length > 0}
            onToggleMute={toggleMute}
            onBell={onBell}
            onLogout={logout}
          />
          <p className="px-4 pt-3 text-center text-[11px] font-medium text-muted-foreground sm:hidden">
            {APP_FULL_NAME}
          </p>
          <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
            {session.role === "clinic" ? (
              <ClinicPage
                requests={requests}
                acknowledgingId={acknowledgingId}
                simulating={simulating}
                onAcknowledge={acknowledge}
                onSimulate={simulateIncoming}
              />
            ) : (
              <UserPage
                userId={session.id}
                requests={requests}
                onSubmit={submitReport}
                onSimulateAck={simulateAck}
              />
            )}
          </main>
        </>
      )}

      {/* Clinic: new emergency */}
      {session?.role === "clinic" && clinicAlert && alertRequest && (
        <Popup
          open
          minimized={clinicAlert.minimized}
          tone="danger"
          icon={<Siren />}
          title="New emergency"
          pillLabel={`New emergency · ${alertRequest.building}`}
          onMinimize={() => setClinicAlert({ ...clinicAlert, minimized: true })}
          onExpand={() => setClinicAlert({ ...clinicAlert, minimized: false })}
          onClose={() => setClinicAlert(null)}
        >
          <div className="space-y-2.5 rounded-xl bg-primary-soft p-4">
            <DetailRow icon={<Building2 />} label="Building" value={alertRequest.building} />
            <DetailRow icon={<DoorOpen />} label="Room" value={alertRequest.room} />
            <DetailRow icon={<User />} label="Reporter" value={alertRequest.reporter_name} />
            <DetailRow
              icon={<FileText />}
              label="Details"
              value={alertRequest.description || "No description"}
            />
          </div>
          <Button
            variant="success"
            className="mt-4 h-12 w-full rounded-xl text-base font-bold"
            onClick={() => acknowledge(alertRequest.id)}
            disabled={acknowledgingId === alertRequest.id}
          >
            <CheckCircle2 />
            {acknowledgingId === alertRequest.id ? "Acknowledging…" : "Acknowledge"}
          </Button>
        </Popup>
      )}

      {/* User: emergency sent */}
      {session?.role === "user" && sent && (
        <Popup
          open
          minimized={sent.minimized}
          tone="success"
          icon={<Send />}
          title="Emergency sent"
          pillLabel="Emergency sent"
          pillIndex={ack?.minimized ? 1 : 0}
          onMinimize={() => setSent({ ...sent, minimized: true })}
          onExpand={() => setSent({ ...sent, minimized: false })}
          onClose={() => setSent(null)}
        >
          <p className="text-sm text-muted-foreground">
            Your report reached the clinic. Stay where you are — you will be notified as soon as the
            clinic responds.
          </p>
        </Popup>
      )}

      {/* User: clinic is on the way */}
      {session?.role === "user" && ack && (
        <AckPopup
          key={ack.key}
          info={ack}
          minimized={ack.minimized}
          onMinimize={() => setAck({ ...ack, minimized: true })}
          onExpand={() => setAck({ ...ack, minimized: false })}
          onClose={() => setAck(null)}
        />
      )}
    </div>
  );
}

function AckPopup({
  info,
  minimized,
  onMinimize,
  onExpand,
  onClose,
}: {
  info: AckInfo;
  minimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  onClose: () => void;
}) {
  const [left, setLeft] = useState(ACK_SECONDS);

  useEffect(() => {
    const started = Date.now();
    const t = window.setInterval(() => {
      const remaining = Math.max(0, ACK_SECONDS - Math.floor((Date.now() - started) / 1000));
      setLeft(remaining);
    }, 250);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (left === 0) onClose();
  }, [left, onClose]);

  return (
    <Popup
      open
      minimized={minimized}
      tone="success"
      icon={<CheckCircle2 />}
      title="Clinic is on the way"
      pillLabel={`Clinic on the way · ${left}s`}
      onMinimize={onMinimize}
      onExpand={onExpand}
      onClose={onClose}
    >
      <p className="text-sm text-muted-foreground">
        Help is coming. Stay calm and stay where you are.
      </p>
      <div className="mt-3 space-y-2.5 rounded-xl bg-success-soft p-4">
        <DetailRow icon={<Building2 />} label="Building" value={info.building} />
        <DetailRow icon={<DoorOpen />} label="Room" value={info.room} />
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Timer className="size-3.5" aria-hidden />
            Closes automatically
          </span>
          <span className="tabular-nums" aria-live="off">
            {left}s
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Time remaining"
          aria-valuemin={0}
          aria-valuemax={ACK_SECONDS}
          aria-valuenow={left}
        >
          <div
            className="h-full rounded-full bg-success transition-[width] duration-300 ease-linear"
            style={{ width: `${(left / ACK_SECONDS) * 100}%` }}
          />
        </div>
      </div>
    </Popup>
  );
}

export type { EmergencyRequest };
