// Aero Gym - browser notifications (PRD §4.5 settings toggle).
// The toggle itself lives in module state; the permission grant is
// persisted by the browser per origin.

let enabled = false;

export function setNotificationsEnabled(on: boolean) {
  enabled = on;
}

export function isNotificationsEnabled(): boolean {
  return enabled;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

/** Fire a completion notification when enabled and permission was granted. */
export function notifyWorkoutComplete(name: string): void {
  if (typeof window === "undefined") return;
  if (!enabled) return;
  if (!("Notification" in window)) return;
  try {
    if (Notification.permission === "granted") {
      new Notification("Workout complete", {
        body: `${name} - nice work!`,
        icon: "/android-chrome-512x512.png",
      });
    }
  } catch {
    /* ignore */
  }
}
