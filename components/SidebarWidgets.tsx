"use client";

import { useSyncExternalStore } from "react";
import { AchievementsPanel } from "./AchievementsPanel";
import { BmiCard } from "./BmiCard";
import { MeasurementsPanel } from "./MeasurementsPanel";
import { MuscleBalanceDonut } from "./MuscleBalanceDonut";
import { SettingsPanel } from "./SettingsPanel";
import { TemplatesPanel } from "./TemplatesPanel";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Every burger-menu / sidebar widget from PRD §4.5, stacked in order:
 * measurements, BMI & body composition, templates, achievements,
 * muscle balance, settings (with About).
 *
 * The widgets read localStorage in their state initializers, so they
 * mount only after hydration. Rendering them during SSR would make
 * the first client render differ whenever the user has saved data.
 */
export function SidebarWidgets() {
  const hydrated = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  if (!hydrated) return null;

  return (
    <div className="space-y-3">
      <MeasurementsPanel />
      <BmiCard />
      <TemplatesPanel />
      <AchievementsPanel />
      <MuscleBalanceDonut />
      <SettingsPanel />
    </div>
  );
}
