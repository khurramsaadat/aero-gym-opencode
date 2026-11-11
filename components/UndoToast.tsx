"use client";

import { useEffect, useRef } from "react";
import { Trash2, Undo } from "lucide-react";

interface UndoToastProps {
  onUndo: () => void;
  /**
   * Called when the toast expires without an undo. The deletion must
   * stand at that point - never call onUndo here.
   */
  onDismiss?: () => void;
  label?: string;
}

/** Slide-up toast after a delete, with one-tap undo (PRD §4.2). */
export function UndoToast({ onUndo, onDismiss, label = "Workout deleted" }: UndoToastProps) {
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const t = setTimeout(() => dismissRef.current?.(), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-destructive bg-card px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)] animate-[fadein_200ms_ease-out,slideup_300ms_ease-out]">
      <Trash2 className="h-5 w-5 text-destructive" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        onClick={onUndo}
        aria-label="Undo"
        className="ml-1 flex items-center gap-1 rounded-lg border border-accent-soft bg-accent-soft px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text transition-colors hover:opacity-80"
      >
        <Undo className="h-3.5 w-3.5" />
        Undo
      </button>
    </div>
  );
}
