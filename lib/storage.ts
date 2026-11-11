// Aero Gym - typed localStorage layer (PRD §5)
// Every key below is a PRD-mandated storage key.

import type {
  WorkoutLog,
  BodyWeightLog,
  MeasurementLog,
  DayMetaLog,
  WorkoutTemplate,
  FavoriteExercise,
  WgerCacheEntry,
  WgerIndexEntry,
  WgerSearchHit,
  BodyMeasurement,
  DayMeta,
  WgerExercise,
} from "./types";

/** SSR-safe localStorage handle. */
const safeStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> =
  typeof window === "undefined"
    ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    : window.localStorage;

export const STORAGE_KEYS = {
  workoutLogs: "myWorkoutLogs",
  bodyWeight: "myBodyWeight",
  measurements: "myMeasurements",
  templates: "myTemplates",
  dayMeta: "myDayMeta",
  theme: "workout-theme",
  height: "workout-height",
  restTimer: "workout-rest-timer",
  favorites: "workout-favorites",
  activeTab: "workout-active-tab",
  wgerCache: "wger-exercise-cache",
  lengthUnit: "workout-length-unit",
  weightUnit: "workout-weight-unit",
} as const;

type JsonValue = WorkoutLog | BodyWeightLog | MeasurementLog | DayMetaLog | WorkoutTemplate[] | FavoriteExercise[] | Record<number, WgerCacheEntry | WgerIndexEntry>;

function read<T extends JsonValue>(key: string, fallback: T): T {
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T extends JsonValue>(key: string, value: T): void {
  try {
    safeStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable - ignore */
  }
}

function remove(key: string): void {
  safeStorage.removeItem(key);
}

/** Tiny pub/sub so components react to storage changes, per key. */
const listeners = new Map<string, Set<() => void>>();

export function subscribeToStorage(key: string, cb: () => void): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  const set = listeners.get(key)!;
  set.add(cb);
  return () => {
    set.delete(cb);
    if (set.size === 0) listeners.delete(key);
  };
}

function emit(key: string): void {
  listeners.get(key)?.forEach((cb) => cb());
}

/* ------------------------------------------------------------------ */
/*  Workout logs                                                        */
/* ------------------------------------------------------------------ */

export const useWorkoutLogs = {
  get: (): WorkoutLog => read<WorkoutLog>(STORAGE_KEYS.workoutLogs, {}),
  set: (log: WorkoutLog) => {
    write(STORAGE_KEYS.workoutLogs, log);
    emit(STORAGE_KEYS.workoutLogs);
  },
  updateDay: (date: string, workouts: WorkoutLog[string]) => {
    const log = useWorkoutLogs.get();
    if (workouts.length === 0) {
      delete log[date];
    } else {
      log[date] = workouts;
    }
    useWorkoutLogs.set(log);
  },
};

/* ------------------------------------------------------------------ */
/*  Body weight                                                         */
/* ------------------------------------------------------------------ */

export const useBodyWeight = {
  get: (): BodyWeightLog => read<BodyWeightLog>(STORAGE_KEYS.bodyWeight, {}),
  set: (log: BodyWeightLog) => {
    write(STORAGE_KEYS.bodyWeight, log);
    emit(STORAGE_KEYS.bodyWeight);
  },
  logForToday: (date: string, kg: number) => {
    const log = useBodyWeight.get();
    if (kg > 0) log[date] = kg;
    else delete log[date];
    useBodyWeight.set(log);
  },
};

/* ------------------------------------------------------------------ */
/*  Measurements                                                        */
/* ------------------------------------------------------------------ */

export const useMeasurements = {
  get: (): MeasurementLog => read<MeasurementLog>(STORAGE_KEYS.measurements, {}),
  set: (log: MeasurementLog) => {
    write(STORAGE_KEYS.measurements, log);
    emit(STORAGE_KEYS.measurements);
  },
  latest: (): BodyMeasurement | null => {
    const entries = Object.entries(useMeasurements.get()).sort(([a], [b]) => (a < b ? -1 : 1));
    return entries.length ? entries[entries.length - 1][1] : null;
  },
  /**
   * Autosave a single field (PRD §4.5): merges the latest known values
   * with any entry already stored for the day, then persists.
   */
  updateField: (date: string, field: keyof BodyMeasurement, value: number) => {
    const log = useMeasurements.get();
    const latest = useMeasurements.latest();
    const merged = {
      ...(latest ?? {}),
      ...(log[date] ?? {}),
      [field]: value,
    } as BodyMeasurement;
    log[date] = merged;
    useMeasurements.set(log);
  },
};

/* ------------------------------------------------------------------ */
/*  Day meta (notes + rating)                                           */
/* ------------------------------------------------------------------ */

export const useDayMeta = {
  get: (): DayMetaLog => read<DayMetaLog>(STORAGE_KEYS.dayMeta, {}),
  setForDay: (date: string, meta: DayMeta | null) => {
    const log = useDayMeta.get();
    if (meta && (meta.note || meta.rating)) log[date] = meta;
    else delete log[date];
    write(STORAGE_KEYS.dayMeta, log);
    emit(STORAGE_KEYS.dayMeta);
  },
  getForDay: (date: string): DayMeta => useDayMeta.get()[date] ?? {},
};

/* ------------------------------------------------------------------ */
/*  Templates                                                           */
/* ------------------------------------------------------------------ */

export const useTemplates = {
  get: (): WorkoutTemplate[] => read<WorkoutTemplate[]>(STORAGE_KEYS.templates, []),
  set: (templates: WorkoutTemplate[]) => {
    write(STORAGE_KEYS.templates, templates);
    emit(STORAGE_KEYS.templates);
  },
};

