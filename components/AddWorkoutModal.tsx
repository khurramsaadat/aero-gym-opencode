"use client";

import { useState } from "react";
import type { LocalExercise, Equipment } from "@/lib/exercise-db";
import { Modal } from "./Modal";
import { ExerciseSearch } from "./ExerciseSearch";

const EQUIPMENT_OPTIONS: Equipment[] = [
  "Dumbbell",
  "Barbell",
  "Kettlebell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Band",
  "Other",
];

interface AddWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (w: {
    name: string;
    category: string;
    weight: number;
    reps: number;
    sets: number;
    duration: number;
    equipment?: Equipment;
  }) => void;
}

/**
 * Add Exercise modal (PRD §4.2): 2-step flow.
 * Step 1: search the local 200+ database. Step 2: confirm name,
 * equipment selector, sets/reps/duration, then add.
 */
export function AddWorkoutModal({ open, onClose, onAdd }: AddWorkoutModalProps) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<LocalExercise | null>(null);
  const [equipment, setEquipment] = useState<Equipment | undefined>();
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(0);

  const reset = () => {
    setStep(1);
    setSelected(null);
    setEquipment(undefined);
    setSets(3);
    setReps(10);
    setWeight(0);
    setDuration(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelect = (ex: LocalExercise) => {
    setSelected(ex);
    setEquipment(ex.equipment);
    setSets(ex.sets);
    setReps(ex.reps);
    setWeight(ex.weight);
    setDuration(ex.duration);
    setStep(2);
  };

  const handleAdd = () => {
    if (!selected) return;
    onAdd({
      name: selected.name,
      category: selected.category,
      weight,
      reps,
      sets,
      duration,
      equipment,
    });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={step === 1 ? "Add exercise" : `Add - ${selected?.name ?? ""}`}>
      {step === 1 && (
        <ExerciseSearch onSelect={handleSelect} label="Search 200+ exercises" placeholder="e.g. bench press, squat" />
      )}
      {step === 2 && selected && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-card-border bg-card p-4">
            <h3 className="font-display text-base font-bold text-foreground">{selected.name}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-2">
              {selected.category}
              {selected.muscles?.length ? ` - ${selected.muscles.slice(0, 3).join(" / ")}` : ""}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-2">Equipment</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => {
                const on = equipment === eq;
                return (
                  <button
                    key={eq}
                    onClick={() => setEquipment(on ? undefined : eq)}
                    className={`rounded-xl border px-3 py-2 text-center text-sm font-semibold transition-colors ${
                      on
                        ? "border-accent bg-accent text-accent-text"
                        : "border-card-border bg-card text-muted-2 hover:border-muted-3 hover:text-foreground"
                    }`}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Sets</label>
              <input
                type="number"
                min={1}
                max={12}
                value={sets}
                onChange={(e) => setSets(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Reps</label>
              <input
                type="number"
                min={1}
                value={reps}
                onChange={(e) => setReps(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {selected.category === "Cardio" ? (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Minutes</label>
                <input
                  type="number"
                  min={1}
                  value={duration || selected.duration || 30}
                  onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Weight</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="mt-0.5 block text-[10px] text-muted-2">KG</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="mt-2 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-accent-text transition-colors hover:opacity-90"
          >
            Add exercise
          </button>
        </div>
      )}
    </Modal>
  );
}
