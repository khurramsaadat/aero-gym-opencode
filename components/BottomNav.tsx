"use client";

import { Dumbbell, ChartBar, TrendingUp, History } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const MOBILE_TABS = [
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "analytics", label: "Analytics", icon: ChartBar },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "history", label: "History", icon: History },
] as const;

export type MobileTabId = (typeof MOBILE_TABS)[number]["id"];

interface BottomNavProps {
  activeTab: MobileTabId;
  onSelect: (tab: MobileTabId) => void;
}

/**
 * Mobile bottom tab bar (PRD §4.1): theme toggle first, then
 * Workouts, Analytics, Progress, History (Weather pill navigates
 * to the Weather page; Coaches lives in the burger menu).
 */
export function BottomNav({ activeTab, onSelect }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-1 bg-background/92 backdrop-blur-sm border-t border-card-border px-1 py-2 xl:hidden">
      <div className="w-12 flex justify-center">
        <ThemeToggle />
      </div>
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition-colors ${
              isActive ? "text-accent-text" : "text-muted-2"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "" : ""}`} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
