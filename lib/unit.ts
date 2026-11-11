// Aero Gym - unit conversion (PRD §4.1: KG/LBS toggle, auto-converts all data)
// All weights are STORED in KG; LB is a display-only conversion.

export const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Round to a sensible display precision (1 decimal for lb, 2.5 steps for kg plates). */
export function roundDisplayKg(kg: number): number {
  return Math.round(kg * 2) / 2;
}

export function roundDisplayLb(lb: number): number {
  return Math.round(lb);
}

export type WeightUnit = "kg" | "lb";

export function toDisplay(kg: number, unit: WeightUnit): number {
  return unit === "kg" ? roundDisplayKg(kg) : roundDisplayLb(kgToLb(kg));
}

export function toKg(display: number, unit: WeightUnit): number {
  return unit === "kg" ? display : lbToKg(display);
}

/* ------------------------------------------------------------------ */
/*  Length units (PRD §4.5): stored in cm, display cm or in           */
/* ------------------------------------------------------------------ */

export const CM_PER_IN = 2.54;

export type LengthUnit = "cm" | "in";

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_IN;
}

/** Display a stored-cm value in the active length unit. */
export function toDisplayCm(cm: number, unit: LengthUnit): number {
  return unit === "cm" ? Math.round(cm) : Math.round(cmToIn(cm));
}

/** Convert a displayed length value back to stored cm. */
export function toCm(display: number, unit: LengthUnit): number {
  return unit === "cm" ? display : inToCm(display);
}
