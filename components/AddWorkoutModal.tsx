"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { LocalExercise } from "@/lib/exercise-db";
import { getWgerIdOverride } from "@/lib/exercise-db";
import type { Equipment, WorkoutCategory } from "@/lib/types";
import type { WgerExercise, WgerSearchHit } from "@/lib/types";
import {
  categoryForWgerMuscles,
  fetchWgerExercise,
  isUsableImageUrl,
  mapWgerEquipment,
} from "@/lib/wger";
import { Modal } from "./Modal";
import { ExerciseSearch, type SearchSelectable } from "./ExerciseSearch";

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
    exerciseId?: number;
    image?: string;
    muscles?: string[];
    musclesSecondary?: string[];
  }) => void;
}

type Selected =
  | { kind: "local"; data: LocalExercise; image?: string }
  | { kind: "wger"; hit: WgerSearchHit; data: WgerExercise | null };

/**
 * Add Exercise modal (PRD §4.2): 2-step flow.
 * Step 1: dual search (local 200+ + wger.de index). Step 2: confirm name
 * with wger preview image, equipment selector, sets/reps/duration, add.
 */
export function AddWorkoutModal({ open, onClose, onAdd }: AddWorkoutModalProps) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Selected | null>(null);
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

  const handleSelect = (ex: SearchSelectable) => {
    if (ex.kind === "local") {
      setSelected({
        kind: "local",
        data: ex.data,
        image: undefined,
      });
      // Apply the database defaults, otherwise every pick starts at a
      // generic 3 x 10 and cardio exercises are saved with 0 minutes.
      setEquipment(ex.data.equipment);
      setSets(ex.data.sets);
      setReps(ex.data.reps);
      setWeight(ex.data.weight);
      setDuration(ex.data.duration);
    } else {
      // Resolve wger details (muscles, equipment, instructions, image).
      setSelected({ kind: "wger", hit: ex.data, data: null });
    }
    setStep(2);
  };

  // Fetch wger details after a wger selection lands; prefill attributes
  // once the detail arrives.
  useEffect(() => {
    if (!selected || selected.kind !== "wger" || selected.data) return;
    let cancelled = false;
    fetchWgerExercise(selected.hit.id).then((data) => {
      if (cancelled) return;
      setSelected((s) => (s && s.kind === "wger" ? { ...s, data } : s));
      if (!data) return;
      const isCardio = categoryForWgerMuscles(data.muscles) === "Cardio";
      setEquipment(data.equipment[0] ? mapWgerEquipment(data.equipment[0]) : undefined);
      setSets(isCardio ? 1 : 3);
      setReps(isCardio ? 0 : 10);
      setWeight(0);
      setDuration(isCardio ? 30 : 0);
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const rawPreview =
    selected?.kind === "local"
      ? selected.image
      : selected?.kind === "wger"
        ? selected.data?.image
        : undefined;
  const preview = isUsableImageUrl(rawPreview) ? rawPreview : undefined;

  const category: WorkoutCategory | "" =
    selected?.kind === "local"
      ? selected.data.category
      : selected?.kind === "wger" && selected.data
        ? categoryForWgerMuscles(selected.data.muscles)
        : "";

  const handleAdd = () => {
    if (!selected) return;
    if (selected.kind === "local") {
      const d = selected.data;
      onAdd({
        name: d.name,
        category: d.category,
        weight,
        reps,
        sets,
        duration,
        equipment,
        exerciseId: getWgerIdOverride(d.name),
        image: isUsableImageUrl(selected.image) ? selected.image : undefined,
        muscles: d.muscles,
        musclesSecondary: d.musclesSecondary,
      });
    } else {
      const d = selected.data;
      if (!d) return;
      const isCardio = category === "Cardio";
      onAdd({
        name: d.name,
        category,
        weight: isCardio ? 0 : weight,
        reps: isCardio ? 0 : reps,
        sets: isCardio ? 1 : sets,
        duration: isCardio ? duration || 30 : duration,
        equipment,
        exerciseId: d.id,
        image: isUsableImageUrl(d.image) ? d.image : undefined,
        muscles: d.muscles,
        musclesSecondary: d.musclesSecondary,
      });
    }
    handleClose();
  };

  const title =
    step === 1 ? "Add exercise" : selected?.kind === "wger" && !selected.data
      ? "Loading exercise"
      : `Add - ${selected?.kind === "local" ? selected.data.name : selected?.data?.name ?? ""}`;

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {step === 1 && (
        <ExerciseSearch onSelect={handleSelect} label="Search 200+ exercises + wger.de" placeholder="e.g. bench press, squat" />
      )}
      {step === 2 && selected && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-card p-4">
            {preview ? (
              <Image
                src={preview}
                alt={selected.kind === "local" ? selected.data.name : selected.data?.name ?? ""}
                width={80}
                height={80}
                className="h-20 w-20 rounded-xl object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-accent-soft/50 to-card-border text-2xl">
                <span className="text-2xl leading-none text-muted-2">+</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-bold text-foreground">
                {selected.kind === "local" ? selected.data.name : selected.data?.name ?? selected.hit.name}
              </h3>
              <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-2">
                {category}
                {selected.kind === "local"
                  ? ` - ${selected.data.muscles?.slice(0, 3).join(" / ") ?? ""}`
                  : selected.data
                    ? ` - ${selected.data.muscles?.slice(0, 3).join(" / ") ?? ""}`
                    : ""}
              </p>
              {selected.kind === "wger" && !selected.data && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-2 border-t-transparent" />
                  Fetching details from wger.de...
                </p>
              )}
            </div>
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
                        ? "border-accent bg-accent text-accent-contrast"
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
                min={0}
                value={reps}
                onChange={(e) => setReps(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {category === "Cardio" ? (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Minutes</label>
                <input
                  type="number"
                  min={1}
                  value={duration || 30}
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
            disabled={selected.kind === "wger" && !selected.data}
            className="mt-2 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-accent-contrast transition-colors hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
          >
            Add exercise
          </button>
        </div>
      )}
    </Modal>
  );
}
