import { useId, useState, type FormEvent } from "react";
import { HeartPulse, Lock, LogIn, RotateCcw, Stethoscope, User, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { APP_FULL_NAME, APP_NAME, LOGIN_ERROR } from "@/lib/icmers/constants";
import type { Role } from "@/lib/icmers/session";
import { cn } from "@/lib/utils";
import { ConnectionIndicator } from "./Header";

type Props = {
  connected: boolean;
  onLogin: (role: Role, id: string) => void;
  onResetDemo: () => Promise<void>;
};

const TABS: { role: Role; label: string; icon: typeof User }[] = [
  { role: "user", label: "User", icon: UserRound },
  { role: "clinic", label: "Clinic personnel", icon: Stethoscope },
];

export function LoginScreen({ connected, onLogin, onResetDemo }: Props) {
  const [role, setRole] = useState<Role>("user");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const idField = useId();
  const pwField = useId();
  const errId = useId();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !password) {
      setError(LOGIN_ERROR);
      return;
    }
    setError("");
    onLogin(role, id.trim());
  };

  const reset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await onResetDemo();
      toast.success("Demo data reset for everyone.");
    } catch {
      toast.error("Could not reset demo data. Check your connection and try again.");
    } finally {
      setResetting(false);
    }
  };

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = TABS[(index + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length]!;
    setRole(next.role);
    document.getElementById(`login-tab-${next.role}`)?.focus();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-md p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-header text-header-foreground shadow-emergency">
            <HeartPulse className="size-9" aria-hidden />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-wide text-primary">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{APP_FULL_NAME}</p>
          <div className="mt-3">
            <ConnectionIndicator connected={connected} />
          </div>
        </div>

        <div role="tablist" aria-label="Sign in as" className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {TABS.map((tab, i) => {
            const active = role === tab.role;
            const Icon = tab.icon;
            return (
              <button
                key={tab.role}
                id={`login-tab-${tab.role}`}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => {
                  setRole(tab.role);
                  setError("");
                }}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold transition-colors",
                  active ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate role="tabpanel" aria-labelledby={`login-tab-${role}`}>
          <div>
            <label htmlFor={idField} className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <User className="size-4 text-primary" aria-hidden />
              {role === "user" ? "User ID" : "Staff ID"}
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id={idField}
                value={id}
                onChange={(e) => setId(e.target.value)}
                maxLength={40}
                autoComplete="username"
                placeholder={role === "user" ? "e.g. 25-64946" : "Enter your staff ID"}
                aria-describedby={error ? errId : undefined}
                className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-base outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor={pwField} className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Lock className="size-4 text-primary" aria-hidden />
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id={pwField}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-describedby={error ? errId : undefined}
                className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-base outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && (
            <p id={errId} role="alert" className="rounded-lg bg-primary-soft px-3 py-2 text-sm font-medium text-primary">
              {error}
            </p>
          )}

          <Button type="submit" className="h-12 w-full rounded-xl text-base font-bold">
            <LogIn />
            Log in
          </Button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={reset}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 rounded text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline disabled:opacity-60"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            {resetting ? "Resetting…" : "Reset demo data"}
          </button>
        </div>
      </div>
    </main>
  );
}
