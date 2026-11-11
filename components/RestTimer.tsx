"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { useSettings } from "@/lib/storage";
import { vibrate } from "@/lib/haptics";
import { playTimerBeep } from "@/lib/sounds";

const PRESETS = [30, 45, 60, 90, 120];

/**
 * Rest timer (PRD §4.2): count-up timer between sets with preset
 * shortcuts. Enabled via the `workout-rest-timer` setting; auto-starts
 * when enabled and beeps when the timer is paused at a preset boundary.
 */
export function RestTimer() {
  const enabledDefault = useSettings.isRestTimerEnabled();
  const [enabled, setEnabled] = useState(enabledDefault);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!running) {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = 0;
      return;
    }
    tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = 0;
    };
  }, [running]);

  const setPreset = (sec: number) => {
    vibrate("tap");
    setSeconds(sec);
    setRunning(true);
  };

  const toggle = () => {
    vibrate("tap");
    setRunning((r) => {
      if (r) playTimerBeep();
      return !r;
    });
  };

  const reset = () => {
    setRunning(false);
    setSeconds(0);
  };

  const toggleEnabled = (on: boolean) => {
    setEnabled(on);
    useSettings.setRestTimer(on);
    if (!on) reset();
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl border border-card-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-muted-2" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-2">Rest timer</span>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-full p-1 transition-colors hover:bg-card-border">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => toggleEnabled(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-[11px] font-semibold text-muted-2">On</span>
        </label>
      </div>

      {enabled && (
        <>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={toggle} aria-label={running ? "Pause" : "Start"} className="rounded-full p-1.5 text-muted-2 transition-colors hover:bg-card-border hover:text-foreground">
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <span className={`font-mono text-2xl font-semibold tabular-nums ${seconds > 0 ? "text-foreground" : "text-muted-2"}`}>
              {mm}:{ss}
            </span>
            <button onClick={reset} aria-label="Reset" className="ml-auto rounded-lg p-1.5 text-muted-2 transition-colors hover:bg-card-border hover:text-foreground">
              <RotateCcw className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {PRESETS.map((s) => (
              <button
                key={s}
                onClick={() => setPreset(s)}
                className="rounded-full border border-card-border bg-background px-2.5 py-1 text-[12px] font-semibold text-muted-2 transition-all hover:border-muted-3 hover:text-foreground active:scale-95"
              >
                {s}s
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
