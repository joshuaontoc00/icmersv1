import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Inbox,
  MapPin,
  MessageSquareText,
  PencilLine,
  Presentation,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BUILDINGS,
  LOCATION_ERROR,
  MAX_CUSTOM_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  OTHERS,
  OTHERS_LABEL,
} from "@/lib/icmers/constants";
import { resolveLocation } from "@/lib/icmers/location";
import type { EmergencyRequest } from "@/lib/icmers/requests";
import { cn } from "@/lib/utils";
import { RoomPicker } from "./RoomPicker";
import { CardTitle, EmptyState, StatusBadge, formatTime } from "./shared";

type Props = {
  userId: string;
  requests: EmergencyRequest[];
  onSubmit: (data: { building: string; room: string; description: string }) => Promise<void>;
  onSimulateAck: () => void;
};

export function UserPage({ userId, requests, onSubmit, onSimulateAck }: Props) {
  const [building, setBuilding] = useState("");
  const [buildingOther, setBuildingOther] = useState("");
  const [room, setRoom] = useState("");
  const [roomOther, setRoomOther] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const buildingOtherRef = useRef<HTMLInputElement>(null);
  const roomOtherRef = useRef<HTMLInputElement>(null);
  const ids = { building: useId(), bOther: useId(), rOther: useId(), desc: useId(), err: useId() };

  useEffect(() => {
    if (building === OTHERS) buildingOtherRef.current?.focus();
  }, [building]);
  useEffect(() => {
    if (room === OTHERS) roomOtherRef.current?.focus();
  }, [room]);

  const mine = requests.filter((r) => r.reporter_id === userId);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const location = resolveLocation({ building, buildingOther, room, roomOther });
    if (!location) {
      setError(LOCATION_ERROR);
      return;
    }
    setError("");
    setSending(true);
    try {
      await onSubmit({ ...location, description: description.trim() });
      setBuilding("");
      setBuildingOther("");
      setRoom("");
      setRoomOther("");
      setDescription("");
    } catch {
      setError("Could not send the report. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const fieldClass =
    "h-12 w-full rounded-xl border bg-card px-3 text-base outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
          Your health, our priority
        </h1>
        <p className="mt-1 text-muted-foreground">
          Report an emergency quickly and get the help you need.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="glass-card p-4 sm:p-6" aria-labelledby="report-title">
            <div id="report-title">
              <CardTitle icon={<Siren />}>Report an emergency</CardTitle>
            </div>
            <form onSubmit={submit} noValidate className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor={ids.building}
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"
                >
                  <Building2 className="size-4 text-primary" aria-hidden />
                  Building
                </label>
                <div className="relative">
                  <select
                    id={ids.building}
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    aria-invalid={(!!error && !building) || undefined}
                    className={cn(
                      fieldClass,
                      "appearance-none pr-10",
                      !building && "text-muted-foreground",
                      error && !building ? "border-primary" : "border-input",
                    )}
                  >
                    <option value="" disabled>
                      Select building
                    </option>
                    {BUILDINGS.map((b) => (
                      <option key={b} value={b} className="text-foreground">
                        {b}
                      </option>
                    ))}
                    <option value={OTHERS} className="text-foreground">
                      {OTHERS_LABEL}
                    </option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                {building === OTHERS && (
                  <div className="mt-2">
                    <label htmlFor={ids.bOther} className="sr-only">
                      Type the location
                    </label>
                    <div className="relative">
                      <PencilLine
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        ref={buildingOtherRef}
                        id={ids.bOther}
                        value={buildingOther}
                        onChange={(e) => setBuildingOther(e.target.value)}
                        maxLength={MAX_CUSTOM_LENGTH}
                        placeholder="Type the location"
                        className={cn(fieldClass, "border-input pl-9")}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <RoomPicker value={room} onChange={setRoom} invalid={!!error && !room} />
                {room === OTHERS && (
                  <div className="mt-2">
                    <label htmlFor={ids.rOther} className="sr-only">
                      Type the room
                    </label>
                    <div className="relative">
                      <PencilLine
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        ref={roomOtherRef}
                        id={ids.rOther}
                        value={roomOther}
                        onChange={(e) => setRoomOther(e.target.value)}
                        maxLength={MAX_CUSTOM_LENGTH}
                        placeholder="Type the room"
                        className={cn(fieldClass, "border-input pl-9")}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor={ids.desc}
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"
                >
                  <MessageSquareText className="size-4 text-primary" aria-hidden />
                  Description <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id={ids.desc}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={3}
                  placeholder="What happened? e.g. feeling dizzy, someone fainted"
                  className="w-full resize-y rounded-xl border border-input bg-card px-3 py-2.5 text-base outline-none focus:border-primary"
                />
              </div>

              {error && (
                <p
                  id={ids.err}
                  role="alert"
                  className="flex items-start gap-2 rounded-lg bg-primary-soft px-3 py-2 text-sm font-medium text-primary"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {error}
                </p>
              )}

              <Button type="submit" variant="emergency" size="xl" disabled={sending}>
                <AlertCircle />
                {sending ? "Sending…" : "Report emergency"}
              </Button>
            </form>
          </section>

          <section
            className="rounded-2xl border-2 border-dashed border-primary/40 bg-card/70 p-4"
            aria-label="Presentation demo"
          >
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <Presentation className="size-4" aria-hidden />
              Presentation demo
            </p>
            <Button variant="success" className="h-11 w-full rounded-xl" onClick={onSimulateAck}>
              <ShieldCheck />
              Simulate clinic acknowledged
            </Button>
          </section>
        </div>

        <section className="glass-card h-fit p-4 sm:p-6" aria-labelledby="mine-title">
          <div id="mine-title" className="flex items-center justify-between gap-2">
            <CardTitle icon={<ClipboardList />}>My requests</CardTitle>
            <span className="text-sm text-muted-foreground">{mine.length}</span>
          </div>
          <div className="mt-4">
            {mine.length === 0 ? (
              <EmptyState icon={<Inbox />} text="No requests yet. Your reports will appear here." />
            ) : (
              <ul className="space-y-3">
                {mine.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border bg-card p-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="flex min-w-0 items-center gap-1.5 font-semibold">
                        <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                        <span className="min-w-0 break-words">
                          {r.building} · Room {r.room}
                        </span>
                      </p>
                      <StatusBadge
                        pending={r.status === "Pending"}
                        pendingText="Waiting for clinic"
                        doneText="Clinic responding"
                      />
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden />
                      {formatTime(r.created_at)} · {r.request_number}
                    </p>
                    {r.description && (
                      <p className="mt-2 flex items-start gap-1.5 text-sm">
                        <FileText
                          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <span className="min-w-0 whitespace-pre-wrap break-words">
                          {r.description}
                        </span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
