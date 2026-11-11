"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Unlock } from "lucide-react";
import { vibrate } from "@/lib/haptics";

/**
 * Workout duration timer (PRD §4.2) with screen wake lock so the
 * display stays on mid-session.
 */
export function WorkoutTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const tickRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

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

  // Request wake lock while the timer runs
  useEffect(() => {
    if (!running || !("wakeLock" in navigator)) return;
    let cancel = false;
    const request = async () => {
      try {
        if (cancel) return;
        if (!wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          wakeLockRef.current.addEventListener("release", () => {
            wakeLockRef.current = null;
          });
        }
      } catch {
        /* wake lock denied - ignore */
      }
    };
    void request();
    return () => {
      cancel = true;
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const toggle = () => {
    vibrate("tap");
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(0);
  };

  const wakeLocked = wakeLockRef.current !== null;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-card-border bg-card px-4 py-2.5">
      <button onClick={toggle} aria-label={running ? "Pause timer" : "Start timer"} className="rounded-full p-1.5 text-muted-2 transition-colors hover:bg-card-border hover:text-foreground">
        {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>
      <span className="font-mono text-lg font-semibold text-foreground tabular-nums">
        {mm}:{ss}
      </span>
      <button onClick={reset} aria-label="Reset timer" className="ml-auto rounded-lg p-1.5 text-muted-2 transition-colors hover:bg-card-border hover:text-foreground">
        <RotateCcw className="h-4.5 w-4.5" />
      </button>
      {wakeLocked && (
        <Unlock className="h-4 w-4 text-accent" title="Screen wake lock active" />
      )}
    </div>
  );
}
