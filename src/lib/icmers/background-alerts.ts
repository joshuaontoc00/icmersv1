// Background alerts for the clinic: desktop notifications + flashing tab title.
import { useEffect, useState } from "react";

export type NotifyPermission = NotificationPermission | "unsupported";

export const FLASH_TITLES = ["ICMERS", "🚨 New emergency!"] as const;
export const FLASH_INTERVAL_MS = 1000;

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function readPermission(): NotifyPermission {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** Must be called from a click handler. Never throws. */
export async function requestNotificationPermission(): Promise<NotifyPermission> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return readPermission();
  }
}

/** A browser notification is shown only when the tab is hidden and permission was granted. */
export function shouldNotify(hidden: boolean, permission: NotifyPermission) {
  return hidden && permission === "granted";
}

/** Title shown at a given flash step: alternates "ICMERS" / "🚨 New emergency!". */
export function flashTitleAt(step: number) {
  return FLASH_TITLES[step % 2]!;
}

/** Shows "New emergency" with building + room. Silently does nothing if blocked or unsupported. */
export function notifyNewEmergency(r: { id: string; building: string; room: string }) {
  if (typeof document === "undefined") return;
  if (!shouldNotify(document.hidden, readPermission())) return;
  try {
    const n = new Notification("New emergency", {
      body: `${r.building} · Room ${r.room}`,
      tag: `icmers-${r.id}`,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Some browsers (e.g. Android Chrome) need a service worker; fall back to popup + title.
  }
}

/** Tracks notification permission after hydration. */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotifyPermission | null>(null);
  useEffect(() => {
    setPermission(readPermission());
  }, []);
  const request = async () => setPermission(await requestNotificationPermission());
  return { permission, request };
}

/**
 * Flashes the tab title while `active` is true and the tab is hidden.
 * Restores the original title when the user returns or `active` turns false.
 */
export function useTitleFlash(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const original = document.title;
    let step = 0;
    let timer: number | null = null;

    const stop = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      document.title = original;
    };
    const start = () => {
      if (timer !== null) return;
      step = 1;
      document.title = flashTitleAt(step);
      timer = window.setInterval(() => {
        step += 1;
        document.title = flashTitleAt(step);
      }, FLASH_INTERVAL_MS);
    };
    const sync = () => (document.hidden ? start() : stop());

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [active]);
}
