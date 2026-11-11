"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { useWgerCache } from "@/lib/storage";
import { fetchWgerExercise } from "@/lib/wger";

/**
 * Expandable form-guide tooltip (PRD §4.10 / §4.2): shows the
 * step-by-step wger instructions for the exercise in a popover
 * anchored to the card header.
 */
export function FormGuide({ exerciseId }: { exerciseId?: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<string[] | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openGuide = () => {
    if (!exerciseId) return;
    setOpen(true);
    const cached = useWgerCache.get(exerciseId);
    if (cached?.instructions && cached.instructions.length > 0) {
      setSteps(cached.instructions);
      return;
    }
    setLoading(true);
    setSteps(null);
    fetchWgerExercise(exerciseId).then((data) => {
      setLoading(false);
      setSteps(data?.instructions && data.instructions.length > 0 ? data.instructions : []);
    });
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current?.contains(t) ||
        btnRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!exerciseId) return null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => (open ? setOpen(false) : openGuide())}
        aria-label="Form guide"
        aria-expanded={open}
        className="rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-muted-3 hover:text-foreground"
      >
        <BookOpen className="h-3 w-3" />
        <span className="ml-0.5">Form</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Form guide"
          className="absolute left-0 top-full z-30 mt-2 max-h-[55vh] w-[85vw] max-w-80 overflow-y-auto rounded-xl border border-card-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.5)] scrollbar-thin scrollbar-thumb-muted-3"
        >
          <div className="flex items-center justify-between border-b border-card-border px-3 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-2">
              <BookOpen className="h-3.5 w-3.5 inline" />
              Form guide
            </span>
            <span className="rounded-full border border-card-border bg-background px-2 py-px text-[10px] text-muted-2">
              wger.de
            </span>
          </div>
          <div className="space-y-0 p-3">
            {loading && (
              <p className="px-1 py-4 text-center text-sm text-muted-2">
                Loading guide...
              </p>
            )}
            {!loading && steps && steps.length > 0 && (
              <ol className="divide-y divide-card-border">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-2 py-2.5 text-sm text-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent-text">
                      {i + 1}
                    </span>
                    <span className="text-muted-2">{step}</span>
                  </li>
                ))}
              </ol>
            )}
            {!loading && steps && steps.length === 0 && (
              <p className="px-1 py-4 text-center text-sm text-muted-2">
                No step-by-step guide is available for this exercise yet.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
