"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "@/lib/storage";

export type ThemeName = "dark" | "light";

const ThemeCtx = createContext<{
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "dark";
    return useSettings.getTheme();
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    useSettings.setTheme(t);
  };

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): { theme: ThemeName; setTheme: (t: ThemeName) => void } {
  return useContext(ThemeCtx);
}
