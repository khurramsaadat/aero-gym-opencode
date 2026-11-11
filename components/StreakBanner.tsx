"use client";

import { Flame, Share2 } from "lucide-react";
import { shareText } from "@/lib/share";

interface StreakBannerProps {
  streak: number;
  weeklyGoal: number;
  completedThisWeek: number;
}

/**
 * Streak banner (PRD §4.2): consecutive-day streak + weekly goal (4
 * days) progress bar + share button.
 */
export function StreakBanner({ streak, weeklyGoal, completedThisWeek }: StreakBannerProps) {
  const pct = weeklyGoal > 0 ? Math.min(100, Math.round((completedThisWeek / weeklyGoal) * 100)) : 0;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-card-border bg-card px-4 py-3">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5">
          <Flame className="h-4 w-4 text-accent-text" />
          <span className="font-display text-lg font-bold tracking-wide text-accent-text">{streak}</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-2">Day streak</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-2">
            {completedThisWeek}/{weeklyGoal} this week
          </span>
          <button
            onClick={() => shareText(`🔥 ${streak}-day streak this week on Aero Gym!`)}
            aria-label="Share streak"
            className="rounded-lg px-2 py-1 text-muted-2 transition-colors hover:bg-card-border hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-card-border">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
