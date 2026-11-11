// Aero Gym - date helpers

export function formatDateKey(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addDays(dateKey: string, delta: number): string {
  const d = new Date(dateKey);
  d.setDate(d.getDate() + delta);
  return formatDateKey(d);
}

/** Day-of-year index (0-364), used for cycling daily quotes/photos. */
export function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}
