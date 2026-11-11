// Aero Gym - data models (PRD §6)

export type WorkoutCategory =
  | "Biceps"
  | "Triceps"
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Legs"
  | "Abs"
  | "Cardio"
  | "Full Body"
  | "Calves"
  | "Glutes"
  | "Quadriceps"
  | string;

export type Equipment =
  | "Dumbbell"
  | "Barbell"
  | "Kettlebell"
  | "Machine"
  | "Cable"
  | "Bodyweight"
  | "Band"
  | "Plate"
  | "Other";

export type SetType = "normal" | "warmup" | "drop" | "failure";

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  weight: number; // stored in KG (display unit handled by useUnit)
  duration: number; // minutes, for cardio
  reps: number; // default reps per set
  repsPerSet: number[]; // per-set overrides; empty = all sets use `reps`
  sets: number; // planned sets
  completedSets: number[]; // indices of completed sets
  setTypes: SetType[]; // per-set type
  supersetWith?: string; // id of the paired workout
  prevWeight: number;
  prevReps: number;
  equipment?: Equipment;
  /** wger.de exercise id (when resolved) */
  exerciseId?: number;
  /** wger.de image url (cached snapshot) */
  image?: string;
  muscles?: string[];
  musclesSecondary?: string[];
}

export type WorkoutLog = Record<string, Workout[]>; // { [YYYY-MM-DD]: Workout[] }

export type BodyWeightLog = Record<string, number>; // { [YYYY-MM-DD]: kg }

export interface BodyMeasurement {
  neck: number;
  shoulders: number;
  chest: number;
  waist: number;
  hips: number;
  leftArm: number;
  rightArm: number;
  forearm: number;
  wrist: number;
  leftThigh: number;
  rightThigh: number;
  calves: number;
}

export type MeasurementLog = Record<string, BodyMeasurement>; // { [YYYY-MM-DD]: BodyMeasurement }

export interface DayMeta {
  note?: string;
  rating?: number; // 1-5 stars
}

export type DayMetaLog = Record<string, DayMeta>; // { [YYYY-MM-DD]: DayMeta }

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Workout[];
}

export interface FavoriteExercise {
  name: string;
  category: WorkoutCategory;
  weight: number;
  reps: number;
  duration: number;
  sets: number;
}

export interface WgerExercise {
  id: number;
  name: string;
  description: string;
  muscles: string[];
  musclesSecondary: string[];
  equipment: string[];
  image?: string;
  /** step-by-step form guide parsed from the wger description (PRD §4.10) */
  instructions?: string[];
}

/** Lightweight index entry: full-name hit used for client-side search. */
export interface WgerSearchHit {
  id: number;
  name: string;
}

/** localStorage cache entry for a wger exercise (PRD §4.10: 7-day cache) */
export interface WgerCacheEntry {
  data: WgerExercise;
  fetchedAt: number; // epoch ms
}

/** localStorage cache entry for the full wger index (7-day TTL). */
export interface WgerIndexEntry {
  data: WgerSearchHit[];
  fetchedAt: number; // epoch ms
}
