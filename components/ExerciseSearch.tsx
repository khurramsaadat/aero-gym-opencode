"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, BookOpen } from "lucide-react";
import type { LocalExercise } from "@/lib/exercise-db";
import { getLocalExercises } from "@/lib/exercise-db";
import type { WgerSearchHit } from "@/lib/types";
import { getWgerIndex, matchWgerIndex } from "@/lib/wger";

export type SearchSelectable =
  | { kind: "local"; data: LocalExercise }
  | { kind: "wger"; data: WgerSearchHit };

interface ExerciseSearchProps {
  onSelect: (ex: SearchSelectable) => void;
  label?: string;
  placeholder?: string;
}

const DEBOUNCE_MS = 350;

/** Normalized name for deduplication between local and wger results. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Score a local hit against the query: exact > prefix > substring, muscle hits bonus. */
function scoreLocal(ex: LocalExercise, q: string): number {
  const n = ex.name.toLowerCase();
  let s = 0;
  if (n === q) s += 100;
  else if (n.startsWith(q)) s += 60;
  else if (n.includes(q)) s += 40;
  const muscleHits = ex.muscles.filter((m) => m.toLowerCase().includes(q)).length;
  s += muscleHits * 15;
  return s;
}

/**
 * Dual search box (PRD §4.10): local 200+ database plus the wger.de
 * index (fetched once, cached 7 days). Scoring-based client-side
 * matching with deduplication; brand-colored focus ring.
 */
export function ExerciseSearch({ onSelect, placeholder, label = "Search exercises" }: ExerciseSearchProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [wgerHits, setWgerHits] = useState<WgerSearchHit[]>([]);
  const [wgerState, setWgerState] = useState<"idle" | "loading" | "ready" | "failed">("idle");

  // Debounce the query so the wger index fetch is not spammed.
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  // Refresh wger hits whenever the debounced query changes.
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      if (debounced.length < 2) {
        setWgerHits([]);
        setWgerState("idle");
        return;
      }
      setWgerState("loading");
      try {
        const index = await getWgerIndex();
        if (cancelled) return;
        setWgerHits(matchWgerIndex(index, debounced));
        setWgerState("ready");
      } catch {
        if (!cancelled) setWgerState("failed");
      }
    };
    void refresh();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const q = debounced.toLowerCase();
  const localHits = useMemo(() => {
    if (!q) return [];
    return getLocalExercises()
      .map((ex) => ({ ex, score: scoreLocal(ex, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(({ ex }) => ex);
  }, [q]);

  // Deduplicate: a wger hit whose normalized name matches a local result is dropped.
  const localNames = useMemo(() => new Set(localHits.map((ex) => norm(ex.name))), [localHits]);
  const remoteHits = useMemo(
    () => wgerHits.filter((hit) => !localNames.has(norm(hit.name))),
    [wgerHits, localNames],
  );

  const showRemote = debounced.length >= 2;

  return (
    <div className="w-full">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-2">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? "e.g. bench press"}
          className="w-full rounded-2xl border border-card-border bg-card px-9 py-2.5 text-sm text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          autoFocus
        />
      </div>

      <ul className="mt-3 max-h-72 divide-y divide-card-border overflow-y-auto">
        {localHits.length === 0 && !showRemote && (
          <li className="px-2 py-3 text-center text-sm text-muted-2">
            {query.trim() ? "No matching exercises." : "Start typing to search 200+ exercises."}
          </li>
        )}

        {localHits.map((ex) => (
          <li key={`local-${ex.name}`}>
            <button
              onClick={() => onSelect({ kind: "local", data: ex })}
              className="flex w-full items-center gap-2.5 px-2 py-2.5 text-left transition-colors hover:bg-card-border"
            >
              <span className="flex-1">
                <span className="block text-sm font-semibold text-foreground">{ex.name}</span>
                <span className="mt-0.5 flex flex-wrap gap-1">
                  {ex.muscles.slice(0, 2).map((m) => (
                    <span key={m} className="text-[11px] text-muted-2">
                      {m}
                    </span>
                  ))}
                </span>
              </span>
              <span className="rounded-full border border-card-border bg-background px-2 py-0.5 text-[11px] text-muted-2">
                {ex.category}
              </span>
            </button>
          </li>
        ))}

        {showRemote && (
          <>
            <li className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-3">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3 w-3" />
                wger.de
                {wgerState === "loading" && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-2" />
                )}
              </span>
            </li>
            {wgerState === "failed" && (
              <li className="px-2 py-3 text-center text-sm text-muted-2">
                wger.de is unreachable right now - local results only.
              </li>
            )}
            {wgerState !== "failed" && remoteHits.length === 0 && (
              <li className="px-2 py-3 text-center text-sm text-muted-2">
                {wgerState === "loading"
                  ? "Loading wger.de exercises..."
                  : "No wger.de matches."}
              </li>
            )}
            {remoteHits.map((hit) => (
              <li key={`wger-${hit.id}`}>
                <button
                  onClick={() => onSelect({ kind: "wger", data: hit })}
                  className="flex w-full items-center gap-2.5 px-2 py-2.5 text-left transition-colors hover:bg-card-border"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-foreground">{hit.name}</span>
                  </span>
                  <span className="rounded-full border border-card-border bg-background px-2 py-0.5 text-[11px] text-muted-2">
                    wger
                  </span>
                </button>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}
