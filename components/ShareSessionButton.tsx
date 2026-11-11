"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import type { Workout } from "@/lib/types";
import { buildSessionShareText, shareText } from "@/lib/share";
import { useWeightUnit } from "@/hooks/useUnit";

/**
 * Shares the visible day as a clean text card (PRD §4.7). Uses the Web
 * Share sheet when the browser has one, otherwise copies to clipboard.
 */
export function ShareSessionButton({
  date,
  workouts,
}: {
  date: string;
  workouts: Workout[];
}) {
  const { unit } = useWeightUnit();
  const [shared, setShared] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void shareText(buildSessionShareText(date, workouts, unit)).then((ok) => {
          if (!ok) return;
          setShared(true);
          window.setTimeout(() => setShared(false), 1800);
        });
      }}
      disabled={workouts.length === 0}
      aria-label="Share this session"
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:bg-card-border hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
    >
      {shared ? <Check className="h-3.5 w-3.5 text-accent" aria-hidden /> : <Share2 className="h-3.5 w-3.5" aria-hidden />}
      {shared ? "Shared" : "Share"}
    </button>
  );
}
