// Aero Gym - date helpers

export function formatDateKey(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Parse a YYYY-MM-DD key as LOCAL midnight (bare dates parse as UTC). */
export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function addDays(dateKey: string, delta: number): string {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + delta);
  return formatDateKey(d);
}

/**
 * Day-of-year index (0-364), used for cycling daily quotes/photos.
 * Uses calendar arithmetic, not elapsed milliseconds, so DST shifts
 * cannot move the index.
 */
export function getDayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 1);
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((today - start) / (1000 * 60 * 60 * 24));
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}
