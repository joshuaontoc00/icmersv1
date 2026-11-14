import { useEffect, useId, useRef, type ReactNode } from "react";
import { Maximize2, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "danger" | "success" | "info";

const toneStyles: Record<Tone, { bar: string; icon: string; pill: string }> = {
  danger: {
    bar: "bg-primary",
    icon: "bg-primary-soft text-primary",
    pill: "bg-primary text-primary-foreground",
  },
  success: {
    bar: "bg-success",
    icon: "bg-success-soft text-success",
    pill: "bg-success text-success-foreground",
  },
  info: {
    bar: "bg-success",
    icon: "bg-success-soft text-success",
    pill: "bg-success text-success-foreground",
  },
};

type PopupProps = {
  open: boolean;
  minimized: boolean;
  title: string;
  icon: ReactNode;
  tone: Tone;
  pillLabel: string;
  /** Position in the stack of minimized pills (0 = lowest). */
  pillIndex?: number;
  onMinimize: () => void;
  onExpand: () => void;
  onClose: () => void;
  children: ReactNode;
};

export function Popup({
  open,
  minimized,
  title,
  icon,
  tone,
  pillLabel,
  pillIndex = 0,
  onMinimize,
  onExpand,
  onClose,
  children,
}: PopupProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const showDialog = open && !minimized;
  const styles = toneStyles[tone];
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!showDialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    node?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const focusables = node.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [showDialog]);

  if (!open) return null;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={onExpand}
        style={{ bottom: `${16 + pillIndex * 60}px` }}
        className={cn(
          "fixed right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg",
          styles.pill,
        )}
        aria-label={`Expand: ${pillLabel}`}
      >
        <span className="shrink-0 [&_svg]:size-4">{icon}</span>
        <span className="truncate">{pillLabel}</span>
        <Maximize2 className="size-4 shrink-0" aria-hidden />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 animate-in fade-in-0">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl animate-in zoom-in-95"
      >
        <div className={cn("h-1.5 w-full", styles.bar)} />
        <div className="flex items-start gap-3 p-5 pb-0">
          <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full [&_svg]:size-6", styles.icon)}>
            {icon}
          </div>
          <h2 id={titleId} className="min-w-0 flex-1 pt-2 text-xl font-bold leading-tight">
            {title}
          </h2>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={onMinimize}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Minimize"
            >
              <Minus className="size-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 shrink-0 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words font-semibold">{value}</span>
    </div>
  );
}
