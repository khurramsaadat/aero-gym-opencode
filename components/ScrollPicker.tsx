"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Modal } from "./Modal";

const ROW_H = 44;
const VISIBLE_ROWS = 7; // odd, so the middle row is the selected value

interface ScrollPickerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  unitLabel: string;
  /** display range (in the display unit) */
  min: number;
  max: number;
  step: number;
  /** stored base value (cm or kg) */
  value: number;
  /** stored base -> display */
  toDisplay: (v: number) => number;
  /** display -> stored base */
  toStored: (v: number) => number;
  onSelect: (stored: number) => void;
}

const roundStep = (v: number, step: number): number => {
  const r = Math.round(v / step);
  return Math.round(r * step * 10) / 10;
};

const fmt = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/**
 * Tap-to-edit scroll picker (PRD §4.5): a modal with a snapping value
 * wheel. Drag or mouse-wheel to scroll, snap on release, tap to select.
 */
export function ScrollPicker({
  open,
  onClose,
  title,
  unitLabel,
  min,
  max,
  step,
  value,
  toDisplay,
  toStored,
  onSelect,
}: ScrollPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<number | null>(null);
  const maxIndex = Math.max(0, Math.round((max - min) / step));
  const [selectedIndex, setSelectedIndex] = useState(0);

  // (Re)position the wheel when the picker opens or the value changes.
  useEffect(() => {
    if (!open) return;
    const display = toDisplay(value > 0 ? value : min + Math.floor(maxIndex / 2) * step);
    const idx = Math.min(maxIndex, Math.max(0, Math.round((display - min) / step)));
    const t = window.setTimeout(() => {
      setSelectedIndex(idx);
      const el = listRef.current;
      if (el) el.scrollTop = Math.max(0, idx * ROW_H - (ROW_H * (VISIBLE_ROWS - 1)) / 2);
    }, 50);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

  const scrollTo = (index: number) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = Math.max(0, index * ROW_H - (ROW_H * (VISIBLE_ROWS - 1)) / 2);
  };

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      const idx = Math.min(maxIndex, Math.max(0, Math.round(el.scrollTop / ROW_H)));
      setSelectedIndex(idx);
      scrollTo(idx);
    }, 120);
  };

  const pick = (index: number) => {
    onSelect(toStored(roundStep(min + index * step, step)));
    onClose();
  };

  const values = Array.from({ length: maxIndex + 1 }, (_, i) => min + i * step);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-2">
          {unitLabel}
        </span>
        <span className="rounded-full border border-card-border bg-background px-2 py-px text-[10px] font-bold text-accent-text">
          {fmt(roundStep(min + selectedIndex * step, step))}
        </span>
      </div>
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="mt-3 max-h-[56vh] overflow-y-scroll touch-action:pan-y"
        style={{ height: ROW_H * VISIBLE_ROWS }}
      >
        {values.map((v, i) => {
          const isSel = i === selectedIndex;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              className={`relative h-11 flex items-center justify-center text-base font-semibold transition-colors ${
                isSel
                  ? "text-accent-text"
                  : "text-muted-2 hover:text-foreground"
              }`}
              aria-label={`${fmt(v)} ${unitLabel}`}
            >
              {isSel && <Check className="absolute left-3 h-4 w-4 text-accent" aria-hidden />}
              {fmt(roundStep(v, step))}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-muted-2">
        <button onClick={() => scrollTo(Math.max(0, selectedIndex - 1))} aria-label="Scroll down">
          <ChevronUp className="h-4 w-4" />
        </button>
        <button onClick={() => scrollTo(Math.min(maxIndex, selectedIndex + 1))} aria-label="Scroll up">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </Modal>
  );
}
