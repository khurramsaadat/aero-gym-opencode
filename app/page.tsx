"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar, TABS, type TabId } from "@/components/Sidebar";
import { BottomNav, MOBILE_TABS, type MobileTabId } from "@/components/BottomNav";
import { BurgerMenu, MenuLink } from "@/components/BurgerMenu";
import { StickyTopBar } from "@/components/StickyTopBar";
import { WorkoutsView } from "@/components/WorkoutsView";
import { useSettings } from "@/lib/storage";
import { Dumbbell, Users } from "lucide-react";

const VIEW_META: Record<
  TabId,
  { title: string; subtitle: string; emptyTitle: string; emptyNote: string }
> = {
  workouts: {
    title: "Workouts",
    subtitle: "Log your training",
    emptyTitle: "No workouts logged yet",
    emptyNote: "Your sessions for this day will appear here. Add your first exercise to get started.",
  },
  analytics: {
    title: "Analytics",
    subtitle: "Insights from your sessions",
    emptyTitle: "No data yet",
    emptyNote: "Complete a workout and your volume, muscles and consistency insights will show up here.",
  },
  progress: {
    title: "Progress",
    subtitle: "Track strength over time",
    emptyTitle: "Nothing tracked yet",
    emptyNote: "Log workouts with weight and reps to build your progress charts.",
  },
  history: {
    title: "History",
    subtitle: "Your training calendar",
    emptyTitle: "No history yet",
    emptyNote: "Workout days will appear on the calendar as you log sessions.",
  },
  coaches: {
    title: "Coaches",
    subtitle: "Expert guidance",
    emptyTitle: "No coaches listed yet",
    emptyNote: "Certified coaches with specialties, experience and rates will be listed here.",
  },
  weather: {
    title: "Weather",
    subtitle: "Plan your session",
    emptyTitle: "Weather unavailable",
    emptyNote: "Allow location access to see current conditions and forecasts for your area.",
  },
};

export default function Home() {
  // SSR-safe: default to "workouts" on first render, restore the
  // persisted tab in a mount effect (same pattern as date state -
  // server can't read localStorage, so a lazy initializer that
  // reads it would hydrate-mismatch whenever a tab is saved).
  const [activeTab, setActiveTabState] = useState<TabId>("workouts");

  useEffect(() => {
    const saved = useSettings.getActiveTab();
    if (saved && (TABS as readonly { id: TabId }[]).some((t) => t.id === saved)) {
      // SSR-safe: restoring after mount keeps server HTML (always
      // "workouts") from mismatching the first client render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTabState(saved as TabId);
    }
  }, []);
  const [burgerOpen, setBurgerOpen] = useState(false);

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);
    useSettings.setActiveTab(tab);
    setBurgerOpen(false);
  };

  // Keep mobile bottom nav type aligned with the full tab set.
  const mobileTab = useMemo<MobileTabId>(
    () => (MOBILE_TABS as readonly { id: string }[]).some((t) => t.id === activeTab)
      ? (activeTab as MobileTabId)
      : "workouts",
    [activeTab],
  );

  const meta = VIEW_META[activeTab];

  return (
    <div className="flex h-screen min-h-0 w-full flex-col overflow-hidden bg-background text-foreground xl:flex-row">
      {/* Sticky mobile top bar */}
      <StickyTopBar
        menuOpen={burgerOpen}
        onHome={() => setActiveTab("workouts")}
        onMenuOpen={() => setBurgerOpen((v) => !v)}
      />

      {/* Desktop sidebar */}
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />

      {/* Main area */}
      <main className="flex min-h-0 flex-1 flex-col xl:ml-0">
        <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-24 pt-16 xl:pt-8">
          {activeTab === "workouts" ? (
            <WorkoutsView onOpenWeather={() => setActiveTab("weather")} />
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold tracking-tight">{meta.title}</h1>
              <p className="mt-1 text-sm text-muted-2">{meta.subtitle}</p>
              <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-card-border py-24 text-center">
                <p className="font-display text-lg font-semibold text-muted">{meta.emptyTitle}</p>
                <p className="mt-2 max-w-xs text-sm text-muted-2">{meta.emptyNote}</p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav activeTab={mobileTab} onSelect={(t) => setActiveTab(t)} />

      {/* Burger menu */}
      <BurgerMenu open={burgerOpen} onClose={() => setBurgerOpen(false)}>
        <MenuLink index={0} icon={Dumbbell} onClick={() => setActiveTab("workouts")}>
          Workouts
        </MenuLink>
        <MenuLink index={1} icon={Users} onClick={() => setActiveTab("coaches")}>
          Coaches
        </MenuLink>
      </BurgerMenu>
    </div>
  );
}
