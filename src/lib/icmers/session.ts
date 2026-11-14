// localStorage holds only the demo login and the mute setting — never emergency requests.
export type Role = "user" | "clinic";
export type Session = { role: Role; id: string };

const SESSION_KEY = "icmers.session";
const MUTE_KEY = "icmers.muted";

export function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if ((parsed.role === "user" || parsed.role === "clinic") && typeof parsed.id === "string" && parsed.id) {
      return { role: parsed.role, id: parsed.id };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveSession(session: Session) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function loadMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}
