"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";
import type { BodyMeasurement } from "@/lib/types";
import {
  STORAGE_KEYS,
  subscribeToStorage,
  useBodyWeight,
  useMeasurements,
  useSettings,
} from "@/lib/storage";
import { formatDateKey } from "@/lib/dates";
import { emitMeasurementsChanged } from "@/lib/events";
import { cmToIn, toDisplay, toDisplayCm, toKg, toCm, type LengthUnit, type WeightUnit } from "@/lib/unit";
import { ScrollPicker } from "./ScrollPicker";

interface MeasurementField {
  key: keyof BodyMeasurement;
  label: string;
  /** range in stored cm */
  minCm: number;
  maxCm: number;
}

/** The 12 tape measurements (PRD §4.5 / §6 BodyMeasurement). */
const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: "neck", label: "Neck", minCm: 20, maxCm: 60 },
  { key: "shoulders", label: "Shoulders", minCm: 60, maxCm: 200 },
  { key: "chest", label: "Chest", minCm: 50, maxCm: 200 },
  { key: "waist", label: "Waist", minCm: 40, maxCm: 200 },
  { key: "hips", label: "Hips", minCm: 50, maxCm: 200 },
  { key: "leftArm", label: "Left Arm", minCm: 15, maxCm: 80 },
  { key: "rightArm", label: "Right Arm", minCm: 15, maxCm: 80 },
  { key: "forearm", label: "Forearm", minCm: 15, maxCm: 60 },
  { key: "wrist", label: "Wrist", minCm: 10, maxCm: 30 },
  { key: "leftThigh", label: "Left Thigh", minCm: 20, maxCm: 100 },
  { key: "rightThigh", label: "Right Thigh", minCm: 20, maxCm: 100 },
  { key: "calves", label: "Calves", minCm: 15, maxCm: 100 },
];

type ActivePicker =
  | { kind: "weight" }
  | { kind: "height" }
  | { kind: "field"; field: MeasurementField }
  | null;

/** Weight range in stored kg; Height range in stored cm. */
const WEIGHT_MIN_KG = 20;
const WEIGHT_MAX_KG = 300;
const HEIGHT_MIN_CM = 100;
const HEIGHT_MAX_CM = 220;

/**
 * Measurements widget (PRD §4.5): weight + height rows with KG/LBS and
 * CM/IN toggles, plus 12 tap-to-edit tape fields. Every change autosaves
 * and emits `aero:measurements-changed` so the BMI card updates live.
 */
