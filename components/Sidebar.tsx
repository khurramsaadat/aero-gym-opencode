"use client";

import { Dumbbell, ChartBar, TrendingUp, History, Users, CloudSun } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarWidgets } from "./SidebarWidgets";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
 * Desktop left sidebar (PRD §4.1, 1024px+): tab labels + icons, the
 * sidebar widgets (measurements, BMI, templates, achievements,
 * muscle balance, settings) in a scrollable stack, and the theme
 * toggle pinned in the header.
 */
export function Sidebar({ activeTab, onSelect }: SidebarProps) {
  // The sidebar is `hidden` below `lg`, so charts inside the widgets
  // must not mount there: Recharts would measure a 0x0 container.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-card-border bg-background py-4 lg:flex">
      <div className="mx-3 flex items-center gap-2 border-b border-card-border px-3 pb-3">
        <button
          onClick={() => onSelect("workouts")}
          aria-label="Home"
          className="flex items-center gap-2"
        >
          <Image
            src="/android-chrome-512x512.png"
            alt=""
            width={32}
            height={32}
            className="rounded"
            priority
          />
          <span className="font-display text-lg font-bold tracking-wide text-foreground">Aero Gym</span>
        </button>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
      <nav className="mt-4 space-y-1">
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
      <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
        {isDesktop && <SidebarWidgets />}
      </div>
    </aside>
  );
}
