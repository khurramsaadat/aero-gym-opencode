// Aero Gym - wger.de REST client (PRD §4.10)
// Endpoints: exerciseinfo (detail), exerciseimage, translations via ?language=2.
//
// NOTE: the wger server-side `search` parameter currently ignores the query
// (verified 2026-11-11: identical results for any term), so the full
// exercise index is fetched once, cached 7 days in `wger-exercise-cache`,
// and matching is done client-side with scoring.

import { useWgerCache } from "./storage";
import type { Equipment, WgerExercise, WgerSearchHit, WorkoutCategory } from "./types";

const API = "https://wger.de/api/v2";
const LANGUAGE = 2; // English
const UA = { "User-Agent": "aero-gym/0.1 (https://aero-gym.netlify.app)" };

/**
 * Older builds stored the JSON API endpoint as an image URL. Next's
 * image optimizer cannot render that, so reject it everywhere.
 */
export function isUsableImageUrl(url?: string): url is string {
  if (!url) return false;
  return !/\/api\/v2\/exerciseimage\/\d+\/?$/.test(url);
}

/* ------------------------------------------------------------------ */
/*  API response shapes (defensive: muscles/equipment may be ids)      */
/* ------------------------------------------------------------------ */

interface WgerApiTranslation {
  language: number;
  name?: string;
  description?: string;
}

interface WgerApiExercise {
  id: number;
  muscles?: Array<{ name_en?: string; name?: string } | string | number>;
  muscles_secondary?: Array<{ name_en?: string; name?: string } | string | number>;
  equipment?: Array<{ name?: string } | string | number>;
  images?: Array<{
    image?: string;
    thumbnails?: { small?: string; medium?: string };
    is_main?: boolean;
  }>;
  translations?: WgerApiTranslation[];
}

function englishName(ex: WgerApiExercise): string {
  const t = ex.translations?.find((tr) => tr.language === LANGUAGE);
  return t?.name ?? ex.translations?.[0]?.name ?? "";
}

function nameOf(entry: { name_en?: string; name?: string } | string | number): string {
  if (typeof entry === "string") return entry;
  if (typeof entry === "number") return "";
  return entry.name_en ?? entry.name ?? "";
}

function nameOfEq(entry: { name?: string } | string | number): string {
  if (typeof entry === "string") return entry;
  if (typeof entry === "number") return "";
  return entry.name ?? "";
}

/* ------------------------------------------------------------------ */
/*  Equipment / category mapping                                       */
/* ------------------------------------------------------------------ */

const EQUIPMENT_MAP: Record<string, Equipment> = {
  dumbbell: "Dumbbell",
  barbell: "Barbell",
  kettlebell: "Kettlebell",
  machine: "Machine",
  "cable machine": "Cable",
  cable: "Cable",
  bodyweight: "Bodyweight",
  "none (bodyweight exercise)": "Bodyweight",
  "pull-up bar": "Bodyweight",
  "pullup bar": "Bodyweight",
  band: "Band",
  "sz-bar": "Barbell",
  "ez-bar": "Barbell",
  plate: "Plate",
  bench: "Other",
  "incline bench": "Other",
  "gym mat": "Other",
  "swiss ball": "Other",
};

/** wger equipment name -> app Equipment (unknown -> Other). */
export function mapWgerEquipment(name: string): Equipment {
  return EQUIPMENT_MAP[name.trim().toLowerCase()] ?? "Other";
}

const MUSCLE_CATEGORY: Record<string, WorkoutCategory> = {
  Biceps: "Biceps",
  Brachialis: "Biceps",
  Brachioradialis: "Biceps",
  Forearms: "Biceps",
  Triceps: "Triceps",
  "Long head triceps": "Triceps",
  Chest: "Chest",
  "Upper chest": "Chest",
  "Lower chest": "Chest",
  Lats: "Back",
  Rhomboids: "Back",
  "Spinal erectors": "Back",
  "Upper back": "Back",
  Shoulders: "Shoulders",
  "Side delts": "Shoulders",
  "Front delts": "Shoulders",
  "Rear delts": "Shoulders",
  Traps: "Shoulders",
  "Rotator cuff": "Shoulders",
  Quads: "Quadriceps",
  Hamstrings: "Legs",
  Calves: "Calves",
  Glutes: "Glutes",
  "Gluteus maximus": "Glutes",
  "Hip abductors": "Glutes",
  "Inner thighs": "Legs",
  Abs: "Abs",
  Obliques: "Abs",
  Core: "Abs",
  "Hip flexors": "Abs",
  Cardio: "Cardio",
  "Full body": "Full Body",
};

