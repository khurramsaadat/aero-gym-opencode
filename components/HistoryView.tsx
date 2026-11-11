"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History as HistoryIcon, PieChart as PieIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { Workout, WorkoutLog } from "@/lib/types";
import { STORAGE_KEYS, subscribeToStorage, useWorkoutLogs } from "@/lib/storage";
import { formatDateKey } from "@/lib/dates";
import {
  categorySets,
  dateRange,
  dayStats,
  muscleGroupFor,
  shortDayLabel,
  weekdayLabel,
  type HistoryRange,
} from "@/lib/analytics";

interface HistoryViewProps {
  onOpenDay: (date: string) => void;
}

interface MonthRef {
  year: number;
  month: number;
}

const DOT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * History view (PRD §4.6): last-7-days strip, monthly completion grid
 * with muscle-group dots, and a muscle distribution donut with a
 * Week / Month / All toggle. Tapping any day opens it in Workouts.
 */
export function HistoryView({ onOpenDay }: HistoryViewProps) {
  const [today, setToday] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState<MonthRef | null>(null);
  const [distRange, setDistRange] = useState<HistoryRange>("week");
  const [logs, setLogs] = useState<WorkoutLog>(() => useWorkoutLogs.get());

  useEffect(() => {
    const now = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(formatDateKey(now));
    setViewMonth({ year: now.getFullYear(), month: now.getMonth() });
    setLogs(useWorkoutLogs.get());
  }, []);

  useEffect(() => {
    return subscribeToStorage(STORAGE_KEYS.workoutLogs, () => setLogs(useWorkoutLogs.get()));
  }, []);

  const weekDays = useMemo(() => (today ? dateRange(today, 7) : []), [today]);

  const monthDays = useMemo(() => {
    if (!viewMonth) return [];
    return daysOfMonth(viewMonth.year, viewMonth.month);
  }, [viewMonth]);

  const distDays = useMemo(() => {
    if (!today || !viewMonth) return [];
    if (distRange === "week") return dateRange(today, 7);
    if (distRange === "month") return monthDays;
    return Object.keys(logs).filter((d) => (logs[d]?.length ?? 0) > 0);
  }, [distRange, today, viewMonth, monthDays, logs]);

  const distData = useMemo(() => categorySets(logs, distDays), [logs, distDays]);
  const distTotal = useMemo(() => distData.reduce((sum, d) => sum + d.value, 0), [distData]);

  if (!today || !viewMonth) return null;

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const leadingBlanks = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const isCurrentMonth =
    today.slice(0, 7) === `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Last 7 days */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <HistoryIcon className="h-4 w-4 text-accent" aria-hidden />
            Last 7 days
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
            Quick access
          </span>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {weekDays.map((date) => (
            <DayButton
              key={date}
              date={date}
              workouts={logs[date] ?? []}
              onClick={() => onOpenDay(date)}
              isToday={date === today}
              compact
            />
          ))}
        </div>
      </section>

      {/* Month grid */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-foreground">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            {!isCurrentMonth && (
              <button
                onClick={() => {
                  const now = new Date(`${today}T00:00:00`);
                  setViewMonth({ year: now.getFullYear(), month: now.getMonth() });
                }}
                className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:bg-card-border hover:text-foreground"
              >
                Today
              </button>
            )}
            <button
              onClick={() => setViewMonth(addMonths(viewMonth, -1))}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-muted-2 transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border text-muted-2 transition-colors hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d, i) => (
            <span key={`${d}-${i}`} className="text-[9px] font-bold uppercase tracking-widest text-muted-2">
              {d}
            </span>
          ))}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {monthDays.map((date) => (
            <DayButton
              key={date}
              date={date}
              workouts={logs[date] ?? []}
              onClick={() => onOpenDay(date)}
              isToday={date === today}
            />
          ))}
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[9px] text-muted-2">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          <span>Muscle group active that day</span>
          <span className="inline-block h-2 w-2 rounded-full bg-accent-soft" />
          <span>Completion</span>
        </div>
      </section>

      {/* Muscle distribution */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <PieIcon className="h-4 w-4 text-accent" aria-hidden />
            Muscle distribution
          </h2>
          <div className="inline-flex rounded-lg border border-card-border bg-background p-0.5">
            {(["week", "month", "all"] as HistoryRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDistRange(r)}
                aria-pressed={distRange === r}
                className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  distRange === r ? "bg-accent text-accent-contrast" : "text-muted-2 hover:text-foreground"
                }`}
              >
                {r === "week" ? "Week" : r === "month" ? "Month" : "All"}
              </button>
            ))}
          </div>
        </div>

        {distData.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-card-border px-3 py-8 text-center text-xs text-muted-2">
            Complete sets to see how your training splits across muscle groups.
          </p>
        ) : (
          <>
            <div className="mt-1 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={74}
                    paddingAngle={2}
                    label={renderSliceLabel}
                  >
                    {distData.map((entry, i) => (
                      <Cell key={entry.name} fill={DOT_COLORS[i % DOT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-card-border)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      fontSize: 12,
                    }}
                    formatter={(value: unknown): [number, string] | string =>
                      typeof value === "number"
                        ? [value, `${Math.round((value / Math.max(1, distTotal)) * 100)}%`]
                        : "-"
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
              {distData.map((entry, i) => (
                <span key={entry.name} className="flex items-center gap-1 text-[10px] text-muted">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }}
                  />
                  {entry.name}
                  <span className="text-muted-2">{entry.value}</span>
                </span>
              ))}
            </div>
          </>
        )}
        <p className="mt-2 text-center text-[10px] text-muted-2">
          {distTotal} completed {distTotal === 1 ? "set" : "sets"} in range
        </p>
      </section>
    </div>
  );
}

