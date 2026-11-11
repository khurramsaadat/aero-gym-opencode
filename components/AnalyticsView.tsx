"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  CalendarCheck,
  Dumbbell,
  Flame,
  Layers,
  TrendingUp,
} from "lucide-react";
import type { WorkoutLog } from "@/lib/types";
import { STORAGE_KEYS, subscribeToStorage, useWorkoutLogs } from "@/lib/storage";
import { formatDateKey } from "@/lib/dates";
import { useWeightUnit } from "@/hooks/useUnit";
import {
  activeDayCount,
  BACK_MUSCLES,
  consistencyInsight,
  currentStreak,
  dateRange,
  formatCompact,
  FRONT_MUSCLES,
  muscleSets,
  muscleVolume,
  shortDayLabel,
  totalSets,
  type AnalyticsRange,
} from "@/lib/analytics";
import { AchievementsPanel } from "./AchievementsPanel";
import { MuscleBalanceDonut } from "./MuscleBalanceDonut";

const RANGES: AnalyticsRange[] = [7, 14, 30];

/**
 * Analytics view (PRD §4.8): range toggle, headline stats, daily
 * volume, front/back muscle split, consistency feedback, 90-day
 * frequency heatmap, volume by muscle, plus the balance donut and
 * achievement badges.
 */
