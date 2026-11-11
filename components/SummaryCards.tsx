"use client";

import { useState } from "react";
import { Dumbbell, Timer, Umbrella } from "lucide-react";
import { Modal } from "./Modal";
import type { Workout } from "@/lib/types";

interface SummaryCardsProps {
  workouts: Workout[];
  onOpenWeather: () => void;
}

/**
 * Compact summary pills (PRD §4.2): Exercises / Sets Done / Weather.
 * Exercises and Sets open detail modals; Weather navigates to the
 * full weather page (PRD §4.4).
 */
export function SummaryCards({ workouts, onOpenWeather }: SummaryCardsProps) {
  const [modal, setModal] = useState<"exercises" | "sets" | null>(null);

  const totalSets = workouts.reduce((sum, w) => sum + w.completedSets.length, 0);
  const totalPlanned = workouts.reduce((sum, w) => sum + w.sets, 0);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setModal("exercises")}
          className="flex-1 rounded-2xl border border-card-border bg-card px-3 py-2 text-center"
        >
          <Dumbbell className="mx-auto mb-1 h-4.5 w-4.5 text-muted-2" />
          <span className="block text-xs text-muted-2">
            {workouts.length} <span className="text-foreground">{workouts.length === 1 ? "exercise" : "exercises"}</span>
          </span>
        </button>
        <button
          onClick={() => setModal("sets")}
          className="flex-1 rounded-2xl border border-card-border bg-card px-3 py-2 text-center"
        >
          <Timer className="mx-auto mb-1 h-4.5 w-4.5 text-muted-2" />
          <span className="block text-xs text-muted-2">
            {totalSets}/{totalPlanned} <span className="text-foreground">sets</span>
          </span>
        </button>
        <button
          onClick={onOpenWeather}
          className="flex-1 rounded-2xl border border-card-border bg-card px-3 py-2 text-center"
        >
          <Umbrella className="mx-auto mb-1 h-4.5 w-4.5 text-muted-2" />
          <span className="block text-xs text-muted-2">
            <span className="text-foreground">Weather</span>
          </span>
        </button>
      </div>

      <Modal open={modal === "exercises"} onClose={() => setModal(null)} title="Exercises today">
        <div className="divide-y divide-card-border">
          {workouts.length === 0 ? (
            <p className="py-4 text-sm text-muted-2">No exercises logged for this day yet.</p>
          ) : (
            workouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-2 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">{w.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {w.muscles?.slice(0, 3).map((m) => (
                      <span
                        key={m}
                        className="rounded-full border border-card-border bg-card px-2 py-0.5 text-[11px] text-muted-2"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="rounded-lg border border-card-border bg-background px-2 py-0.5 text-xs text-muted-2">
                  {w.category}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>

      <Modal open={modal === "sets"} onClose={() => setModal(null)} title="Sets progress">
        <div className="space-y-3">
          {workouts.length === 0 ? (
            <p className="py-4 text-sm text-muted-2">No sets logged for this day yet.</p>
          ) : (
            workouts.map((w) => {
              const done = w.completedSets.length;
              const pct = w.sets > 0 ? Math.round((done / w.sets) * 100) : 0;
              return (
                <div key={w.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{w.name}</span>
                    <span className="text-xs text-muted-2">
                      {done}/{w.sets}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-card-border">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </>
  );
}
