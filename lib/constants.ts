// Aero Gym - shared constants

import type { Equipment, WorkoutCategory } from "./types";

export const EQUIPMENTS: Equipment[] = [
  "Dumbbell",
  "Barbell",
  "Kettlebell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Band",
  "Other",
];

export const MUSCLE_GROUPS: { id: string; front: boolean }[] = [
  { id: "Chest", front: true },
  { id: "Shoulders", front: true },
  { id: "Biceps", front: true },
  { id: "Triceps", front: true },
  { id: "Abs", front: true },
  { id: "Quads", front: true },
  { id: "Calves", front: true },
  { id: "Back", front: false },
  { id: "Hamstrings", front: false },
  { id: "Glutes", front: false },
  { id: "Forearms", front: false },
];

export const CATEGORIES: WorkoutCategory[] = [
  "Biceps",
  "Triceps",
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Abs",
  "Calves",
  "Glutes",
  "Quadriceps",
  "Cardio",
  "Full Body",
];

/** Cardio categories use duration instead of weight/reps. */
export const CARDIO_CATEGORIES: WorkoutCategory[] = ["Cardio", "Walk", "Run", "Cycling"];

export const ACCENT = {
  dark: "#C9A227", // gold - sole accent in dark theme (PRD §3)
  light: "#00BFA5", // teal - light theme accent (JEFIT-inspired)
} as const;

export const APP_NAME = "Aero Gym";
export const APP_URL = "https://aero-gym.netlify.app";
export const COPYRIGHT = "2026 Aero Gym by Khurram | All rights reserved.";
export const REPO_URL = "https://github.com/khurramsaadat/aero-gym-opencode";
export const LAST_UPDATED = "11 November 2026";
