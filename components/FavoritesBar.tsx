"use client";

import { useEffect, useRef, useState } from "react";
import { Star, X, Check } from "lucide-react";
import { STORAGE_KEYS, subscribeToStorage, useFavorites } from "@/lib/storage";
import type { FavoriteExercise } from "@/lib/types";

interface FavoritesBarProps {
  onAdd: (exercise: FavoriteExercise) => void;
}

/**
 * Quick-add favorites bar (PRD §4.2): pin up to 10 exercises for
 * one-tap adding. Pills wrap to multiple rows, show a gold "Added!"
 * flash on tap, and enter Edit/Done mode for mobile-friendly delete.
 */
export function FavoritesBar({ onAdd }: FavoritesBarProps) {
  const [favorites, setFavoritesState] = useState(useFavorites.get());
  const [editMode, setEditMode] = useState(false);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const flashTimeout = useRef<number | null>(null);

  useEffect(() => {
    return subscribeToStorage(STORAGE_KEYS.favorites, () => setFavoritesState(useFavorites.get()));
  }, []);

  const limited = favorites.slice(0, 10);

  const handleAdd = (fav: FavoriteExercise, index: number) => {
    onAdd(fav);
    setFlashIndex(index);
    if (flashTimeout.current) window.clearTimeout(flashTimeout.current);
    flashTimeout.current = window.setTimeout(() => setFlashIndex(null), 700);
  };

  const handleRemove = (name: string) => {
    const favs = useFavorites.get().filter((f) => f.name !== name);
    useFavorites.set(favs);
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-2">
          <Star className="h-3.5 w-3.5" />
          Quick add
        </span>
        {limited.length > 0 && (
          <button
            onClick={() => setEditMode((v) => !v)}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-2 transition-colors hover:bg-card-border"
          >
            {editMode ? "Done" : "Edit"}
          </button>
        )}
      </div>
      {limited.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-card-border px-4 py-6 text-center">
          <p className="text-sm text-muted-2">
            No quick-add favorites yet. Star an exercise to pin it here for one-tap adding.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {limited.map((fav, index) => {
            const isFlash = flashIndex === index;
            return (
              <button
                key={fav.name}
                onClick={() => (editMode ? handleRemove(fav.name) : handleAdd(fav, index))}
                className={`group relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all ${
                  editMode
                    ? "border-muted-3 bg-card text-muted-2 hover:border-destructive hover:text-destructive"
                    : "border-accent-soft bg-accent-soft/60 text-foreground hover:scale-105"
                }`}
              >
                {!editMode && isFlash && (
                  <span className="absolute -inset-0.5 animate-ping rounded-full bg-accent/40" aria-hidden />
                )}
                {isFlash && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-accent-text">
                    <Check className="mr-0.5 h-3 w-3" />
                    Added!
                  </span>
                )}
                <span className={isFlash ? "invisible" : ""}>{fav.name}</span>
                {editMode && (
                  <X className="h-3.5 w-3.5 text-muted-2 transition-colors group-hover:text-destructive" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
