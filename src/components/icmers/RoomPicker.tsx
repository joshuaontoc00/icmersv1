import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, DoorOpen, PencilLine } from "lucide-react";
import { OTHERS, OTHERS_LABEL, ROOM_ROWS } from "@/lib/icmers/constants";
import { cn } from "@/lib/utils";

const COLS = 5;
const ROOMS = ROOM_ROWS.flat();
const OTHERS_INDEX = ROOMS.length; // 25

type Props = {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

export function RoomPicker({ value, onChange, invalid }: Props) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelId = useId();
  const panelId = useId();

  const selectedIndex = value === OTHERS ? OTHERS_INDEX : ROOMS.indexOf(value);

  const openPanel = () => {
    setFocusIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Move focus to the active cell when the panel opens or the active cell changes.
  useEffect(() => {
    if (open) cellRefs.current[focusIndex]?.focus();
  }, [open, focusIndex]);

  // Close on outside tap/click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
    // Room numbers return focus to the field; Others hands focus to its text box (parent handles).
    if (next !== OTHERS) triggerRef.current?.focus();
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openPanel();
    }
  };

  const onCellKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (index === OTHERS_INDEX) {
      if (e.key === "ArrowUp") next = OTHERS_INDEX - COLS;
      else if (e.key === "ArrowLeft") next = OTHERS_INDEX - 1;
      else if (e.key === "Home") next = 0;
      else return;
    } else {
      const row = Math.floor(index / COLS);
      const col = index % COLS;
      switch (e.key) {
        case "ArrowRight":
          next = col < COLS - 1 ? index + 1 : row < 4 ? index + 1 : OTHERS_INDEX;
          break;
        case "ArrowLeft":
          next = index > 0 ? index - 1 : index;
          break;
        case "ArrowDown":
          next = row < 4 ? index + COLS : OTHERS_INDEX;
          break;
        case "ArrowUp":
          next = row > 0 ? index - COLS : index;
          break;
        case "Home":
          next = row * COLS;
          break;
        case "End":
          next = row * COLS + COLS - 1;
          break;
        default:
          return;
      }
    }
    e.preventDefault();
    setFocusIndex(next);
  };

  const display = value === OTHERS ? "Others" : value;

  return (
    <div ref={wrapRef} className="relative">
      <span id={labelId} className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
        <DoorOpen className="size-4 text-primary" aria-hidden />
        Room
      </span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close(false) : openPanel())}
        onKeyDown={onTriggerKey}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-labelledby={labelId}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-card px-3 text-left text-base",
          invalid ? "border-primary" : "border-input",
          open && "border-primary",
        )}
      >
        <span className={cn("truncate", !display && "text-muted-foreground")}>
          <span className="sr-only">Room: </span>
          {display || "Select room"}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose a room"
          className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          <div role="grid" aria-labelledby={labelId} className="space-y-1.5">
            {ROOM_ROWS.map((row, r) => (
              <div role="row" key={r} className="grid grid-cols-5 gap-1.5">
                {row.map((room, c) => {
                  const index = r * COLS + c;
                  const selected = value === room;
                  return (
                    <div role="gridcell" key={room} className="min-w-0">
                      <button
                        ref={(el) => {
                          cellRefs.current[index] = el;
                        }}
                        type="button"
                        tabIndex={focusIndex === index ? 0 : -1}
                        aria-pressed={selected}
                        onClick={() => choose(room)}
                        onKeyDown={(e) => onCellKey(e, index)}
                        onFocus={() => setFocusIndex(index)}
                        className={cn(
                          "flex min-h-11 w-full items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted/60 text-foreground hover:border-primary/50 hover:bg-primary-soft",
                        )}
                      >
                        {room}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <button
            ref={(el) => {
              cellRefs.current[OTHERS_INDEX] = el;
            }}
            type="button"
            tabIndex={focusIndex === OTHERS_INDEX ? 0 : -1}
            aria-pressed={value === OTHERS}
            onClick={() => choose(OTHERS)}
            onKeyDown={(e) => onCellKey(e, OTHERS_INDEX)}
            onFocus={() => setFocusIndex(OTHERS_INDEX)}
            className={cn(
              "mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors",
              value === OTHERS
                ? "border-primary bg-primary text-primary-foreground"
                : "border-dashed border-primary/50 text-primary hover:bg-primary-soft",
            )}
          >
            <PencilLine className="size-4" aria-hidden />
            {OTHERS_LABEL}
          </button>
        </div>
      )}
    </div>
  );
}
