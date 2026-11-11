"use client";

import { useEffect, useMemo, useState } from "react";
import { Dumbbell } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { WorkoutLog } from "@/lib/types";
import { STORAGE_KEYS, subscribeToStorage, useWorkoutLogs } from "@/lib/storage";

/**
 * Map any muscle naming (app-style or wger-style) onto the app's
 * muscle groups so the donut aggregates cleanly.
 */
const MUSCLE_MAP: Array<[RegExp, string]> = [
  [/bicep|brachialis|forearm/i, "Biceps"],
  [/tricep/i, "Triceps"],
  [/chest|pec/i, "Chest"],
  [/lat|rhomboid|erector/i, "Back"],
  [/deltoid|shoulder|trap/i, "Shoulders"],
  [/quad/i, "Quadriceps"],
  [/hamstring/i, "Legs"],
  [/calf/i, "Calves"],
  [/glute/i, "Glutes"],
  [/ab|oblique|core|hip flexor/i, "Abs"],
  [/cardio/i, "Cardio"],
];

function mapMuscle(muscle: string): string {
  for (const [re, group] of MUSCLE_MAP) {
    if (re.test(muscle)) return group;
  }
  return "Other";
}

/** Brand slice first, then theme neutrals. */
const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-3)",
  "var(--color-chart-6)",
  "var(--color-chart-5)",
  "var(--color-chart-4)",
  "var(--color-chart-7)",
  "var(--color-chart-2)",
];

/** In-slice label: bold white, shown for slices >= 4.5% of volume. */
function renderSliceLabel(labelProps: PieLabelRenderProps) {
  const { cx, cy, midAngle, percent, payload } = labelProps;
  const pct = percent ?? 0;
  if (!payload || pct < 0.045 || cx === undefined || cy === undefined || midAngle === undefined) {
    return null;
  }
  const RADIAN = Math.PI / 180;
  const x = Number(cx) + 52 * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + 52 * Math.sin(-Number(midAngle) * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      stroke="rgba(0,0,0,0.4)"
      strokeWidth={2}
      paintOrder="stroke"
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight={700}
      fontSize={11}
    >
      {payload.name}
      {pct >= 0.12 && ` ${Math.round(pct * 100)}%`}
    </text>
  );
}

/**
 * Muscle Balance Donut (PRD §4.5): aggregates every logged workout's
 * muscles into the app's groups, shows the top 7 plus "Other".
 */
export function MuscleBalanceDonut() {
  const [logs, setLogs] = useState<WorkoutLog>(() => useWorkoutLogs.get());

  useEffect(() => {
    return subscribeToStorage(STORAGE_KEYS.workoutLogs, () => setLogs(useWorkoutLogs.get()));
  }, []);

  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of Object.values(logs)) {
      for (const w of day) {
        const muscles = w.muscles?.length ? w.muscles : w.category ? [w.category] : [];
        for (const m of muscles) {
          counts.set(mapMuscle(m), (counts.get(mapMuscle(m)) ?? 0) + 1);
        }
      }
    }
    let rows = [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    if (rows.length > 7) {
      const top = rows.slice(0, 7);
      const other = rows.slice(7).reduce((sum, r) => sum + r.value, 0);
      rows = [...top, { name: "Other", value: other }];
    }
    return rows;
  }, [logs]);

  return (
    <section className="rounded-2xl border border-card-border bg-card p-3">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <Dumbbell className="h-4 w-4 text-accent" aria-hidden />
        Muscle Balance
      </h2>
      {data.length === 0 ? (
        <div className="mt-4 flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-card-border text-center">
          <Dumbbell className="h-8 w-8 text-muted-2" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-muted">Log workouts to see your muscle balance.</p>
        </div>
      ) : (
        <div className="mt-2 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={76}
                paddingAngle={2}
                label={renderSliceLabel}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-card-border)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                formatter={(value: unknown): [number, string] | string =>
                  typeof value === "number" ? [value, "workouts"] : "-"
                }
                labelFormatter={(label) => `Muscle: ${label}`}
              />
              <Legend verticalAlign="bottom" height={28} wrapperStyle={{ marginTop: 4 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
