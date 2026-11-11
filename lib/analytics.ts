// Aero Gym - derived analytics helpers (PRD §4.8, §4.9).
// Pure functions only: callers pass the "today" date key so nothing
// here reads the clock during render.

import { addDays } from "./dates";
import type { Workout, WorkoutLog } from "./types";

export type AnalyticsRange = 7 | 14 | 30;
export type HistoryRange = "week" | "month" | "all";

export type MuscleSide = "front" | "back";

/** Map any muscle naming (app-style or wger-style) onto app groups. */
const MUSCLE_MAP: Array<[RegExp, string]> = [
  [/bicep|brachialis|forearm/i, "Biceps"],
  [/tricep/i, "Triceps"],
  [/chest|pec/i, "Chest"],
  [/lat|rhomboid|erector/i, "Back"],
  [/deltoid|shoulder|trap/i, "Shoulders"],
  [/quad/i, "Quadriceps"],
  [/hamstring/i, "Hamstrings"],
  [/calf/i, "Calves"],
  [/glute/i, "Glutes"],
  [/ab|oblique|core|hip flexor/i, "Abs"],
  [/cardio/i, "Cardio"],
  [/leg/i, "Hamstrings"],
];

export function muscleGroupFor(name: string): string {
  for (const [re, group] of MUSCLE_MAP) {
    if (re.test(name)) return group;
  }
  return "Other";
}

/** Front/back anatomy split used by the Muscles Worked panel. */
export const FRONT_MUSCLES = ["Chest", "Shoulders", "Biceps", "Abs", "Quadriceps"] as const;
export const BACK_MUSCLES = ["Back", "Triceps", "Glutes", "Hamstrings", "Calves"] as const;

export function repsForSet(w: Workout, index: number): number {
  return w.repsPerSet[index] ?? w.reps;
}

/** Completed volume in stored KG: weight x reps for each finished set. */
export function volumeForWorkout(w: Workout): number {
  return w.completedSets.reduce((sum, i) => sum + w.weight * repsForSet(w, i), 0);
}

export function completedSets(workouts: Workout[]): number {
  return workouts.reduce((sum, w) => sum + w.completedSets.length, 0);
}

export function plannedSets(workouts: Workout[]): number {
  return workouts.reduce((sum, w) => sum + Math.max(0, w.sets), 0);
}

export interface DayStats {
  sets: number;
  planned: number;
  volume: number;
  completion: number;
}

export function dayStats(workouts: Workout[]): DayStats {
  const sets = completedSets(workouts);
  const planned = plannedSets(workouts);
  return {
    sets,
    planned,
    volume: workouts.reduce((sum, w) => sum + volumeForWorkout(w), 0),
    completion: planned > 0 ? Math.min(100, Math.round((sets / planned) * 100)) : 0,
  };
}

/** Date keys oldest to newest, inclusive. */
export function dateRange(end: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDays(end, i - (days - 1)));
}

export function isActive(logs: WorkoutLog, date: string): boolean {
  return (logs[date]?.length ?? 0) > 0;
}

export function activeDayCount(logs: WorkoutLog, end: string, days: number): number {
  return dateRange(end, days).filter((d) => isActive(logs, d)).length;
}

export function totalSets(logs: WorkoutLog, end: string, days: number): number {
  return dateRange(end, days).reduce((sum, d) => sum + completedSets(logs[d] ?? []), 0);
}

export function totalVolume(logs: WorkoutLog, end: string, days: number): number {
  return dateRange(end, days).reduce((sum, d) => {
    const workouts = logs[d] ?? [];
    return sum + workouts.reduce((s, w) => s + volumeForWorkout(w), 0);
  }, 0);
}

export function currentStreak(logs: WorkoutLog, end: string): number {
  let len = 0;
  let cursor = end;
  while (isActive(logs, cursor)) {
    len++;
    cursor = addDays(cursor, -1);
  }
  return len;
}