function DayButton({
  date,
  workouts,
  onClick,
  isToday,
  compact = false,
}: {
  date: string;
  workouts: Workout[];
  onClick: () => void;
  isToday: boolean;
  compact?: boolean;
}) {
  const stats = dayStats(workouts);
  const hasWorkouts = workouts.length > 0;
  const groups = [...new Set(workouts.map((w) => muscleGroupFor(w.category)))].slice(0, 4);
  const dayNumber = Number(date.slice(8, 10));

  if (compact) {
    return (
      <button
        onClick={onClick}
        aria-label={`Open ${shortDayLabel(date)}${hasWorkouts ? `, ${stats.completion}% complete` : ""}`}
        className={`flex flex-col items-center gap-0.5 rounded-xl border px-0.5 py-1.5 transition-colors ${
          isToday ? "border-accent bg-accent-soft" : "border-card-border bg-background hover:border-muted-3"
        }`}
      >
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-2">
          {weekdayLabel(date).slice(0, 2)}
        </span>
        <span className={`text-xs font-bold ${isToday ? "text-accent-text" : "text-foreground"}`}>
          {dayNumber}
        </span>
        <span
          className={`rounded px-1 text-[8px] font-bold ${
            hasWorkouts ? "bg-accent-soft text-accent-text" : "text-muted-2"
          }`}
        >
          {hasWorkouts ? `${stats.completion}%` : "-"}
        </span>
        <span className="flex h-1.5 items-center gap-0.5">
          {groups.map((g) => (
            <span
              key={g}
              title={g}
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: dotColor(g) }}
            />
          ))}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={`Open ${shortDayLabel(date)}${hasWorkouts ? `, ${stats.completion}% complete` : ""}`}
      className={`flex min-h-14 flex-col justify-between rounded-lg border p-1 text-left transition-colors ${
        isToday
          ? "border-accent bg-accent-soft/60"
          : hasWorkouts
            ? "border-card-border bg-background hover:border-muted-3"
            : "border-transparent hover:bg-card-border/50"
      }`}
    >
      <span
        className={`text-[10px] font-bold ${
          isToday ? "text-accent-text" : hasWorkouts ? "text-foreground" : "text-muted-2"
        }`}
      >
        {dayNumber}
      </span>
      {hasWorkouts && (
        <span className="text-[8px] font-bold leading-none text-accent-text">{stats.completion}%</span>
      )}
      <span className="flex h-1.5 items-center gap-0.5">
        {groups.map((g) => (
          <span
            key={g}
            title={g}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: dotColor(g) }}
          />
        ))}
      </span>
    </button>
  );
}

function renderSliceLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, percent } = props;
  const pct = percent ?? 0;
  if (pct < 0.08 || cx === undefined || cy === undefined || midAngle === undefined) return null;
  const RADIAN = Math.PI / 180;
  const x = Number(cx) + 57 * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + 57 * Math.sin(-Number(midAngle) * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="var(--color-accent-contrast)"
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight={700}
      fontSize={10}
    >
      {Math.round(pct * 100)}%
    </text>
  );
}

function dotColor(group: string): string {
  let hash = 0;
  for (let i = 0; i < group.length; i++) hash = (hash * 31 + group.charCodeAt(i)) >>> 0;
  return DOT_COLORS[hash % DOT_COLORS.length];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function daysOfMonth(year: number, month: number): string[] {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from(
    { length: count },
    (_, i) => `${year}-${pad(month + 1)}-${pad(i + 1)}`,
  );
}

function addMonths(ref: MonthRef, delta: number): MonthRef {
  const d = new Date(ref.year, ref.month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
