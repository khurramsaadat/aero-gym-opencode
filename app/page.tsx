"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar, TABS, type TabId } from "@/components/Sidebar";
import { BottomNav, MOBILE_TABS, type MobileTabId } from "@/components/BottomNav";
import { BurgerMenu, MenuLink } from "@/components/BurgerMenu";
import { StickyTopBar } from "@/components/StickyTopBar";
import { WorkoutsView } from "@/components/WorkoutsView";
import { AnalyticsView } from "@/components/AnalyticsView";
import { ProgressView } from "@/components/ProgressView";
import { HistoryView } from "@/components/HistoryView";
import { WeatherView } from "@/components/WeatherView";
import { CoachesView } from "@/components/CoachesView";
import { Footer } from "@/components/Footer";
import { useSettings } from "@/lib/storage";
import { ChartBar, CloudSun, Dumbbell, History, TrendingUp, Users } from "lucide-react";

function isTab(value: string | null): value is TabId {
  return !!value && (TABS as readonly { id: string }[]).some((tab) => tab.id === value);
}

export default function Home() {
  // SSR-safe: default to "workouts" on first render, restore the tab
  // from the URL or localStorage once mounted. useSearchParams also runs
  // on soft navigation, so footer links switch views without a reload.
  const [activeTab, setActiveTabState] = useState<TabId>("workouts");
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromUrl = searchParams.get("tab");
    const saved = useSettings.getActiveTab();
    const next = isTab(fromUrl) ? fromUrl : isTab(saved) ? saved : null;
    if (next) {
      // SSR-safe: restoring after mount keeps server HTML (always
      // "workouts") from mismatching the first client render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTabState(next);
    }
  }, [searchParams]);

  const [burgerOpen, setBurgerOpen] = useState(false);
  const [workoutDate, setWorkoutDate] = useState<string | null>(null);

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);
    useSettings.setActiveTab(tab);
    setBurgerOpen(false);
    // Keep the tab in the URL so footer links, bookmarks and reloads land
    // on the right view without a round trip.
    const url = new URL(window.location.href);
    if (tab === "workouts") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url);
  };

  // Keep mobile bottom nav type aligned with the full tab set.
  const mobileTab = useMemo<MobileTabId>(
    () =>
      (MOBILE_TABS as readonly { id: string }[]).some((t) => t.id === activeTab)
        ? (activeTab as MobileTabId)
        : "workouts",
    [activeTab],
  );

  return (
    <div className="flex h-screen min-h-0 w-full flex-col overflow-hidden bg-background text-foreground lg:flex-row">
      {/* Sticky mobile top bar */}
      <StickyTopBar
        menuOpen={burgerOpen}
        onHome={() => setActiveTab("workouts")}
        onMenuOpen={() => setBurgerOpen((v) => !v)}
      />

      {/* Desktop sidebar */}
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />

      {/* Main area */}
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-24 pt-16 lg:pt-8">
          {activeTab === "workouts" ? (
            <WorkoutsView
              requestedDate={workoutDate}
              onOpenWeather={() => setActiveTab("weather")}
            />
          ) : activeTab === "analytics" ? (
            <AnalyticsView />
          ) : activeTab === "progress" ? (
            <ProgressView />
          ) : activeTab === "history" ? (
            <HistoryView
              onOpenDay={(date) => {
                setWorkoutDate(date);
                setActiveTab("workouts");
              }}
            />
          ) : activeTab === "coaches" ? (
            <CoachesView />
          ) : (
            <WeatherView />
          )}

          <Footer className="mt-8" />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav activeTab={mobileTab} onSelect={(t) => setActiveTab(t)} />

      {/* Burger menu */}
      <BurgerMenu open={burgerOpen} onClose={() => setBurgerOpen(false)}>
        {(
          [
            { id: "workouts", label: "Workouts", icon: Dumbbell },
            { id: "analytics", label: "Analytics", icon: ChartBar },
            { id: "progress", label: "Progress", icon: TrendingUp },
            { id: "history", label: "History", icon: History },
            { id: "coaches", label: "Coaches", icon: Users },
            { id: "weather", label: "Weather", icon: CloudSun },
          ] as const
        ).map((link, index) => (
          <MenuLink
            key={link.id}
            index={index}
            icon={link.icon}
            onClick={() => {
              setActiveTab(link.id);
              setBurgerOpen(false);
            }}
          >
            {link.label}
          </MenuLink>
        ))}
      </BurgerMenu>
    </div>
  );
}
