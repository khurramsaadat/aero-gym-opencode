"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChartLine } from "lucide-react";
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { BodyMeasurement } from "@/lib/types";
import {
  STORAGE_KEYS,
  subscribeToStorage,
  useBodyWeight,
  useMeasurements,
  useSettings,
} from "@/lib/storage";
import { MEASUREMENTS_CHANGED_EVENT } from "@/lib/events";
import { formatDateKey, addDays } from "@/lib/dates";
import { toDisplay, type WeightUnit } from "@/lib/unit";
import { useWeightUnit } from "@/hooks/useUnit";

/**
 * BMI & Body Composition widget (PRD §4.5): BMI with a color-coded
 * scale, US Navy body-fat estimates (shown for both sexes since no
 * gender is stored), and a 7-day weight trend. Reacts to measurement
 * changes via the shared custom event.
 */
export function BmiCard() {
  const { unit, toDisplay: weightToDisplay } = useWeightUnit();
  const [date, setDate] = useState<string | null>(null);
  const dateRef = useRef<string | null>(null);
  const [weightLog, setWeightLog] = useState(() => useBodyWeight.get());
  const [measurements, setMeasurementsState] = useState<BodyMeasurement | null>(() => useMeasurements.latest());
  const [heightCm, setHeightCm] = useState(() => useSettings.getHeightCm());

  // Current weight: today's entry, falling back to the latest logged day.
  const currentKg = useMemo(() => {
    const d = dateRef.current;
    if (!d) return 0;
    if (weightLog[d]) return weightLog[d];
    const days = Object.keys(weightLog).sort();
    return days.length ? weightLog[days[days.length - 1]] : 0;
  }, [weightLog]);

  const bmi = heightCm > 0 && currentKg > 0 ? currentKg / ((heightCm / 100) ** 2) : null;

  /** US Navy method: log10 of circumference differences, constants per sex. */
  const bodyFat = useMemo(() => {
    const m = measurements;
    if (!m || !m.waist || !m.neck) return null;
    if (m.waist <= m.neck) return null;
    const male = 495 / (86.01 * Math.log10(m.waist - m.neck)) - 450;
    const female =
      m.hips > 0 && m.waist + m.hips > m.neck
        ? 495 / (87.541 * Math.log10(m.waist + m.hips - m.neck)) - 450
        : null;
    return {
      male: Math.min(60, Math.max(0.5, male)),
      female: female === null ? null : Math.min(60, Math.max(0.5, female)),
    };
  }, [measurements]);

  const trend = useMemo(() => {
    const d = dateRef.current;
    if (!d) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(d, i - 6);
      return {
        label: new Date(`${day}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" }),
        kg: weightLog[day] ?? null,
      };
    });
  }, [weightLog]);

  const refresh = useCallback(() => {
    setWeightLog(useBodyWeight.get());
    setMeasurementsState(useMeasurements.latest());
    setHeightCm(useSettings.getHeightCm());
  }, []);

  useEffect(() => {
    const today = formatDateKey(new Date());
    dateRef.current = today;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(today);
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChanged = () => refresh();
    window.addEventListener(MEASUREMENTS_CHANGED_EVENT, onChanged);
    const unsubs = [
      subscribeToStorage(STORAGE_KEYS.bodyWeight, refresh),
      subscribeToStorage(STORAGE_KEYS.measurements, refresh),
      subscribeToStorage(STORAGE_KEYS.height, refresh),
      subscribeToStorage(STORAGE_KEYS.weightUnit, refresh),
    ];
    return () => {
      window.removeEventListener(MEASUREMENTS_CHANGED_EVENT, onChanged);
      unsubs.forEach((u) => u());
    };
  }, [refresh]);

  const hasTrend = trend.filter((t) => t.kg !== null).length >= 2;
  const cat = bmi === null ? null : bmiCategory(bmi);

  return (
    <section className="rounded-2xl border border-card-border bg-card p-3">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <ChartLine className="h-4 w-4 text-accent" aria-hidden />
        BMI &amp; Body Composition
      </h2>

      {/* BMI + color-coded category */}
      {bmi === null ? (
        <p className="mt-3 text-xs text-muted-2">Set your height and weight to see your BMI.</p>
      ) : (
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">BMI</span>
            <span className="font-display text-2xl font-bold text-foreground">{bmi.toFixed(1)}</span>
          </div>
          {cat && (
            <div className="mt-1.5 rounded-lg border border-card-border bg-background px-2 py-1 text-center">
              <span className={`text-xs font-bold uppercase tracking-wider ${cat.className}`}>{cat.label}</span>
            </div>
          )}
        </div>
      )}

      {/* Navy body-fat estimate (both sexes, nothing stored) */}
      {bodyFat && (
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <div className="rounded-xl border border-card-border bg-background px-2 py-1.5 text-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-2">Body fat (Navy)</span>
            <div className="mt-0.5 flex items-baseline justify-center gap-1">
              <span className="text-sm font-bold text-foreground">{bodyFat.male.toFixed(1)}%</span>
              <span className="rounded-full border border-card-border bg-card px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-muted-2">
                Male
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-card-border bg-background px-2 py-1.5 text-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-2">Body fat (Navy)</span>
            <div className="mt-0.5 flex items-baseline justify-center gap-1">
              <span className="text-sm font-bold text-foreground">{bodyFat.female !== null ? `${bodyFat.female.toFixed(1)}%` : "-"}</span>
              <span className="rounded-full border border-card-border bg-card px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-muted-2">
                Female
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7-day weight trend */}
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">7-day weight</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
            {unit === "kg" ? "kg" : "lbs"}
          </span>
        </div>
        <div className="mt-2 h-28">
          {hasTrend ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid vertical={false} stroke="var(--color-muted-3)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--color-muted-2)", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-muted-3)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-card-border)",
                    borderRadius: 10,
                    padding: "8px 10px",
                  }}
                  formatter={(value: number | null) =>
                    value === null ? "-" : [weightToDisplay(value), "weight"]
                  }
                  labelFormatter={() => ""}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-accent)", stroke: "none" }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-card-border text-[11px] text-muted-2">
              Log weight over the next days to see the trend here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface BmiCategory {
  label: string;
  className: string;
}

function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return { label: "Underweight", className: "text-[#60A5FA]" };
  if (bmi < 25) return { label: "Normal", className: "text-accent-text" };
  if (bmi < 30) return { label: "Overweight", className: "text-[#F59E0B]" };
  return { label: "Obese", className: "text-destructive" };
}
