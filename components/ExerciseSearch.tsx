"use client";

import { useMemo, useState } from "react";
import type { LocalExercise } from "@/lib/exercise-db";
import { searchExercises } from "@/lib/exercise-db";
import { Search } from "lucide-react";

interface ExerciseSearchProps {
  onSelect: (exercise: LocalExercise) => void;
  placeholder?: string;
  label?: string;
}

/** Search box over the local 200+ exercise database (PRD §4.10).
 *  M3 extends this to dual local + wger.de search. */
export function ExerciseSearch({ onSelect, placeholder, label = "Search exercises" }: ExerciseSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchExercises(query), [query]);

  return (
    <div className="w-full">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-2">{label}</label>
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
      <ul className="mt-3 max-h-64 divide-y divide-card-border overflow-y-auto">
        {results.length === 0 && (
          <li className="px-2 py-3 text-center text-sm text-muted-2">
            {query.trim() ? "No matching exercises." : "Start typing to search 200+ exercises."}
          </li>
        )}
        {results.map((ex) => (
          <li key={ex.name}>
            <button
              onClick={() => onSelect(ex)}
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
      </ul>
    </div>
  );
}