export function MeasurementsPanel() {
  const dateRef = useRef<string | null>(null);
  const [weightKg, setWeightKg] = useState(0);
  const [heightCm, setHeightCmState] = useState(() => useSettings.getHeightCm());
  const [measurements, setMeasurementsState] = useState<BodyMeasurement | null>(() => useMeasurements.latest());
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(() => useSettings.getWeightUnit());
  const [lengthUnit, setLengthUnitState] = useState<LengthUnit>(() => useSettings.getLengthUnit());
  const [active, setActive] = useState<ActivePicker>(null);

  // Refresh every value from storage. Runs on mount, on the shared
  // measurements-changed event, and on any related storage write.
  const refresh = useCallback(() => {
    const d = dateRef.current;
    if (!d) return;
    setWeightKg(useBodyWeight.get()[d] ?? 0);
    setHeightCmState(useSettings.getHeightCm());
    setMeasurementsState(useMeasurements.latest());
    setWeightUnitState(useSettings.getWeightUnit());
    setLengthUnitState(useSettings.getLengthUnit());
  }, []);

  useEffect(() => {
    const today = formatDateKey(new Date());
    dateRef.current = today;
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChanged = () => refresh();
    window.addEventListener("aero:measurements-changed", onChanged);
    const unsubs = [
      subscribeToStorage(STORAGE_KEYS.bodyWeight, refresh),
      subscribeToStorage(STORAGE_KEYS.measurements, refresh),
      subscribeToStorage(STORAGE_KEYS.height, refresh),
      subscribeToStorage(STORAGE_KEYS.weightUnit, refresh),
      subscribeToStorage(STORAGE_KEYS.lengthUnit, refresh),
      subscribeToStorage("units-changed", refresh),
    ];
    return () => {
      window.removeEventListener("aero:measurements-changed", onChanged);
      unsubs.forEach((u) => u());
    };
  }, [refresh]);

  const saveWeight = (storedKg: number) => {
    const d = dateRef.current;
    if (!d) return;
    useBodyWeight.logForToday(d, storedKg);
    setWeightKg(storedKg);
    emitMeasurementsChanged();
    setActive(null);
  };

  const saveHeight = (storedCm: number) => {
    useSettings.setHeightCm(storedCm);
    setHeightCmState(storedCm);
    emitMeasurementsChanged();
    setActive(null);
  };

  const saveField = (field: keyof BodyMeasurement, storedCm: number) => {
    const d = dateRef.current;
    if (!d) return;
    useMeasurements.updateField(d, field, storedCm);
    setMeasurementsState(useMeasurements.latest());
    emitMeasurementsChanged();
    setActive(null);
  };

  const toggleWeightUnit = () => {
    const next: WeightUnit = weightUnit === "kg" ? "lb" : "kg";
    useSettings.setWeightUnit(next);
    setWeightUnitState(next);
  };

  const toggleLengthUnit = () => {
    const next: LengthUnit = lengthUnit === "cm" ? "in" : "cm";
    useSettings.setLengthUnit(next);
    setLengthUnitState(next);
  };

  const weightDisplay = weightKg > 0 ? toDisplay(weightKg, weightUnit) : null;
  const heightDisplay = heightCm > 0 ? toDisplayCm(heightCm, lengthUnit) : null;

  return (
    <section className="rounded-2xl border border-card-border bg-card p-3">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <Scale className="h-4 w-4 text-accent" aria-hidden />
        Measurements
      </h2>

      {/* Weight + height rows with unit toggles */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-card-border bg-background px-2.5 py-2.5 transition-colors hover:border-muted-3">
          <button
            type="button"
            onClick={() => setActive({ kind: "weight" })}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-2"
          >
            Weight
          </button>
          <div className="mt-1 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setActive({ kind: "weight" })}
              className="flex items-baseline gap-1 text-left"
            >
              <span className="text-lg font-bold text-foreground">
                {weightDisplay !== null ? weightDisplay : "-"}
              </span>
            </button>
            <UnitToggle unit={weightUnit} onToggle={toggleWeightUnit} />
          </div>
        </div>
        <div className="rounded-xl border border-card-border bg-background px-2.5 py-2.5 transition-colors hover:border-muted-3">
          <button
            type="button"
            onClick={() => setActive({ kind: "height" })}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-2"
          >
            Height
          </button>
          <div className="mt-1 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setActive({ kind: "height" })}
              className="flex items-baseline gap-1 text-left"
            >
              <span className="text-lg font-bold text-foreground">
                {heightDisplay !== null ? heightDisplay : "-"}
              </span>
            </button>
            <UnitToggle unit={lengthUnit} onToggle={toggleLengthUnit} />
          </div>
        </div>
      </div>

      {/* 12 tape measurements */}
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {MEASUREMENT_FIELDS.map((f) => {
          const stored = measurements?.[f.key] ?? 0;
          const display = stored > 0 ? toDisplayCm(stored, lengthUnit) : null;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive({ kind: "field", field: f })}
              className="flex flex-col items-center justify-center rounded-xl border border-card-border bg-background py-2 transition-colors hover:border-muted-3"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-2">{f.label}</span>
              <span className="mt-0.5 text-xs font-bold text-foreground">
                {display !== null ? display : "+"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll pickers (one open at a time) */}
      {active?.kind === "weight" && (
        <ScrollPicker
          open
          onClose={() => setActive(null)}
          title="Weight"
          unitLabel={weightUnit === "kg" ? "kg" : "lbs"}
          min={weightUnit === "kg" ? WEIGHT_MIN_KG : 44}
          max={weightUnit === "kg" ? WEIGHT_MAX_KG : 661}
          step={weightUnit === "kg" ? 0.5 : 1}
          value={weightKg}
          toDisplay={(v) => toDisplay(v, weightUnit)}
          toStored={(v) => toKg(v, weightUnit)}
          onSelect={saveWeight}
        />
      )}
      {active?.kind === "height" && (
        <ScrollPicker
          open
          onClose={() => setActive(null)}
          title="Height"
          unitLabel={lengthUnit === "cm" ? "cm" : "in"}
          min={lengthUnit === "cm" ? HEIGHT_MIN_CM : 39.5}
          max={lengthUnit === "cm" ? HEIGHT_MAX_CM : 86.5}
          step={lengthUnit === "cm" ? 0.5 : 0.5}
          value={heightCm}
          toDisplay={(v) => toDisplayCm(v, lengthUnit)}
          toStored={(v) => toCm(v, lengthUnit)}
          onSelect={saveHeight}
        />
      )}
      {active?.kind === "field" && (
        <ScrollPicker
          open
          onClose={() => setActive(null)}
          title={active.field.label}
          unitLabel={lengthUnit === "cm" ? "cm" : "in"}
          min={lengthUnit === "cm" ? active.field.minCm : Math.ceil(cmToIn(active.field.minCm) * 2) / 2}
          max={lengthUnit === "cm" ? active.field.maxCm : Math.floor(cmToIn(active.field.maxCm) * 2) / 2}
          step={0.5}
          value={measurements?.[active.field.key] ?? 0}
          toDisplay={(v) => toDisplayCm(v, lengthUnit)}
          toStored={(v) => toCm(v, lengthUnit)}
          onSelect={(v) => saveField(active.field.key, v)}
        />
      )}
    </section>
  );
}

/** Two-option unit segment (KG/LBS or CM/IN). */
function UnitToggle({
  unit,
  onToggle,
}: {
  unit: WeightUnit | LengthUnit;
  onToggle: () => void;
}) {
  const options: [string, WeightUnit | LengthUnit][] =
    unit === "kg" || unit === "lb"
      ? [["KG", "kg"], ["LBS", "lb"]]
      : [["CM", "cm"], ["IN", "in"]];
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-card-border bg-card p-px">
      {options.map(([label, value]) => {
        const on = unit === value;
        return (
          <button
            key={value}
            type="button"
            onClick={onToggle}
            aria-pressed={on}
            className={`whitespace-nowrap rounded-[5px] px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide transition-colors ${
              on ? "bg-accent text-accent-contrast" : "text-muted-2 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