/** Derive the app muscle-group category from wger primary muscles. */
export function categoryForWgerMuscles(muscles: string[]): WorkoutCategory {
  for (const m of muscles) {
    const c = MUSCLE_CATEGORY[m];
    if (c) return c;
  }
  return "Full Body";
}

/* ------------------------------------------------------------------ */
/*  Description -> step-by-step form guide                             */
/* ------------------------------------------------------------------ */

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function cleanHtml(raw: string): string {
  return raw
    .replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITIES[m.toLowerCase()] ?? m)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Turn a wger description (HTML) into numbered step strings.
 * Prefers <li> items (wger form guides are usually <ol> lists);
 * falls back to sentence splitting for plain paragraphs.
 */
export function parseInstructions(description: string, max = 8): string[] {
  const items = [...description.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => cleanHtml(m[1]))
    .filter(Boolean);
  if (items.length > 0) return items.slice(0, max);
  const text = cleanHtml(description);
  return text
    .split(/\.\s+/)
    .map((s) => s.replace(/\.$/, "").trim())
    .filter((s) => s.length > 20)
    .slice(0, max);
}

/* ------------------------------------------------------------------ */
/*  Exercise detail (7-day cached)                                     */
/* ------------------------------------------------------------------ */

/** Fetch + cache one exercise by id. Returns null on any failure. */
export async function fetchWgerExercise(id: number): Promise<WgerExercise | null> {
  const cached = useWgerCache.get(id);
  // Ignore legacy cache entries whose image is the JSON endpoint.
  if (cached && isUsableImageUrl(cached.image)) return cached;
  try {
    const res = await fetch(`${API}/exerciseinfo/${id}/?language=${LANGUAGE}`, { headers: UA });
    if (!res.ok) return null;
    const ex = (await res.json()) as WgerApiExercise;
    const description = ex.translations?.find((t) => t.language === LANGUAGE)?.description ?? "";
    const main = ex.images?.find((i) => i.is_main);
    const data: WgerExercise = {
      id: ex.id,
      name: englishName(ex),
      description,
      muscles: (ex.muscles ?? []).map(nameOf).filter(Boolean),
      musclesSecondary: (ex.muscles_secondary ?? []).map(nameOf).filter(Boolean),
      equipment: (ex.equipment ?? []).map(nameOfEq).filter(Boolean),
      // Prefer the small thumbnail (200x200) for 80x80 card display.
      image: main?.thumbnails?.small ?? main?.thumbnails?.medium ?? main?.image,
      instructions: parseInstructions(description),
    };
    useWgerCache.set(id, data);
    return data;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Full index fetch (cached 7 days)                                   */
/* ------------------------------------------------------------------ */

const INDEX_PAGES = 10; // 966 exercises -> 10 pages of 100
const INDEX_DELAY_MS = 150;

/** Download the full published exercise list with English names. */
async function downloadWgerIndex(): Promise<WgerSearchHit[]> {
  const urls = Array.from({ length: INDEX_PAGES }, (_, i) => {
    const offset = i * 100;
    return `${API}/exerciseinfo/?language=${LANGUAGE}&status=2&limit=100&offset=${offset}`;
  });
  const pages = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results ?? []) as WgerApiExercise[];
    }),
  );
  // Small delay keeps the parallel burst polite to the free API.
  await new Promise((r) => setTimeout(r, INDEX_DELAY_MS));
  const seen = new Set<number>();
  const hits: WgerSearchHit[] = [];
  for (const page of pages) {
    for (const ex of page) {
      if (seen.has(ex.id)) continue;
      seen.add(ex.id);
      const name = englishName(ex);
      if (name) hits.push({ id: ex.id, name });
    }
  }
  return hits;
}

/** Full wger index, cached with the 7-day TTL. */
export async function getWgerIndex(): Promise<WgerSearchHit[]> {
  const cached = useWgerCache.getIndex();
  if (cached) return cached;
  const index = await downloadWgerIndex();
  if (index.length > 0) useWgerCache.setIndex(index);
  return index;
}

/** Client-side scoring match against the cached index. */
export function matchWgerIndex(index: WgerSearchHit[], query: string): WgerSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const score = (name: string): number => {
    const n = name.toLowerCase();
    if (n === q) return 100;
    if (n.startsWith(q)) return 60;
    if (n.includes(q)) return 40;
    // multi-word query: all words present
    if (q.includes(" ")) {
      const words = q.split(/\s+/);
      const hits = words.filter((w) => n.includes(w)).length;
      return (hits / words.length) * 35;
    }
    return 0;
  };
  return index
    .map((hit) => ({ hit, score: score(hit.name) }))
    .filter(({ score: s }) => s > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map(({ hit }) => hit);
}
