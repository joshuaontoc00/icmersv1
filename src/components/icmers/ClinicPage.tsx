import { useState } from "react";
import {
  Activity,
  BriefcaseMedical,
  CheckCheck,
  CheckCircle2,
  Clock,
  History,
  Hourglass,
  Lightbulb,
  ListChecks,
  MapPin,
  Presentation,
  ShieldCheck,
  Siren,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmergencyRequest } from "@/lib/icmers/requests";
import { cn } from "@/lib/utils";
import { CardTitle, EmptyState, StatusBadge, formatTime } from "./shared";

type Props = {
  requests: EmergencyRequest[];
  acknowledgingId: string | null;
  simulating: boolean;
  onAcknowledge: (id: string) => void;
  onSimulate: () => void;
};

type Tab = "pending" | "history";

const TIPS = [
  { icon: MapPin, text: "Confirm the building and room before leaving." },
  { icon: BriefcaseMedical, text: "Bring the first aid kit and log sheet." },
  { icon: CheckCheck, text: "Acknowledge first so the user knows help is coming." },
];

export function ClinicPage({ requests, acknowledgingId, simulating, onAcknowledge, onSimulate }: Props) {
  const [tab, setTab] = useState<Tab>("pending");
  const pending = requests.filter((r) => r.status === "Pending");
  const history = requests.filter((r) => r.status === "Acknowledged");
  const rows = tab === "pending" ? pending : history;

  const stats = [
    { label: "Total", value: requests.length, icon: Activity, tone: "bg-primary-soft text-primary" },
    { label: "Pending", value: pending.length, icon: Hourglass, tone: "bg-warning-soft text-warning-foreground" },
    { label: "Acknowledged", value: history.length, icon: CheckCircle2, tone: "bg-success-soft text-success" },
  ];

  const tabs: { id: Tab; label: string; icon: typeof Siren }[] = [
    { id: "pending", label: `Pending emergencies (${pending.length})`, icon: Siren },
    { id: "history", label: "History", icon: History },
  ];

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(i + 1) % 2]!;
    setTab(next.id);
    document.getElementById(`clinic-tab-${next.id}`)?.focus();
  };

  const ackButton = (r: EmergencyRequest, full?: boolean) => (
    <Button
      variant="success"
      className={cn("h-10 rounded-lg", full && "h-11 w-full")}
      onClick={() => onAcknowledge(r.id)}
      disabled={acknowledgingId === r.id}
      aria-label={`Acknowledge ${r.request_number}`}
    >
      <CheckCircle2 />
      {acknowledgingId === r.id ? "Acknowledging…" : "Acknowledge"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Clinic dashboard</h1>
        <p className="mt-1 text-muted-foreground">Monitor and respond to campus health emergencies.</p>
      </section>

      <section className="glass-card p-4 sm:p-6" aria-labelledby="tips-title">
        <div id="tips-title">
          <CardTitle icon={<Lightbulb />}>Be ready. Respond smart. Save lives.</CardTitle>
        </div>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {TIPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 rounded-xl bg-success-soft p-3 text-sm">
              <Icon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Request totals">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="glass-card flex min-w-0 flex-col items-start gap-1.5 p-2.5 sm:flex-row sm:items-center sm:gap-3 sm:p-5">
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-11", tone)}>
              <Icon className="size-4 sm:size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-extrabold leading-none tabular-nums sm:text-3xl">{value}</p>
              <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground sm:text-sm">{label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border-2 border-dashed border-primary/40 bg-card/70 p-4" aria-label="Presentation demo">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Presentation className="size-4" aria-hidden />
          Presentation demo
        </p>
        <Button variant="dashed" className="h-11 w-full" onClick={onSimulate} disabled={simulating}>
          <Zap />
          {simulating ? "Sending…" : "Simulate incoming emergency"}
        </Button>
      </section>

      <section className="glass-card p-3 sm:p-6">
        <div role="tablist" aria-label="Requests" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:inline-grid">
          {tabs.map((t, i) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                id={`clinic-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="clinic-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold sm:px-4 sm:text-sm",
                  active ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div id="clinic-panel" role="tabpanel" aria-labelledby={`clinic-tab-${tab}`} className="mt-4">
          {rows.length === 0 ? (
            <EmptyState
              icon={tab === "pending" ? <ShieldCheck /> : <ListChecks />}
              text={tab === "pending" ? "No pending emergencies. You are all caught up." : "No history yet."}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-border md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Request ID</th>
                      <th className="px-4 py-3 font-semibold">Reporter</th>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold">Time</th>
                      <th className="px-4 py-3 font-semibold">Details</th>
                      <th className="px-4 py-3 font-semibold">{tab === "pending" ? "Action" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {rows.map((r) => (
                      <tr key={r.id} className="align-top">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{r.request_number}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{r.reporter_name}</p>
                          <p className="text-xs text-muted-foreground">{r.reporter_id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold break-words">{r.building}</p>
                          <p className="text-xs text-muted-foreground break-words">Room {r.room}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatTime(r.created_at)}</td>
                        <td className="max-w-[16rem] px-4 py-3">
                          <p className="whitespace-pre-wrap break-words">{r.description || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          {tab === "pending" ? (
                            ackButton(r)
                          ) : (
                            <div className="space-y-1">
                              <StatusBadge pending={false} pendingText="" doneText="Acknowledged" />
                              <p className="text-xs text-muted-foreground">
                                by {r.acknowledged_by} · {formatTime(r.acknowledged_at)}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phone cards */}
              <ul className="space-y-3 md:hidden">
                {rows.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border bg-card p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{r.request_number}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3.5" aria-hidden />
                        {formatTime(r.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 font-semibold">
                      <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="min-w-0 break-words">
                        {r.building} · Room {r.room}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm">
                      <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 break-words">
                        {r.reporter_name} <span className="text-muted-foreground">({r.reporter_id})</span>
                      </span>
                    </p>
                    {r.description && (
                      <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-muted px-3 py-2 text-sm">
                        {r.description}
                      </p>
                    )}
                    <div className="mt-3">
                      {tab === "pending" ? (
                        ackButton(r, true)
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge pending={false} pendingText="" doneText="Acknowledged" />
                          <span className="text-xs text-muted-foreground">
                            by {r.acknowledged_by} · {formatTime(r.acknowledged_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
