// Aero Gym - cross-component custom events (PRD §4.5: BMI card reacts to
// measurement changes via custom events).

/** Dispatched whenever a measurement/weight/height value is saved. */
export const MEASUREMENTS_CHANGED_EVENT = "aero:measurements-changed";

export function emitMeasurementsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MEASUREMENTS_CHANGED_EVENT));
}
