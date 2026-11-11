// Aero Gym - haptic feedback (PRD §4.2), navigator.vibrate with graceful
// fallback. Master switch is module state (toggled from Settings, PRD §4.5).

const supported =
  typeof navigator !== "undefined" &&
  typeof navigator.vibrate === "function" &&
  !/iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !/BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

let enabled = true;

const PATTERNS = {
  tap: [10],
  success: [40, 20, 40],
  heavy: [60, 30, 60],
  warning: [80, 40, 80, 40, 80],
} as const;

export function vibrate(pattern: keyof typeof PATTERNS = "tap"): void {
  if (!enabled || !supported) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* ignore */
  }
}

export function isHapticAvailable(): boolean {
  return supported;
}

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export function isHapticsEnabled(): boolean {
  return enabled;
}
