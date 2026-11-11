"use client";

import { Dumbbell, ChartBar, TrendingUp, History, Users, CloudSun } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

export const TABS = [
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "analytics", label: "Analytics", icon: ChartBar },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "history", label: "History", icon: History },
  { id: "coaches", label: "Coaches", icon: Users },
  { id: "weather", label: "Weather", icon: CloudSun },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface SidebarProps {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
}

/**
 * Desktop left sidebar (1024px+): tab labels + icons (PRD §4.1),
 * theme toggle in the header, app logo icon + text.
 */
export function Sidebar({ activeTab, onSelect }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-card-border bg-background py-4 xl:flex">
      <div className="mx-3 flex items-center gap-2 border-b border-card-border px-3 pb-3">
        <Image
          src="/android-chrome-512x512.png"
          alt=""
          width={32}
          height={32}
          className="rounded"
          priority
        />
        <span className="font-display text-lg font-bold tracking-wide text-foreground">Aero Gym</span>
      </div>
      <nav className="mt-4 flex-1 space-y-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-accent-soft text-accent-text"
                  : "text-muted-2 hover:bg-card-border hover:text-foreground"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-card-border pt-3">
        <div className="flex items-center gap-3 px-3">
          <ThemeToggle />
          <span className="text-xs text-muted">Theme</span>
        </div>
      </div>
    </aside>
  );
}
