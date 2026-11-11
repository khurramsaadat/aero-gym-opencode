"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Dumbbell, Scale, TrendingDown, TrendingUp } from "lucide-react";
import type { BodyWeightLog, WorkoutLog } from "@/lib/types";
import {
  STORAGE_KEYS,
  subscribeToStorage,
  useBodyWeight,
  useWorkoutLogs,
} from "@/lib/storage";
import { formatDateKey } from "@/lib/dates";
import { useWeightUnit } from "@/hooks/useUnit";
import {
  bodyWeightSeries,
  dateRange,
  exerciseNames,
  exerciseSeries,
  shortDayLabel,
  type ExercisePoint,
} from "@/lib/analytics";

type ProgressMode = "exercise" | "body";
type RangeKey = "7d" | "4w" | "3m";

const RANGES: Array<{ key: RangeKey; label: string; days: number }> = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "4w", label: "4 weeks", days: 28 },
  { key: "3m", label: "3 months", days: 90 },
];

/**
 * Progress view (PRD §4.9): exercise weight vs body weight, 7-day /
 * 4-week / 3-month ranges, exercise selector, line chart and stat
 * cards. Everything renders from local logs, no account needed.
 */
export function ProgressView() {
  const [mode, setMode] = useState<ProgressMode>("exercise");
  const [range, setRange] = useState<RangeKey>("4w");
  const [today, setToday] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkoutLog>(() => useWorkoutLogs.get());
  const [weights, setWeights] = useState<BodyWeightLog>(() => useBodyWeight.get());
  const { unit, toDisplay } = useWeightUnit();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(formatDateKey(new Date()));
    setLogs(useWorkoutLogs.get());
    setWeights(useBodyWeight.get());
  }, []);

  useEffect(() => {
    const unsubLogs = subscribeToStorage(STORAGE_KEYS.workoutLogs, () => setLogs(useWorkoutLogs.get()));
    const unsubBody = subscribeToStorage(STORAGE_KEYS.bodyWeight, () => setWeights(useBodyWeight.get()));
    return () => {
      unsubLogs();
      unsubBody();
    };
  }, []);

  const names = useMemo(() => exerciseNames(logs), [logs]);
  const activeExercise = selected ?? names[0] ?? "";
  const rangeDays = RANGES.find((r) => r.key === range)?.days ?? 28;
  const days = useMemo(() => (today ? dateRange(today, rangeDays) : []), [today, rangeDays]);

  const points = useMemo<ExercisePoint[]>(() => {
    if (!today) return [];
    if (mode === "body") return bodyWeightSeries(weights, days);
    if (!activeExercise) return [];
    return exerciseSeries(logs, activeExercise, days);
  }, [today, mode, weights, logs, activeExercise, days]);

  const chartData = useMemo(
    () =>
      points.map((p) => ({
        date: p.date,
        label: shortDayLabel(p.date),
        value: toDisplay(p.value),
      })),
    [points, toDisplay],
  );

  const stats = useMemo(() => {
    const values = points.map((p) => toDisplay(p.value));
    if (values.length === 0) {
      return { current: 0, best: 0, change: 0, count: 0 };
    }
    const current = values[values.length - 1];
    const first = values[0];
    return {
      current,
      best: mode === "body" ? Math.min(...values) : Math.max(...values),
      change: values.length > 1 ? current - first : 0,
      count: values.length,
    };
  }, [points, toDisplay, mode]);

  if (!today) return null;

  const hasData = chartData.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-0.5 rounded-2xl border border-card-border bg-card p-1">
        <ModeButton
          active={mode === "exercise"}
          icon={Dumbbell}
          label="Exercise weight"
          onClick={() => setMode("exercise")}
        />
        <ModeButton
          active={mode === "body"}
          icon={Scale}
          label="Body weight"
          onClick={() => setMode("body")}
        />
      </div>

      {/* Range toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
          {RANGES.find((r) => r.key === range)?.label}
        </span>
        <div className="inline-flex rounded-xl border border-card-border bg-card p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={`rounded-[10px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                range === r.key ? "bg-accent text-accent-contrast" : "text-muted-2 hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise selector */}
      {mode === "exercise" && (
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted-2">
            Exercise
          </span>
          {names.length === 0 ? (
            <p className="rounded-xl border border-dashed border-card-border bg-card px-3 py-3 text-xs text-muted-2">
              Finish sets on an exercise and it will appear here.
            </p>
          ) : (
            <select
              value={activeExercise}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft"
            >
              {names.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </label>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          label={mode === "body" ? "Current" : "Latest"}
          value={hasData ? `${round(stats.current)} ${unit}` : "-"}
          note={mode === "body" ? "body weight" : activeExercise || "no exercise"}
        />
        <MiniStat
          label={mode === "body" ? "Lowest" : "Best"}
          value={hasData ? `${round(stats.best)} ${unit}` : "-"}
          note={mode === "body" ? "in range" : "heaviest set"}
        />
        <MiniStat
          label="Change"
          value={hasData ? `${stats.change > 0 ? "+" : ""}${round(stats.change)} ${unit}` : "-"}
          note={`${stats.count} ${stats.count === 1 ? "entry" : "entries"}`}
          tone={stats.change > 0 ? "up" : stats.change < 0 ? "down" : "flat"}
        />
      </div>

      {/* Line chart */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-accent" aria-hidden />
            {mode === "body" ? "Body weight trend" : activeExercise || "Progress"}
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
            {unit === "kg" ? "kg" : "lbs"}
          </span>
        </div>
        {hasData ? (
          <div className="mt-2 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke="var(--color-muted-3)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--color-muted-2)", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-muted-3)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "var(--color-muted-2)", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => String(Math.round(v))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-card-border)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 12,
                  }}
                  formatter={(value: unknown): [number, string] | string =>
                    typeof value === "number" ? [round(value), unit] : "-"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-accent)", stroke: "none" }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-2 flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-card-border px-4 text-center">
            <TrendingUp className="h-8 w-8 text-muted-2" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-muted">
              {mode === "body" ? "No body weight logged in this range" : "No completed sets for this range"}
            </p>
            <p className="mt-1 text-xs text-muted-2">
              {mode === "body"
                ? "Log your weight in Measurements and it will chart here."
                : "Pick another exercise or widen the range."}
            </p>
          </div>
        )}
      </section>

      <p className="px-1 text-[11px] text-muted-2">
        {mode === "body"
          ? "Body weight comes from the Measurements panel and stays on this device."
          : "Each point is the heaviest completed set for that day, converted to your display unit."}
      </p>
    </div>
  );
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Dumbbell;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
        active ? "bg-accent text-accent-contrast" : "text-muted-2 hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

function MiniStat({
  label,
  value,
  note,
  tone = "flat",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "up" | "down" | "flat";
}) {
  const Icon = tone === "up" ? TrendingUp : tone === "down" ? TrendingDown : null;
  return (
    <div className="rounded-2xl border border-card-border bg-card px-3 py-2.5">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-2">{label}</span>
      <p className="mt-1 flex items-center gap-1 font-display text-base font-bold leading-none text-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />}
        {value}
      </p>
      <p className="mt-1 truncate text-[10px] text-muted-2" title={note}>
        {note}
      </p>
    </div>
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
