"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

/**
 * Single-icon DARK/DAY toggle (PRD §3). Used as the first item of the
 * mobile bottom nav and as an icon in the desktop sidebar header.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Day mode" : "Dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-card text-muted-2 shadow-sm transition-colors duration-200 hover:border-accent hover:text-foreground"
    >
      {theme === "dark" ? (
        <Sun className="h-4.5 w-4.5 transition-transform duration-200" />
      ) : (
        <Moon className="h-4.5 w-4.5 transition-transform duration-200" />
      )}
    </button>
  );
}