/* ------------------------------------------------------------------ */
/*  Favorites                                                           */
/* ------------------------------------------------------------------ */

export const useFavorites = {
  get: (): FavoriteExercise[] => read<FavoriteExercise[]>(STORAGE_KEYS.favorites, []),
  set: (favorites: FavoriteExercise[]) => {
    write(STORAGE_KEYS.favorites, favorites);
    emit(STORAGE_KEYS.favorites);
    emit("favorites-changed");
  },
  isFavorite: (name: string) => useFavorites.get().some((f) => f.name === name),
  toggle: (exercise: Omit<FavoriteExercise, "name"> & { name: string }) => {
    const favorites = useFavorites.get();
    const existing = favorites.findIndex((f) => f.name === exercise.name);
    if (existing >= 0) favorites.splice(existing, 1);
    else favorites.push({ ...exercise });
    useFavorites.set(favorites);
    emit("favorites-changed");
  },
};

/* ------------------------------------------------------------------ */
/*  Theme + units + misc settings                                       */
/* ------------------------------------------------------------------ */

export const useSettings = {
  getTheme: (): "dark" | "light" =>
    (safeStorage.getItem(STORAGE_KEYS.theme) as "dark" | "light") ?? "dark",
  setTheme: (theme: "dark" | "light") => {
    safeStorage.setItem(STORAGE_KEYS.theme, theme);
    emit(STORAGE_KEYS.theme);
  },
  getHeightCm: (): number => Number(safeStorage.getItem(STORAGE_KEYS.height)) || 0,
  setHeightCm: (cm: number) => safeStorage.setItem(STORAGE_KEYS.height, String(cm)),
  isRestTimerEnabled: (): boolean => safeStorage.getItem(STORAGE_KEYS.restTimer) === "1",
  setRestTimer: (on: boolean) => safeStorage.setItem(STORAGE_KEYS.restTimer, on ? "1" : "0"),
  getWeightUnit: (): "kg" | "lb" =>
    (safeStorage.getItem(STORAGE_KEYS.weightUnit) as "kg" | "lb") ?? "kg",
  setWeightUnit: (unit: "kg" | "lb") => {
    safeStorage.setItem(STORAGE_KEYS.weightUnit, unit);
    emit(STORAGE_KEYS.weightUnit);
    emit("units-changed");
  },
  getLengthUnit: (): "cm" | "in" =>
    (safeStorage.getItem(STORAGE_KEYS.lengthUnit) as "cm" | "in") ?? "cm",
  setLengthUnit: (unit: "cm" | "in") => {
    safeStorage.setItem(STORAGE_KEYS.lengthUnit, unit);
    emit(STORAGE_KEYS.lengthUnit);
    emit("units-changed");
  },
  getActiveTab: (): string | null => safeStorage.getItem(STORAGE_KEYS.activeTab),
  setActiveTab: (tab: string | null) =>
    tab === null
      ? safeStorage.removeItem(STORAGE_KEYS.activeTab)
      : safeStorage.setItem(STORAGE_KEYS.activeTab, tab),
};

/* ------------------------------------------------------------------ */
/*  wger.de exercise cache (7-day TTL, PRD §4.10)                       */
/* ------------------------------------------------------------------ */

const WGER_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const useWgerCache = {
  getAll: (): Record<number, WgerCacheEntry | WgerIndexEntry> =>
    read<Record<number, WgerCacheEntry | WgerIndexEntry>>(STORAGE_KEYS.wgerCache, {}),
  get: (id: number): WgerExercise | null => {
    const entry = useWgerCache.getAll()[id];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > WGER_CACHE_TTL_MS) {
      useWgerCache.remove(id);
      return null;
    }
    return (entry as WgerCacheEntry).data as WgerExercise;
  },
  set: (id: number, data: WgerExercise) => {
    const all = useWgerCache.getAll();
    all[id] = { data, fetchedAt: Date.now() };
    write(STORAGE_KEYS.wgerCache, all);
  },
  /** Full 966-exercise index, stored under the reserved id -1. */
  getIndex: (): WgerSearchHit[] | null => {
    const entry = useWgerCache.getAll()[-1];
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > WGER_CACHE_TTL_MS) {
      useWgerCache.remove(-1);
      return null;
    }
    return (entry as WgerIndexEntry).data as WgerSearchHit[];
  },
  setIndex: (hits: WgerSearchHit[]) => {
    const all = useWgerCache.getAll();
    all[-1] = { data: hits, fetchedAt: Date.now() };
    write(STORAGE_KEYS.wgerCache, all);
  },
  remove: (id: number) => {
    const all = useWgerCache.getAll();
    delete all[id];
    write(STORAGE_KEYS.wgerCache, all);
  },
  clear: () => {
    remove(STORAGE_KEYS.wgerCache);
    emit(STORAGE_KEYS.wgerCache);
  },
};

/* ------------------------------------------------------------------ */
/*  Backup / restore (PRD §4.5: export/import with drag-and-drop)      */
/* ------------------------------------------------------------------ */

/** Snapshot of every PRD storage key for backup download. */
export function exportAllData(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    try {
      const raw = safeStorage.getItem(key);
      if (!raw) continue;
      out[key] = JSON.parse(raw);
    } catch {
      /* skip unreadable key */
    }
  }
  return out;
}

/** Restore a backup snapshot over the PRD storage keys. */
export function importAllData(data: Record<string, unknown>): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    if (!(key in data)) continue;
    try {
      safeStorage.setItem(key, JSON.stringify(data[key]));
      emit(key);
    } catch {
      /* skip unwritable key */
    }
  }
}

/** Remove every PRD storage key (settings "clear all data"). */
export function clearAllData(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    remove(key);
    emit(key);
  }
}
