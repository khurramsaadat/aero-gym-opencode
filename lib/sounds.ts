// Aero Gym - UI sound effects (PRD §4.5): set completion, PR fanfare,
// timer beep, workout complete. Web Audio API, enabled via settings.

let ctx: AudioContext | null = null;
let enabled = false;

export function initAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    ctx = new (window.AudioContext ?? (window as never).webkitAudioContext)();
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on) initAudio();
}

export function isSoundEnabled(): boolean {
  return enabled;
}

function playTone(frequency: number, durationMs: number, type: OscillatorType = "sine", volume = 0.06) {
  if (!enabled || !ctx) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000);
}

function playChime(frequencies: number[], durationMs = 220) {
  if (!enabled || !ctx) return;
  const t0 = ctx.currentTime;
  frequencies.forEach((f, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f, t0 + i * 0.06);
    gain.gain.setValueAtTime(0.05, t0 + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.06 + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx!.destination);
    osc.start(t0 + i * 0.06);
    osc.stop(t0 + i * 0.06 + durationMs / 1000);
  });
}

/** Short "pop" when a set is completed. */
export function playSetComplete() {
  playTone(880, 60, "square", 0.04);
}

/** Rising fanfare for a new personal record. */
export function playPrFanfare() {
  playChime([659.25, 783.99, 987.77, 1318.51], 260);
}

/** Beep for timer zero. */
export function playTimerBeep() {
  playTone(1046.5, 120, "sawtooth", 0.05);
  setTimeout(() => playTone(1318.5, 160, "sawtooth", 0.05), 140);
}

/** Celebratory arpeggio when the whole workout is done. */
export function playWorkoutComplete() {
  playChime([523.25, 659.25, 783.99, 1046.5, 1318.5], 180);
}
