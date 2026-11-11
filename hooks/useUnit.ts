"use client";

import { useEffect, useState } from "react";
import { toDisplay, toKg, type WeightUnit } from "@/lib/unit";
import { subscribeToStorage, useSettings } from "@/lib/storage";

/**
 * Weight unit (KG/LBS) hook with localStorage persistence (PRD §4.1).
 * All stored data stays in KG; LB is display-only, so switching units
 * never corrupts existing logs.
 */
export function useWeightUnit() {
  const [unit, setUnitState] = useState<WeightUnit>(() => useSettings.getWeightUnit());

  useEffect(() => {
    const unsub = subscribeToStorage("units-changed", () => setUnitState(useSettings.getWeightUnit()));
    return unsub;
  }, []);

  const setUnit = (next: WeightUnit) => {
    setUnitState(next);
    useSettings.setWeightUnit(next);
  };

  return {
    unit,
    setUnit,
    toDisplay: (kg: number) => toDisplay(kg, unit),
    toKg: (display: number) => toKg(display, unit),
  };
}
