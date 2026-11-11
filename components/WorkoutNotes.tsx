"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useDayMeta } from "@/lib/storage";
import { vibrate } from "@/lib/haptics";

interface WorkoutNotesProps {
  date: string;
  className?: string;
}

/**
 * Session notes (PRD §4.2): expandable panel with 5-star day rating
 * and free-text notes. Persisted to `myDayMeta` per day.
 */
export function WorkoutNotes({ date, className }: WorkoutNotesProps) {
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState(() => useDayMeta.getForDay(date));

  useEffect(() => {
    setMeta(useDayMeta.getForDay(date));
  }, [date]);

  const setRating = (rating: number) => {
    vibrate("tap");
    const next = { ...meta, rating };
    setMeta(next);
    useDayMeta.setForDay(date, next);
  };

  const setNote = (note: string) => {
    const next = { ...meta, note: note.trim() };
    setMeta(next);
    useDayMeta.setForDay(date, next);
  };

  return (
    <div className={`rounded-2xl border border-card-border bg-card ${className ?? ""}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-card-border"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-2">
          <Star className="h-3.5 w-3.5" />
          Session notes
        </span>
        <span className="text-xs text-muted-2">
          {meta.rating ? `${meta.rating}/5` : "Rate your day"} - {meta.note ? meta.note.length : 0} chars
        </span>
      </button>

      {open && (
        <div className="border-t border-card-border px-4 pb-4 pt-3">
          <div className="mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-2">How did it feel?</span>
            <div className="mt-1.5 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < (meta.rating ?? 0);
                return (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    aria-label={`Rate ${i + 1} out of 5`}
                    className={`text-2xl transition-colors ${filled ? "text-accent" : "text-muted-3 hover:text-muted-2"}`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>
          <textarea
            value={meta.note ?? ""}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes on the session - energy, pain, what to improve..."
            rows={3}
            className="w-full resize-none rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      )}
    </div>
  );
}
