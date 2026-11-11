"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Dumbbell,
  Star,
  StarOff,
  ChevronUp,
  ChevronDown,
  Trash2,
  Check,
  X,
  Share2,
} from "lucide-react";
import type { Workout, SetType, Equipment } from "@/lib/types";
import { getWgerIdOverride } from "@/lib/exercise-db";
import { toDisplay, toKg, type WeightUnit } from "@/lib/unit";
import { vibrate } from "@/lib/haptics";
import { playSetComplete, playPrFanfare, playWorkoutComplete } from "@/lib/sounds";
import { STORAGE_KEYS, subscribeToStorage, useFavorites } from "@/lib/storage";
import { shareText } from "@/lib/share";
import { notifyWorkoutComplete } from "@/lib/notifications";
import { FormGuide } from "./FormGuide";
import { Confetti } from "./Confetti";
import { Modal } from "./Modal";
import { ExerciseSearch, type SearchSelectable } from "./ExerciseSearch";
import {
  fetchWgerExercise,
  isUsableImageUrl,
  mapWgerEquipment,
  categoryForWgerMuscles,
} from "@/lib/wger";

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

const SET_TYPE_LABEL: Record<SetType, string> = {
  normal: "Normal",
  warmup: "Warmup",
  drop: "Drop",
  failure: "Failure",
};

const SET_TYPE_ORDER: SetType[] = ["normal", "warmup", "drop", "failure"];

interface WorkoutCardProps {
  workout: Workout;
  editMode: boolean;
  unit: WeightUnit;
  onUnitChange: (u: WeightUnit) => void;
  onChange: (patch: Partial<Workout>) => void;
  onRemove: (id: string) => void;
  onMove: (dir: "up" | "down") => void;
  onToggleFavorite: (w: Workout) => void;
}

function repsForSet(w: Workout, index: number): number {
  const override = w.repsPerSet[index];
  return override ?? w.reps;
}

/** True when any completed set beats the previous best. */
function isPr(w: Workout): boolean {
  if (w.completedSets.length === 0) return false;
  return w.completedSets.some((i) => {
    const r = repsForSet(w, i);
    return r > w.prevReps || (r === w.prevReps && w.weight > w.prevWeight);
  });
}

