"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Copy, CheckCircle } from "lucide-react";
import type { Workout, FavoriteExercise } from "@/lib/types";
import { useWorkoutLogs, subscribeToStorage, useFavorites } from "@/lib/storage";
import { formatDateKey, addDays, isSameDay } from "@/lib/dates";
import { getDailyQuote } from "@/lib/quotes";
import { useWeightUnit } from "@/hooks/useUnit";
import { DateHeader } from "./DateHeader";
import { MotivationalBanner } from "./MotivationalBanner";
import { StreakBanner } from "./StreakBanner";
import { SummaryCards } from "./SummaryCards";
import { FavoritesBar } from "./FavoritesBar";
import { WorkoutCard } from "./WorkoutCard";
import { WorkoutTimer } from "./WorkoutTimer";
import { RestTimer } from "./RestTimer";
import { WorkoutNotes } from "./WorkoutNotes";
import { AddWorkoutModal } from "./AddWorkoutModal";
import { UndoToast } from "./UndoToast";

interface WorkoutsViewProps {
  onOpenWeather: () => void;
}

const WEEKLY_GOAL = 4;

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Workouts tab (PRD §4.2): the full daily-log screen - date header,
 * motivational banner, streak, summaries, quick-add favorites, the
 * workout list with set tracking, timers, and session notes.
 *
 * Date state is null-initialized and set in a mount effect: Next.js 16
 * rejects `new Date()` during prerender of static routes, so no date
 * may be read at module or first-render time.
 */
