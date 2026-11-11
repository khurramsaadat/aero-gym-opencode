"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dumbbell, FolderPlus, Plus, Share2, Trash2 } from "lucide-react";
import type { Workout, WorkoutTemplate } from "@/lib/types";
import { STORAGE_KEYS, subscribeToStorage, useTemplates, useWorkoutLogs } from "@/lib/storage";
import { formatDateKey } from "@/lib/dates";
import { shareText } from "@/lib/share";
import { roundDisplayKg } from "@/lib/unit";
import { Modal } from "./Modal";
import { Toast } from "./Toast";
import { UndoToast } from "./UndoToast";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Strip day-specific set progress so a template starts fresh. */
function toTemplateExercises(workouts: Workout[]): Workout[] {
  return workouts.map((w) => ({
    ...w,
    id: makeId(),
    completedSets: [],
    repsPerSet: [],
    setTypes: [],
  }));
}

/**
 * Templates widget (PRD §4.5): save today's plan as a reusable
 * template, load it into any day, share it, and delete with undo.
 */
export function TemplatesPanel() {
  const [date, setDate] = useState<string | null>(null);
  const dateRef = useRef<string | null>(null);
  const [templates, setTemplatesState] = useState(() => useTemplates.get());
  const [saveOpen, setSaveOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [undoTarget, setUndoTarget] = useState<WorkoutTemplate | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const todayWorkouts = useMemo(
    () => (dateRef.current ? useWorkoutLogs.get()[dateRef.current] ?? [] : []),
    [date],
  );

  const refresh = () => setTemplatesState(useTemplates.get());

  useEffect(() => {
    const today = formatDateKey(new Date());
    dateRef.current = today;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(today);
    refresh();
  }, []);

  useEffect(() => {
    return subscribeToStorage(STORAGE_KEYS.templates, refresh);
  }, [refresh]);

  const handleSave = () => {
    const name = templateName.trim() || `Plan - ${dateRef.current ?? ""}`;
    const existing = useTemplates.get().some((t) => t.name === name);
    const next = existing
      ? useTemplates.get().map((t) => (t.name === name ? { ...t, exercises: toTemplateExercises(todayWorkouts) } : t))
      : [...useTemplates.get(), { id: makeId(), name, exercises: toTemplateExercises(todayWorkouts) }];
    useTemplates.set(next);
    setSaveOpen(false);
    setTemplateName("");
    setToast(existing ? "Template updated" : "Template saved");
  };

  const handleLoad = (t: WorkoutTemplate) => {
    const d = dateRef.current;
    if (!d) return;
    const day = useWorkoutLogs.get()[d] ?? [];
    useWorkoutLogs.updateDay(d, [...day, ...toTemplateExercises(t.exercises)]);
    setToast(`Loaded ${t.exercises.length} exercises into today`);
  };

  const handleDelete = (t: WorkoutTemplate) => {
    useTemplates.set(useTemplates.get().filter((x) => x.id !== t.id));
    setUndoTarget(t);
  };

  const handleUndoDelete = () => {
    if (!undoTarget) return;
    useTemplates.set([...useTemplates.get(), undoTarget]);
    setUndoTarget(null);
  };

  const handleShare = async (t: WorkoutTemplate) => {
    const lines = t.exercises.map((w) => {
      if (w.duration > 0) return `- ${w.name}: ${w.duration} min`;
      return `- ${w.name}: ${w.sets} x ${w.reps} @ ${roundDisplayKg(w.weight)} kg`;
    });
    const text = `Aero Gym template - ${t.name}\n${lines.join("\n")}\n\nAero Gym - https://aero-gym.netlify.app`;
    await shareText(text);
    setToast("Link copied to clipboard");
  };

  const totalSets = (t: WorkoutTemplate) => t.exercises.reduce((sum, w) => sum + w.sets, 0);

  return (
    <section className="rounded-2xl border border-card-border bg-card p-3">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <FolderPlus className="h-4 w-4 text-accent" aria-hidden />
        Templates
      </h2>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setSaveOpen(true)}
          disabled={todayWorkouts.length === 0}
          className="flex-1 rounded-xl border border-card-border bg-background px-3 py-2 text-sm font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-muted-3 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5 inline" aria-hidden />
          Save today
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-card-border bg-background px-3 py-6 text-center text-[11px] text-muted-2">
          Save today&apos;s plan to reuse it any day.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-card-border">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center gap-2 py-2.5">
              <Dumbbell className="h-4 w-4 shrink-0 text-muted-2" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{t.name}</span>
                <span className="block text-[10px] text-muted-2">
                  {t.exercises.length} exercises - {totalSets(t)} sets
                </span>
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleLoad(t)}
                  className="rounded-lg border border-card-border bg-background px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-accent hover:text-accent-text"
                  aria-label={`Load ${t.name}`}
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(t)}
                  className="rounded-lg border border-card-border bg-background px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-accent hover:text-accent-text"
                  aria-label={`Share ${t.name}`}
                >
                  <Share2 className="h-3 w-3" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t)}
                  className="rounded-lg border border-card-border bg-background px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-destructive hover:text-destructive"
                  aria-label={`Delete ${t.name}`}
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {saveOpen && (
        <Modal open onClose={() => setSaveOpen(false)} title="Name this template">
          <div className="space-y-3">
            <input
              autoFocus
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={`Plan - ${dateRef.current ?? ""}`}
              className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSaveOpen(false)}
                className="flex-1 rounded-full border border-card-border bg-card px-4 py-2 text-sm font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-muted-3 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wider text-accent-text transition-colors hover:opacity-90"
              >
                Save template
              </button>
            </div>
          </div>
        </Modal>
      )}

      {undoTarget && <UndoToast onUndo={handleUndoDelete} label={`${undoTarget.name} deleted`} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}
