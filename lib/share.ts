// Aero Gym - sharing helpers (PRD §4.7): Web Share API with clipboard
// fallback and textarea fallback for old browsers, plus the session
// share card built from the day's logs.

import type { Workout } from "./types";
import { dayStats } from "./analytics";
import { toDisplay, type WeightUnit } from "./unit";
import { APP_URL } from "./constants";

export async function shareText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({ text });
      return true;
    } catch {
      /* user cancelled or failed - fall through */
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through */
    }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    /* ignore */
  }
  document.body.removeChild(ta);
  return true;
}

/**
 * Clean share card (PRD §4.7): emoji headers, no line dividers, with the
 * completion percentage, exercise and set counts, volume, muscles and
 * one line per exercise, closed by the app link.
 */
export function buildSessionShareText(
  date: string,
  workouts: Workout[],
  unit: WeightUnit,
): string {
  const stats = dayStats(workouts);
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const muscles = [
    ...new Set(workouts.flatMap((w) => (w.muscles?.length ? w.muscles : [w.category]))),
  ].slice(0, 6);
  const exerciseLines = workouts.map((w) => {
    const isCardio = w.category === "Cardio" && w.weight <= 0;
    if (isCardio) return `- ${w.name}: ${w.duration || 0} min`;
    const weight = toDisplay(w.weight, unit);
    const reps = w.repsPerSet[0] ?? w.reps;
    return `- ${w.name}: ${w.completedSets.length}/${w.sets} sets x ${reps} @ ${weight} ${unit}`;
  });
  const volume = Math.round(toDisplay(stats.volume, unit));

  return [
    `💪 Aero Gym - ${dateLabel}`,
    `✅ Completion: ${stats.completion}%`,
    `🏋️ ${workouts.length} ${workouts.length === 1 ? "exercise" : "exercises"} - ${stats.sets}/${stats.planned} sets`,
    `⚖️ Volume: ${volume.toLocaleString("en-US")} ${unit}`,
    muscles.length > 0 ? `🎯 Muscles: ${muscles.join(", ")}` : "",
    "",
    ...exerciseLines,
    "",
    `🔗 ${APP_URL}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}