export function WorkoutsView({ onOpenWeather }: WorkoutsViewProps) {
  const [date, setDate] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const [pendingUndo, setPendingUndo] = useState<{ date: string; workouts: Workout[] } | null>(null);
  const { unit, setUnit, toDisplay } = useWeightUnit();

  // Mount-effect date init (see note above).
  useEffect(() => {
    setDate(formatDateKey(new Date()));
  }, []);

  // Re-read logs when any component writes to storage.
  useEffect(() => {
    return subscribeToStorage("myWorkoutLogs", () => setVersion((v) => v + 1));
  }, []);

  const logs = useMemo(() => useWorkoutLogs.get(), [version]);
  const dayWorkouts = useMemo(() => (date ? logs[date] ?? [] : []), [logs, date]);
  const quote = useMemo(() => (date ? getDailyQuote() : ""), [date]);

  const streak = useMemo(() => {
    if (!date) return 0;
    let count = 0;
    let cursor = date;
    while (logs[cursor]?.length) {
      count++;
      cursor = addDays(cursor, -1);
    }
    return count;
  }, [logs, date]);

  const completedThisWeek = useMemo(() => {
    if (!date) return 0;
    const weekStart = addDays(date, -new Date(date).getDay());
    let count = 0;
    let cursor = weekStart;
    while (!isSameDay(cursor, addDays(date, 1))) {
      if (logs[cursor]?.length) count++;
      cursor = addDays(cursor, 1);
    }
    return count;
  }, [logs, date]);

  const persist = useCallback(
    (workouts: Workout[]) => {
      if (!date) return;
      useWorkoutLogs.updateDay(date, workouts);
    },
    [date],
  );

  const updateWorkout = useCallback(
    (id: string, patch: Partial<Workout>) => {
      if (!date) return;
      const next = dayWorkouts.map((w) => (w.id === id ? { ...w, ...patch } : w));
      persist(next);
    },
    [date, dayWorkouts, persist],
  );

  const moveWorkout = useCallback(
    (id: string, dir: "up" | "down") => {
      if (!date) return;
      const idx = dayWorkouts.findIndex((w) => w.id === id);
      if (idx === -1) return;
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= dayWorkouts.length) return;
      const next = [...dayWorkouts];
      [next[idx], next[target]] = [next[target], next[idx]];
      persist(next);
    },
    [date, dayWorkouts, persist],
  );

  const removeWorkout = useCallback(
    (id: string) => {
      if (!date) return;
      const removed = dayWorkouts.find((w) => w.id === id);
      if (!removed) return;
      persist(dayWorkouts.filter((w) => w.id !== id));
      setPendingUndo({ date, workouts: dayWorkouts.filter((w) => w.id !== id) });
    },
    [date, dayWorkouts, persist],
  );

  const undoDelete = useCallback(() => {
    if (!pendingUndo) return;
    useWorkoutLogs.updateDay(pendingUndo.date, pendingUndo.workouts);
    setPendingUndo(null);
  }, [pendingUndo]);

  /** Previous best for an exercise name, from the most recent past day. */
  const prevBest = useCallback(
    (name: string): { weight: number; reps: number } => {
      if (!date) return { weight: 0, reps: 0 };
      const days = Object.keys(logs).filter((d) => d < date).sort().reverse();
      for (const d of days) {
        const found = logs[d].find((w) => w.name === name);
        if (found) return { weight: found.weight, reps: found.reps };
      }
      return { weight: 0, reps: 0 };
    },
    [logs, date],
  );

  const addWorkout = useCallback(
    (spec: {
      name: string;
      category: string;
      weight: number;
      reps: number;
      sets: number;
      duration: number;
      equipment?: Workout["equipment"];
    }) => {
      if (!date) return;
      const prev = prevBest(spec.name);
      const workout: Workout = {
        id: makeId(),
        name: spec.name,
        category: spec.category,
        weight: spec.weight,
        duration: spec.duration,
        reps: spec.reps,
        repsPerSet: [],
        sets: spec.sets,
        completedSets: [],
        setTypes: [],
        prevWeight: prev.weight,
        prevReps: prev.reps,
        equipment: spec.equipment,
        muscles: [],
      };
      persist([...dayWorkouts, workout]);
      setAddOpen(false);
    },
    [date, dayWorkouts, prevBest, persist],
  );

  /** One-tap copy of the most recent previous day's plan (PRD §4.2). */
  const copyPrevious = useCallback(() => {
    if (!date) return;
    const days = Object.keys(logs).filter((d) => d < date).sort().reverse();
    const source = days.find((d) => logs[d]?.length);
    if (!source) return;
    const copied: Workout[] = logs[source].map((w) => ({
      ...w,
      id: makeId(),
      completedSets: [],
      repsPerSet: [],
      setTypes: [],
      prevWeight: w.weight,
      prevReps: w.reps,
    }));
    persist(copied);
  }, [date, logs, persist]);

  const toggleFavorite = useCallback(
    (w: Workout) => {
      const favs = useFavorites.get();
      const existing = favs.findIndex((f) => f.name === w.name);
      if (existing >= 0) {
        const next = favs.filter((f) => f.name !== w.name);
        useFavorites.set(next);
      } else {
        const fav: FavoriteExercise = {
          name: w.name,
          category: w.category,
          weight: w.weight,
          reps: w.reps,
          duration: w.duration,
          sets: w.sets,
        };
        useFavorites.set([...favs, fav]);
      }
    },
    [],
  );

  if (!date) return null;

  const isEmpty = dayWorkouts.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Date header with navigation + progress ring */}
      <DateHeader
        date={date}
        onChange={(d) => {
          setDate(d);
          setEditMode(false);
        }}
        workoutsCount={dayWorkouts.length}
        goal={1}
      />

      {/* Motivational banner (desktop only) */}
      <MotivationalBanner quote={quote} />

      {/* Streak banner */}
      <StreakBanner streak={streak} weeklyGoal={WEEKLY_GOAL} completedThisWeek={completedThisWeek} />

      {/* Summary pills */}
      <SummaryCards workouts={dayWorkouts} onOpenWeather={onOpenWeather} />

      {/* Favorites quick-add */}
      <FavoritesBar
        onAdd={(fav) =>
          addWorkout({
            name: fav.name,
            category: fav.category,
            weight: fav.weight,
            reps: fav.reps,
            sets: fav.sets,
            duration: fav.duration,
            equipment: undefined,
          })
        }
      />

      {/* Empty state: copy previous day */}
      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-card-border bg-card px-4 py-6 text-center">
          <Copy className="mx-auto mb-2 h-8 w-8 text-muted-2" />
          <p className="text-sm font-semibold text-muted">Nothing logged for this day</p>
          <p className="mt-1 text-sm text-muted-2">Start fresh or copy your last session.</p>
          <button
            onClick={copyPrevious}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent-soft bg-accent-soft/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-text transition-colors hover:scale-105"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Copy previous workout
          </button>
        </div>
      )}

      {/* Workout list */}
      <div className="space-y-3">
        {!isEmpty && (
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">
              Today&apos;s plan
            </h2>
            <button
              onClick={() => setEditMode((e) => !e)}
              className="rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:bg-card-border hover:text-foreground"
            >
              {editMode ? "Done" : "Edit"}
            </button>
          </div>
        )}
        {dayWorkouts.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            editMode={editMode}
            unit={unit}
            onUnitChange={setUnit}
            onChange={(patch) => updateWorkout(w.id, patch)}
            onRemove={() => removeWorkout(w.id)}
            onMove={(dir) => moveWorkout(w.id, dir)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Timers + notes */}
      <div className="grid gap-3 sm:grid-cols-2">
        <WorkoutTimer />
        <RestTimer />
        <WorkoutNotes date={date} className="sm:col-span-2" />
      </div>

      {/* Add Exercise FAB */}
      <button
        onClick={() => setAddOpen(true)}
        aria-label="Add exercise"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-text shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-transform hover:scale-110 xl:right-8 xl:bottom-8"
      >
        <Plus className="h-7 w-7" />
      </button>

      <AddWorkoutModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addWorkout} />

      {pendingUndo && <UndoToast onUndo={undoDelete} />}
    </div>
  );
}
