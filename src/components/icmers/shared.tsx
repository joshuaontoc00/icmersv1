import { format } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function formatTime(iso: string | null) {
  if (!iso) return "";
  return format(new Date(iso), "MMM d, h:mm a");
}

export function StatusBadge({ pending, pendingText, doneText }: { pending: boolean; pendingText: string; doneText: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        pending ? "bg-warning-soft text-warning-foreground" : "bg-success-soft text-success",
      )}
    >
      {pending ? <Clock className="size-3.5" aria-hidden /> : <CheckCircle2 className="size-3.5" aria-hidden />}
      {pending ? pendingText : doneText}
    </span>
  );
}

export function CardTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary [&_svg]:size-4.5">
        {icon}
      </span>
      {children}
    </h2>
  );
}

export function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
      <span className="text-success [&_svg]:size-8">{icon}</span>
      <p>{text}</p>
    </div>
  );
}
