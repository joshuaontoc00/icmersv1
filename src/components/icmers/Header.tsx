import { Bell, HeartPulse, LogOut, User, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_FULL_NAME, APP_NAME } from "@/lib/icmers/constants";
import { cn } from "@/lib/utils";

type HeaderProps = {
  name: string;
  connected: boolean;
  muted: boolean;
  showDot: boolean;
  onToggleMute: () => void;
  onBell: () => void;
  onLogout: () => void;
};

export function ConnectionIndicator({ connected, onHeader }: { connected: boolean; onHeader?: boolean }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold",
        onHeader ? "bg-header-foreground/15 text-header-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      <span className="relative flex size-2">
        {connected && <span className="absolute inset-0 rounded-full bg-success animate-live-ping" />}
        <span className={cn("relative size-2 rounded-full", connected ? "bg-success" : "bg-offline")} />
      </span>
      {connected ? "Live" : "Offline"}
    </span>
  );
}

export function Header({ name, connected, muted, showDot, onToggleMute, onBell, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-header text-header-foreground shadow-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-1.5 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <HeartPulse className="size-6 sm:size-7" aria-hidden />
          <div className="leading-tight">
            <p className="font-display text-lg font-extrabold tracking-wide sm:text-xl">{APP_NAME}</p>
            <p className="hidden text-[11px] opacity-90 sm:block">{APP_FULL_NAME}</p>
          </div>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-0.5 sm:gap-2">
          <ConnectionIndicator connected={connected} onHeader />
          <Button
            variant="header"
            size="icon"
            className="size-9 shrink-0"
            onClick={onToggleMute}
            aria-pressed={muted}
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            title={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="!size-5" /> : <Volume2 className="!size-5" />}
          </Button>
          <Button
            variant="header"
            size="icon"
            className="relative size-9 shrink-0"
            onClick={onBell}
            aria-label={showDot ? "Notifications (pending requests)" : "Notifications"}
            title="Notifications"
          >
            <Bell className="!size-5" />
            {showDot && (
              <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-warning ring-2 ring-header" />
            )}
          </Button>
          <div className="flex min-w-0 items-center gap-1 px-1 text-sm font-semibold" title={name}>
            <User className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">Signed in as </span>
            <span className="min-w-0 truncate">{name}</span>
          </div>
          <Button
            variant="headerOutline"
            size="sm"
            className="h-9 shrink-0 px-2 sm:px-3"
            onClick={onLogout}
            aria-label="Log out"
          >
            <LogOut />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