/** Sets per muscle group, counting each exercise's finished sets. */
export function muscleSets(logs: WorkoutLog, days: string[]): Array<{ name: string; sets: number }> {
  const counts = new Map<string, number>();
  for (const date of days) {
    for (const w of logs[date] ?? []) {
      if (w.completedSets.length === 0) continue;
      const groups = new Set(
        (w.muscles?.length ? w.muscles : [w.category]).map(muscleGroupFor),
      );
      for (const group of groups) {
        counts.set(group, (counts.get(group) ?? 0) + w.completedSets.length);
      }
    }
  }
  return [...counts.entries()]
    .map(([name, sets]) => ({ name, sets }))
    .sort((a, b) => b.sets - a.sets);
}

/** Volume per muscle group, in stored KG. */
export function muscleVolume(logs: WorkoutLog, days: string[]): Array<{ name: string; volume: number }> {
  const counts = new Map<string, number>();
  for (const date of days) {
    for (const w of logs[date] ?? []) {
      const volume = volumeForWorkout(w);
      if (volume <= 0) continue;
      const groups = new Set(
        (w.muscles?.length ? w.muscles : [w.category]).map(muscleGroupFor),
      );
      const share = volume / Math.max(1, groups.size);
      for (const group of groups) {
        counts.set(group, (counts.get(group) ?? 0) + share);
      }
    }
  }
  return [...counts.entries()]
    .map(([name, volume]) => ({ name, volume }))
    .sort((a, b) => b.volume - a.volume);
}

/** Category counts for the History distribution donut. */
export function categorySets(logs: WorkoutLog, days: string[]): Array<{ name: string; value: number }> {
  const counts = new Map<string, number>();
  for (const date of days) {
    for (const w of logs[date] ?? []) {
      if (w.completedSets.length === 0) continue;
      counts.set(w.category, (counts.get(w.category) ?? 0) + w.completedSets.length);
    }
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export interface ExercisePoint {
  date: string;
  value: number;
}

/** Heaviest completed set per day for one exercise, in stored KG. */
export function exerciseSeries(
  logs: WorkoutLog,
  name: string,
  days: string[],
): ExercisePoint[] {
  const points: ExercisePoint[] = [];
  for (const date of days) {
    const matching = (logs[date] ?? []).filter(
      (w) => w.name === name && w.completedSets.length > 0,
    );
    if (matching.length === 0) continue;
    const best = Math.max(...matching.map((w) => w.weight));
    if (best > 0) points.push({ date, value: best });
  }
  return points;
}

export function bodyWeightSeries(
  log: Record<string, number>,
  days: string[],
): ExercisePoint[] {
  return days
    .filter((d) => typeof log[d] === "number" && log[d] > 0)
    .map((d) => ({ date: d, value: log[d] }));
}

/** Unique exercise names with at least one completed set. */
export function exerciseNames(logs: WorkoutLog): string[] {
  const names = new Set<string>();
  for (const workouts of Object.values(logs)) {
    for (const w of workouts) {
      if (w.completedSets.length > 0) names.add(w.name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

/** 7-day consistency sentence for the Analytics view. */
export function consistencyInsight(
  logs: WorkoutLog,
  end: string,
  days: number,
): string {
  const active = activeDayCount(logs, end, days);
  const streak = currentStreak(logs, end);
  const pct = Math.round((active / days) * 100);

  if (active === 0) {
    return `No sessions in the last ${days} days. Log a workout today to start a new streak.`;
  }
  if (pct >= 70) {
    return `Excellent consistency: ${active} of ${days} days trained (${pct}%).${
      streak > 1 ? ` Current streak: ${streak} days.` : ""
    }`;
  }
  if (pct >= 40) {
    return `Solid rhythm: ${active} of ${days} days trained (${pct}%). Two more sessions this week would push you past 70%.`;
  }
  return `You trained ${active} of ${days} days (${pct}%). Small, repeatable sessions beat occasional long ones.`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function shortDayLabel(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function weekdayLabel(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  });
}
