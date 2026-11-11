"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateKey, addDays, parseDateKey } from "@/lib/dates";

interface DateHeaderProps {
  date: string;
  onChange: (date: string) => void;
  workoutsCount?: number;
  goal?: number;
}

/**
 * Compact top row (PRD §4.2): centered date with prev/next navigation
 * and a completion progress ring on the right.
 */
export function DateHeader({ date, onChange, workoutsCount = 0, goal = 1 }: DateHeaderProps) {
  const d = parseDateKey(date);
  const label = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const pct = Math.min(100, Math.round((workoutsCount / Math.max(1, goal)) * 100));

  return (
    <div className="flex items-center justify-between rounded-2xl border border-card-border bg-card px-3 py-2">
      <button
        onClick={() => onChange(addDays(date, -1))}
        aria-label="Previous day"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-card-border hover:text-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => onChange(formatDateKey(new Date()))}
        aria-label="Today"
        className="mx-2 text-center"
      >
        <span className="block font-display text-sm font-semibold tracking-wide text-foreground">
          {label}
        </span>
        <span className="block text-[11px] text-muted-2">
          {d.toLocaleDateString(undefined, { year: "numeric" })}
        </span>
      </button>
      <button
        onClick={() => onChange(addDays(date, 1))}
        aria-label="Next day"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-2 transition-colors hover:bg-card-border hover:text-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      {goal > 0 && (
        <div className="relative h-10 w-10">
          <svg className="h-10 w-10 rotate-90" viewBox="0 0 100 100">
            <path
              d="M50 90 a40 40 0 1 1 0.1 0"
              fill="none"
              stroke="var(--color-card-border)"
              strokeWidth="8"
            />
            <path
              d="M50 90 a40 40 0 1 1 0.1 0"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="8"
              strokeDasharray={`${(pct * 251) / 100} 251`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-foreground">
            {pct}%
          </span>
        </div>
      )}
    </div>
  );
}
