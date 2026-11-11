"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { STORAGE_KEYS, subscribeToStorage, useSettings } from "@/lib/storage";

export type ThemeName = "dark" | "light";

const ThemeCtx = createContext<{
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}>({ theme: "dark", setTheme: () => {} });

function subscribe(cb: () => void) {
  return subscribeToStorage(STORAGE_KEYS.theme, cb);
}

function getSnapshot(): ThemeName {
  return useSettings.getTheme();
}

/** Server HTML and the hydration render always use "dark". */
function getServerSnapshot(): ThemeName {
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore keeps the server snapshot and the hydration
  // render identical, then swaps to the persisted theme after mount.
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => {
    useSettings.setTheme(t);
  };

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): { theme: ThemeName; setTheme: (t: ThemeName) => void } {
  return useContext(ThemeCtx);
}
