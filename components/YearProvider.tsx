"use client";

import { createContext, useContext, useState } from "react";

/**
 * Copyright year, baked in by the server layout (client components
 * cannot call `new Date()` during prerender on static routes).
 */
const YearCtx = createContext<number>(2026);

export function YearProvider({ initial, children }: { initial: number; children: React.ReactNode }) {
  const [year] = useState(initial);
  return <YearCtx.Provider value={year}>{children}</YearCtx.Provider>;
}

export function useYear(): number {
  return useContext(YearCtx);
}
