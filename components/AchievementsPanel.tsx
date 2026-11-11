"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  CircleDollarSign,
  Dumbbell,
  Flag,
  Flame,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Workout, WorkoutLog } from "@/lib/types";
import { STORAGE_KEYS, subscribeToStorage, useWorkoutLogs } from "@/lib/storage";
import { addDays } from "@/lib/dates";

/** The 8 unlockable achievements (PRD §4.5), derived live from the logs. */
const ACHIEVEMENTS: Array<{
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  check: (logs: WorkoutLog) => boolean;
}> = [
  {
    id: "first-workout",
    name: "First Session",
    desc: "Log your first workout",
    icon: Flag,
    check: (logs) => Object.values(logs).some((w) => w.length > 0),
  },
  {
    id: "streak-7",
    name: "Streak Master",
    desc: "Train 7 days in a row",
    icon: Flame,
    check: (logs) => maxStreak(logs) >= 7,
  },
  {
    id: "volume-100",
    name: "100 Sets",
    desc: "Complete 100 sets total",
    icon: Dumbbell,
    check: (logs) =>
      Object.values(logs).reduce((sum, w) => sum + w.reduce((s, x) => s + x.completedSets.length, 0), 0) >= 100,
  },
  {
    id: "pr",
    name: "New PR",
    desc: "Lift more than your previous best",
    icon: TrendingUp,
    check: (logs) =>
      Object.values(logs).some((w) => w.some((x) => x.weight > 0 && x.weight > x.prevWeight)),
  },
  {
    id: "consistency-4",
    name: "Weekly Goal",
    desc: "Hit 4 workout days in one week",
    icon: CheckCircle,
    check: (logs) => {
      const days = Object.keys(logs).filter((d) => logs[d]?.length).sort();
      return days.some((d) => {
        const weekAgo = addDays(d, -6);
        return days.filter((x) => x >= weekAgo && x <= d).length >= 4;
      });
    },
  },
  {
    id: "muscle-8",
    name: "Full Spectrum",
    desc: "Train 8 different muscle groups",
    icon: LayoutGrid,
    check: (logs) => {
      const seen = new Set<string>();
      for (const w of Object.values(logs)) for (const x of w) seen.add(x.category);
      return seen.size >= 8;
    },
  },
  {
    id: "thirty-days",
    name: "30 Days",
    desc: "Work out on 30 different days",
    icon: Calendar,
    check: (logs) => Object.keys(logs).filter((d) => logs[d]?.length).length >= 30,
  },
  {
    id: "heavy-100",
    name: "100 kg Club",
    desc: "Log a 100 kg lift",
    icon: CircleDollarSign,
    check: (logs) => Object.values(logs).some((w) => w.some((x) => x.weight >= 100)),
  },
];

function maxStreak(logs: WorkoutLog): number {
  let best = 0;
  for (const day of Object.keys(logs)) {
    if (!logs[day]?.length) continue;
    let len = 0;
    let cursor = day;
    while (logs[cursor]?.length) {
      len++;
      cursor = addDays(cursor, -1);
    }
    best = Math.max(best, len);
  }
  return best;
}

/** Achievements widget (PRD §4.5): 8 badges that unlock as the logs grow. */
export function AchievementsPanel() {
  const [logs, setLogs] = useState<WorkoutLog>(() => useWorkoutLogs.get());

  useEffect(() => {
    return subscribeToStorage(STORAGE_KEYS.workoutLogs, () => setLogs(useWorkoutLogs.get()));
  }, []);

  const earned = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const a of ACHIEVEMENTS) map.set(a.id, a.check(logs));
    return map;
  }, [logs]);

  return (
    <section className="rounded-2xl border border-card-border bg-card p-3">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <CheckCircle className="h-4 w-4 text-accent" aria-hidden />
        Achievements
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {ACHIEVEMENTS.map((a) => {
          const isEarned = earned.get(a.id);
          return (
            <div
              key={a.id}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${
                isEarned ? "border border-accent-soft bg-accent-soft/40" : "border border-card-border bg-background"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isEarned ? "bg-accent text-accent-text" : "bg-card-border text-muted-2"
                }`}
              >
                <a.icon className="h-4.5 w-4.5" aria-hidden />
              </div>
              <span className="min-w-0">
                <span
                  className={`block truncate text-xs font-bold ${isEarned ? "text-foreground" : "text-muted-2"}`}
                  title={a.name}
                >
                  {a.name}
                </span>
                <span className="block truncate text-[9px] text-muted-2" title={a.desc}>
                  {isEarned ? "Earned" : a.desc}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