export function AnalyticsView() {
  const [range, setRange] = useState<AnalyticsRange>(7);
  const [today, setToday] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkoutLog>(() => useWorkoutLogs.get());
  const { unit, toDisplay } = useWeightUnit();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(formatDateKey(new Date()));
  }, []);

  useEffect(() => {
    return subscribeToStorage(STORAGE_KEYS.workoutLogs, () => setLogs(useWorkoutLogs.get()));
  }, []);

  const days = useMemo(() => (today ? dateRange(today, range) : []), [today, range]);
  const weekDays = useMemo(() => (today ? dateRange(today, 7) : []), [today]);
  const heatmapDays = useMemo(() => (today ? dateRange(today, 90) : []), [today]);

  const stats = useMemo(() => {
    if (!today) return { active: 0, sets: 0, avg: 0, streak: 0 };
    const sets = totalSets(logs, today, range);
    return {
      active: activeDayCount(logs, today, range),
      sets,
      avg: sets / range,
      streak: currentStreak(logs, today),
    };
  }, [logs, today, range]);

  const volumeData = useMemo(() => {
    return days.map((date) => {
      const workouts = logs[date] ?? [];
      const kg = workouts.reduce(
        (sum, w) =>
          sum +
          w.completedSets.reduce(
            (s, i) => s + w.weight * (w.repsPerSet[i] ?? w.reps),
            0,
          ),
        0,
      );
      return {
        day: date,
        label: shortDayLabel(date),
        volume: toDisplay(kg),
      };
    });
  }, [days, logs, toDisplay]);

  const weekMuscles = useMemo(() => muscleSets(logs, weekDays), [logs, weekDays]);
  const volumeMuscles = useMemo(
    () => muscleVolume(logs, days).slice(0, 8).map((m) => ({ ...m, volume: toDisplay(m.volume) })),
    [logs, days, toDisplay],
  );
  const weeklyVolume = useMemo(
    () =>
      weekDays.reduce((sum, d) => {
        const workouts = logs[d] ?? [];
        return (
          sum +
          workouts.reduce(
            (s, w) =>
              s +
              w.completedSets.reduce(
                (v, i) => v + w.weight * (w.repsPerSet[i] ?? w.reps),
                0,
              ),
            0,
          )
        );
      }, 0),
    [logs, weekDays],
  );
  const bestDay = useMemo(
    () => volumeData.reduce((best, d) => (d.volume > best.volume ? d : best), volumeData[0]),
    [volumeData],
  );
  const insight = useMemo(
    () => (today ? consistencyInsight(logs, today, range) : ""),
    [logs, today, range],
  );

  if (!today) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Range toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
          Last {range} days
        </span>
        <div className="inline-flex rounded-xl border border-card-border bg-card p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`rounded-[10px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                range === r ? "bg-accent text-accent-contrast" : "text-muted-2 hover:text-foreground"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={CalendarCheck}
          label="Active days"
          value={`${stats.active}/${range}`}
          note={`${stats.streak} day streak`}
        />
        <StatCard icon={Layers} label="Sets done" value={String(stats.sets)} note="completed" />
        <StatCard
          icon={Activity}
          label="Avg / day"
          value={stats.avg.toFixed(1)}
          note="sets per day"
        />
      </div>

      {/* Daily volume */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <BarChartIcon />
            Volume
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
            {unit === "kg" ? "kg" : "lbs"}
          </span>
        </div>
        <div className="mt-2 h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 6, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="var(--color-muted-3)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--color-muted-2)", fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-muted-3)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted-2)", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <Tooltip
                cursor={{ fill: "var(--color-accent-soft)" }}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-card-border)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontSize: 12,
                }}
                formatter={(value: unknown): [number, string] | string =>
                  typeof value === "number" ? [Math.round(value), unit] : "-"
                }
                labelFormatter={(label) => String(label)}
              />
              <Bar dataKey="volume" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-[11px] text-muted-2">
          {bestDay && bestDay.volume > 0
            ? `Best day: ${shortDayLabel(bestDay.day)} at ${formatCompact(bestDay.volume)} ${unit}.`
            : "Complete sets to see your daily volume."}
        </p>
      </section>

      {/* Muscles worked this week */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <Dumbbell className="h-4 w-4 text-accent" aria-hidden />
            Muscles worked
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">7 days</span>
        </div>
        {weekMuscles.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-card-border px-3 py-6 text-center text-xs text-muted-2">
            Finish a few sets to map your front and back coverage.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <MuscleColumn title="Front" rows={weekMuscles} names={FRONT_MUSCLES} />
            <MuscleColumn title="Back" rows={weekMuscles} names={BACK_MUSCLES} />
          </div>
        )}
        <p className="mt-2 text-[11px] text-muted-2">
          {formatCompact(toDisplay(weeklyVolume))} {unit} lifted this week.
        </p>
      </section>

      {/* Consistency insight */}
      <section className="flex items-start gap-3 rounded-2xl border border-accent-soft bg-accent-soft/40 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast">
          <TrendingUp className="h-4.5 w-4.5" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-sm font-bold text-foreground">Consistency</h2>
          <p className="mt-1 text-xs text-muted">{insight}</p>
        </div>
      </section>

      {/* 90-day heatmap */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <Flame className="h-4 w-4 text-accent" aria-hidden />
            Frequency
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">90 days</span>
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
          {chunk(heatmapDays, 7).map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((date) => {
                const sets = (logs[date] ?? []).reduce(
                  (sum, w) => sum + w.completedSets.length,
                  0,
                );
                const level = sets === 0 ? 0 : sets <= 3 ? 1 : sets <= 6 ? 2 : sets <= 9 ? 3 : 4;
                return (
                  <div
                    key={date}
                    title={`${date}: ${sets} ${sets === 1 ? "set" : "sets"}`}
                    className={`h-3.5 w-3.5 rounded-sm ${HEAT_LEVELS[level]}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-2">
          Less
          {HEAT_LEVELS.map((cls, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
          ))}
          More
        </div>
      </section>

      {/* Volume by muscle */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <BarChartIcon />
            Volume by muscle
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
            {unit === "kg" ? "kg" : "lbs"}
          </span>
        </div>
        {volumeMuscles.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-card-border px-3 py-6 text-center text-xs text-muted-2">
            Log weighted sets to compare muscle group volume.
          </p>
        ) : (
          <div className="mt-2 w-full" style={{ height: Math.max(160, volumeMuscles.length * 28) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeMuscles}
                layout="vertical"
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={74}
                  tick={{ fontSize: 10, fill: "var(--color-muted-2)", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-accent-soft)" }}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-card-border)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 12,
                  }}
                  formatter={(value: unknown): [number, string] | string =>
                    typeof value === "number" ? [Math.round(value), unit] : "-"
                  }
                />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                  {volumeMuscles.map((entry, i) => (
                    <Cell key={entry.name} fill={i === 0 ? "var(--color-accent)" : "var(--color-muted-3)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Balance + achievements */}
      <MuscleBalanceDonut />
      <AchievementsPanel />
    </div>
  );
}

function BarChartIcon() {
  return <Layers className="h-4 w-4 text-accent" aria-hidden />;
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-2">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 font-display text-xl font-bold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-[10px] text-muted-2">{note}</p>
    </div>
  );
}

function MuscleColumn({
  title,
  rows,
  names,
}: {
  title: string;
  rows: Array<{ name: string; sets: number }>;
  names: readonly string[];
}) {
  const map = new Map(rows.map((r) => [r.name, r.sets]));
  const max = Math.max(1, ...names.map((n) => map.get(n) ?? 0));
  return (
    <div>
      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-2">{title}</p>
      <div className="space-y-1.5">
        {names.map((name) => {
          const sets = map.get(name) ?? 0;
          return (
            <div key={name}>
              <div className="flex items-center justify-between text-[10px]">
                <span className={sets > 0 ? "font-semibold text-foreground" : "text-muted-2"}>{name}</span>
                <span className="text-muted-2">{sets}</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-card-border">
                <div
                  className={`h-full rounded-full ${title === "Front" ? "bg-accent" : "bg-accent/45"}`}
                  style={{ width: `${Math.round((sets / max) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HEAT_LEVELS = [
  "bg-card-border/50",
  "bg-accent/25",
  "bg-accent/50",
  "bg-accent/75",
  "bg-accent",
];

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