export function WorkoutCard({
  workout,
  editMode,
  unit,
  onUnitChange,
  onChange,
  onRemove,
  onMove,
  onToggleFavorite,
}: WorkoutCardProps) {
  const isCardio = workout.category === "Cardio";
  const [favorites, setFavoritesState] = useState(useFavorites.get());
  const isFav = favorites.some((f) => f.name === workout.name);

  useEffect(() => {
    return subscribeToStorage(STORAGE_KEYS.favorites, () => setFavoritesState(useFavorites.get()));
  }, []);

  // Local edit state (synced from props when the workout changes)
  const [name, setName] = useState(workout.name);
  const [weightDisplay, setWeightDisplay] = useState(() => toDisplay(workout.weight, unit));
  const [reps, setReps] = useState(workout.reps);
  const [sets, setSets] = useState(workout.sets);
  const [duration, setDuration] = useState(workout.duration);
  const [repsEditing, setRepsEditing] = useState<number | null>(null);
  const [repsInput, setRepsInput] = useState(0);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const prRef = useRef(false);

  // Prop -> local state sync for the edit form (legit sync pattern).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(workout.name);
    setWeightDisplay(toDisplay(workout.weight, unit));
    setReps(workout.reps);
    setSets(workout.sets);
    setDuration(workout.duration);
  }, [workout, unit]);

  const displayWeight = toDisplay(workout.weight, unit);
  const pr = isPr(workout);
  const hasDrop = workout.setTypes.some((t) => t === "drop");
  const isComplete = !isCardio && workout.completedSets.length >= workout.sets && workout.sets > 0;

  // Confetti burst when the final set lands
  useEffect(() => {
    if (isComplete && !prRef.current) {
      prRef.current = true;
      setJustCompleted(true);
      setConfettiKey((k) => k + 1);
      vibrate("success");
      if (pr) playPrFanfare();
      else playWorkoutComplete();
      notifyWorkoutComplete(workout.name);
    } else if (!isComplete) {
      prRef.current = false;
    }
  }, [isComplete, pr, workout.name]);

  const commit = (patch: Partial<Workout>) => {
    setJustCompleted(false);
    onChange(patch);
  };

  const toggleSet = (index: number) => {
    const done = workout.completedSets.includes(index);
    const next = done
      ? workout.completedSets.filter((i) => i !== index)
      : [...workout.completedSets, index].sort((a, b) => a - b);
    vibrate("tap");
    playSetComplete();
    commit({ completedSets: next });
    if (next.length >= workout.sets && workout.sets > 0) setJustCompleted(true);
  };

  const saveRepsForSet = (index: number, value: number) => {
    const next = [...workout.repsPerSet];
    next[index] = value;
    commit({ repsPerSet: next });
    setRepsEditing(null);
  };

  const cycleSetType = (index: number) => {
    const current = workout.setTypes[index] ?? "normal";
    const nextType = SET_TYPE_ORDER[(SET_TYPE_ORDER.indexOf(current) + 1) % SET_TYPE_ORDER.length];
    const next = [...workout.setTypes];
    next[index] = nextType;
    commit({ setTypes: next });
  };

  const handleWeightCommit = () => {
    const kg = toKg(Number(weightDisplay) || 0, unit);
    commit({ weight: kg });
  };

  const handleSwap = async (ex: SearchSelectable) => {
    if (ex.kind === "local") {
      // User-saved equipment keeps priority; fall back to the local
      // exercise's default, then to whatever was saved before.
      const id = getWgerIdOverride(ex.data.name);
      commit({
        name: ex.data.name,
        category: ex.data.category,
        equipment: ex.data.equipment ?? workout.equipment,
        exerciseId: id,
        image: undefined,
        muscles: ex.data.muscles,
        musclesSecondary: ex.data.musclesSecondary,
      });
      setSwapOpen(false);
      return;
    }
    // wger selection: resolve details, then patch. The wger-provided
    // equipment becomes the stored default - the user can override it
    // afterwards (user-saved value always wins the badge).
    const data = await fetchWgerExercise(ex.data.id);
    commit({
      name: data?.name ?? ex.data.name,
      category: data ? categoryForWgerMuscles(data.muscles) : workout.category,
      equipment: data?.equipment[0] ? mapWgerEquipment(data.equipment[0]) : workout.equipment,
      exerciseId: data?.id,
      image: data?.image,
      muscles: data?.muscles,
      musclesSecondary: data?.musclesSecondary,
    });
    setSwapOpen(false);
  };

  return (
    <div
      className={`group relative rounded-2xl border border-card-border bg-card transition-all duration-300 ${
        isComplete ? "border-accent-soft/60 ring-1 ring-accent-soft/40" : ""
      }`}
    >
      {confettiKey > 0 && justCompleted && (
        <Confetti particleCount={90} duration={1800} onDone={() => setJustCompleted(false)} />
      )}

      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        {isUsableImageUrl(workout.image) ? (
          <Image
            src={workout.image}
            alt={workout.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-xl object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-accent-soft/50 to-card-border text-2xl">
            <Dumbbell className="h-8 w-8 text-muted-2" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {editMode ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit({ name: e.currentTarget.value.trim() || workout.name });
              }}
              onBlur={() => commit({ name: name.trim() || workout.name })}
              className="w-full bg-transparent text-base font-bold text-foreground focus:outline-none"
            />
          ) : (
            <h3 className="font-display text-base font-bold leading-snug text-foreground">{workout.name}</h3>
          )}
          <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-2">
            {workout.category}
            {workout.muscles?.length ? ` - ${workout.muscles.slice(0, 2).join(" / ")}` : ""}
          </p>
          {/* Badges */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {pr && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-contrast">
                PR
              </span>
            )}
            {workout.supersetWith && (
              <span className="rounded-full border border-accent-soft bg-accent-soft/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                Superset
              </span>
            )}
            {hasDrop && (
              <span className="rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-2">
                Drop set
              </span>
            )}
            {workout.equipment && !editMode && (
              <span className="rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-2">
                {workout.equipment}
              </span>
            )}
            {workout.exerciseId && <FormGuide exerciseId={workout.exerciseId} />}
            <button
              onClick={() => onToggleFavorite(workout)}
              aria-label={isFav ? "Unpin from favorites" : "Pin to favorites"}
              className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isFav ? "border-accent bg-accent text-accent-contrast" : "border-card-border text-muted-2 hover:border-muted-3"
              }`}
            >
              {isFav ? (
                <>
                  <Star className="mr-1 inline h-3 w-3" />
                  Favorited
                </>
              ) : (
                <>
                  <StarOff className="mr-1 inline h-3 w-3" />
                  Pin
                </>
              )}
            </button>
            {editMode && (
              <>
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => onMove("up")}
                    aria-label="Move workout up"
                    className="rounded-full border border-card-border bg-background p-0.5 text-muted-2 transition-colors hover:border-muted-3 hover:text-foreground"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onMove("down")}
                    aria-label="Move workout down"
                    className="rounded-full border border-card-border bg-background p-0.5 text-muted-2 transition-colors hover:border-muted-3 hover:text-foreground"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </span>
                <button onClick={() => setSwapOpen(true)} className="rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-2 hover:border-muted-3">
                  Swap
                </button>
                <button
                  onClick={() => onRemove(workout.id)}
                  aria-label="Delete workout"
                  className="rounded-full border border-destructive bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="mr-1 inline h-3 w-3" />
                  Delete
                </button>
              </>
            )}
            {!editMode && (
              <button
                onClick={() => {
                  void shareText(
                    `${workout.name} - ${workout.sets} sets x ${repsForSet(workout, 0)} reps`,
                  );
                }}
                aria-label="Share"
                className="rounded-full border border-card-border bg-background px-2 py-0.5 text-muted-2 hover:border-muted-3"
              >
                <Share2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-card-border px-3 pb-3">
        {isCardio ? (
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-widest text-muted-2">
              Duration
            </span>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
              onBlur={() => commit({ duration })}
              onKeyDown={(e) => e.key === "Enter" && commit({ duration })}
              className="w-20 rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <span className="text-xs text-muted-2">min</span>
            <button
              onClick={() => commit({ completedSets: workout.sets > 0 ? workout.completedSets : [0] })}
              className="ml-auto rounded-full bg-accent px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-accent-contrast transition-colors hover:opacity-90"
            >
              Mark Complete
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {editMode ? (
                <>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Sets</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={sets}
                      onChange={(e) => setSets(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
                      onBlur={() => commit({ sets })}
                      onKeyDown={(e) => e.key === "Enter" && commit({ sets })}
                      className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Weight</label>
                    <div className="mt-1 flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={unit === "kg" ? 0.5 : 1}
                        value={weightDisplay}
                        onChange={(e) => setWeightDisplay(Math.max(0, Number(e.target.value) || 0))}
                        onBlur={handleWeightCommit}
                        onKeyDown={(e) => e.key === "Enter" && handleWeightCommit()}
                        className="flex-1 rounded-l-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => onUnitChange(unit === "kg" ? "lb" : "kg")}
                        className="rounded-r-lg border border-card-border bg-card px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:bg-card-border hover:text-foreground"
                        aria-label="Toggle KG / LBS"
                      >
                        {unit === "kg" ? "KG" : "LBS"}
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-2">
                      <span>{workout.prevWeight > 0 ? `Last: ${toDisplay(workout.prevWeight, unit)} ${unit}` : "First log"}</span>
                      <span>{unit === "kg" ? "KG" : "LBS"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Reps</label>
                    <input
                      type="number"
                      min={1}
                      value={reps}
                      onChange={(e) => setReps(Math.max(1, Number(e.target.value) || 1))}
                      onBlur={() => commit({ reps })}
                      onKeyDown={(e) => e.key === "Enter" && commit({ reps })}
                      className="mt-1 w-full rounded-lg border border-card-border bg-background px-2 py-1.5 text-sm text-center text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-card-border bg-background px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Sets</span>
                    <p className="mt-0.5 font-display text-lg font-bold text-foreground">{workout.sets}</p>
                  </div>
                  <div className="rounded-xl border border-card-border bg-background px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Weight</span>
                    <p className="mt-0.5 font-display text-lg font-bold text-foreground">
                      {displayWeight}
                      <span className="ml-1 text-xs font-semibold text-muted-2">{unit}</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-card-border bg-background px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Reps</span>
                    <p className="mt-0.5 font-display text-lg font-bold text-foreground">{repsForSet(workout, 0)}</p>
                  </div>
                </>
              )}
            </div>

            {/* Equipment selector (edit mode) */}
            {editMode && (
              <div className="mt-2">
                <button
                  onClick={() => setEquipmentOpen(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-card-border bg-background px-3 py-2"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-2">
                    Equipment: {workout.equipment ?? "Not set"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-2" />
                </button>
                <Modal open={equipmentOpen} onClose={() => setEquipmentOpen(false)} title="Equipment">
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT_OPTIONS.map((eq) => {
                      const selected = workout.equipment === eq;
                      return (
                        <button
                          key={eq}
                          onClick={() => {
                            commit({ equipment: eq });
                            setEquipmentOpen(false);
                          }}
                          className={`rounded-xl border px-3 py-2 text-center text-sm font-semibold transition-colors ${
                            selected
                              ? "border-accent bg-accent text-accent-contrast"
                              : "border-card-border bg-card text-muted-2 hover:border-muted-3 hover:text-foreground"
                          }`}
                        >
                          {eq}
                        </button>
                      );
                    })}
                  </div>
                </Modal>
              </div>
            )}

            {/* Set tracker */}
            <div className={`mt-2 ${editMode ? "pt-2" : ""}`}>
              <div className="flex items-center gap-1">
                {Array.from({ length: workout.sets }).map((_, i) => {
                  const done = workout.completedSets.includes(i);
                  const override = workout.repsPerSet[i];
                  const editingThis = repsEditing === i;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => toggleSet(i)}
                        aria-label={`${done ? "Undo" : "Complete"} set ${i + 1}`}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                          done
                            ? "bg-accent text-accent-contrast shadow-[0_0_12px_rgba(201,162,39,0.5)]"
                            : "bg-background border border-card-border text-muted-2 hover:scale-105 hover:border-muted-3 hover:text-foreground"
                        }`}
                      >
                        {done ? <Check className="h-5 w-5" /> : i + 1}
                      </button>
                      {editingThis ? (
                        <div className="flex items-center gap-0.5">
                          <input
                            ref={(el) => el?.focus()}
                            type="number"
                            min={1}
                            value={repsInput}
                            onChange={(e) => setRepsInput(Math.max(1, Number(e.target.value) || 1))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRepsForSet(i, repsInput);
                              if (e.key === "Escape") setRepsEditing(null);
                            }}
                            onBlur={() => saveRepsForSet(i, repsInput)}
                            className="h-6 w-10 rounded bg-accent px-1 text-center text-[10px] font-bold text-accent-contrast focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button onClick={() => setRepsEditing(null)} className="text-muted-2">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!editMode) return;
                            setRepsInput(repsForSet(workout, i));
                            setRepsEditing(i);
                          }}
                          className={`text-[10px] font-semibold transition-colors ${
                            override !== undefined && override !== workout.reps
                              ? "text-accent"
                              : "text-muted-2"
                          } hover:underline ${!editMode ? "cursor-default hover:underline" : ""}`}
                          title={override !== undefined && override !== workout.reps ? "Tap to edit (differs from default)" : "Reps"}
                        >
                          {repsForSet(workout, i)}
                        </button>
                      )}
                      {editMode && (
                        <button
                          onClick={() => cycleSetType(i)}
                          aria-label={`Set type: ${SET_TYPE_LABEL[workout.setTypes[i] ?? "normal"]} - tap to change`}
                          className={`mt-0.5 rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wider ${
                            workout.setTypes[i] === "drop"
                              ? "border border-destructive bg-destructive/10 text-destructive"
                              : workout.setTypes[i] === "warmup"
                                ? "border border-muted-3 bg-card text-muted-2"
                                : "border border-muted-3 bg-card text-muted-2"
                          }`}
                        >
                          {workout.setTypes[i] ?? "N"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {!editMode && workout.sets > repsForSet(workout, 0) && (
                <p className="mt-1 text-[10px] text-muted-2">Tap a set to complete it.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Swap exercise modal */}
      <Modal open={swapOpen} onClose={() => setSwapOpen(false)} title="Swap exercise">
        <ExerciseSearch
          onSelect={handleSwap}
          label="Find a replacement"
          placeholder="Search exercises"
        />
      </Modal>
    </div>
  );
}
