"use client";

import { useRef, useState } from "react";
import { Bell, Clock, Download, Info, Smartphone, Trash2, Upload, Volume2 } from "lucide-react";
import {
  clearAllData,
  exportAllData,
  importAllData,
  useBodyWeight,
  useFavorites,
  useMeasurements,
  useSettings,
  useWorkoutLogs,
} from "@/lib/storage";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { isHapticAvailable, isHapticsEnabled, setHapticsEnabled } from "@/lib/haptics";
import {
  isNotificationsEnabled,
  requestNotificationPermission,
  setNotificationsEnabled,
} from "@/lib/notifications";
import { APP_NAME, COPYRIGHT } from "@/lib/constants";
import { Modal } from "./Modal";
import { Toast } from "./Toast";

type ClearTarget = "workouts" | "bodyWeight" | "measurements" | "favorites" | "all";

const CLEAR_META: Record<ClearTarget, { label: string; note: string }> = {
  workouts: { label: "Workout logs", note: "Every logged workout and history entry" },
  bodyWeight: { label: "Body weight", note: "The whole weight log" },
  measurements: { label: "Measurements", note: "All tape measurement entries" },
  favorites: { label: "Favorites", note: "Pinned quick-add exercises" },
  all: { label: "Everything", note: "All app data - workouts, templates, settings, cache" },
};

/**
 * Settings widget (PRD §4.5): rest timer, sound, haptic and
 * notification toggles, backup export/import with drag-and-drop,
 * granular clear-data with double-tap confirmation, and the About
 * section. Sound/haptics/notifications are module state on purpose -
 * the PRD storage key set has no keys for them.
 */
export function SettingsPanel() {
  const [restTimer, setRestTimerState] = useState(() => useSettings.isRestTimerEnabled());
  const [sound, setSoundState] = useState(() => isSoundEnabled());
  const [haptics, setHapticsState] = useState(() => isHapticsEnabled());
  const [notifications, setNotificationsState] = useState(() => isNotificationsEnabled());
  const [clearConfirm, setClearConfirm] = useState<ClearTarget | null>(null);
  const [importData, setImportData] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const runClear = (target: ClearTarget) => {
    if (clearConfirm === target) {
      setClearConfirm(null);
      if (target === "all") clearAllData();
      else if (target === "workouts") useWorkoutLogs.set({});
      else if (target === "bodyWeight") useBodyWeight.set({});
      else if (target === "measurements") useMeasurements.set({});
      else if (target === "favorites") useFavorites.set([]);
      setToast(`${CLEAR_META[target].label} cleared`);
      return;
    }
    setClearConfirm(target);
    window.setTimeout(() => setClearConfirm(null), 4000);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aero-gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Backup exported");
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(reader.result as string);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          setToast("Invalid backup file");
          return;
        }
        setImportData(parsed as Record<string, unknown>);
      } catch {
        setToast("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!importData) return;
    importAllData(importData);
    setImportData(null);
    setToast("Backup imported - reloading");
    window.setTimeout(() => window.location.reload(), 700);
  };

  return (
    <section className="rounded-2xl border border-card-border bg-card p-3">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <Volume2 className="h-4 w-4 text-accent" aria-hidden />
        Settings
      </h2>

      {/* Toggles */}
      <div className="mt-3 space-y-2">
        <ToggleRow
          icon={Clock}
          title="Rest timer"
          note="Count-up timer between sets"
          on={restTimer}
          onToggle={() => {
            useSettings.setRestTimer(!restTimer);
            setRestTimerState(!restTimer);
          }}
        />
        <ToggleRow
          icon={Volume2}
          title="Sound effects"
          note="Set, PR and timer sounds"
          on={sound}
          onToggle={() => {
            setSoundEnabled(!sound);
            setSoundState(!sound);
          }}
        />
        <ToggleRow
          icon={Smartphone}
          title="Haptic feedback"
          note={isHapticAvailable() ? "Vibrate on key actions" : "Not supported on this device"}
          on={haptics}
          onToggle={() => {
            setHapticsEnabled(!haptics);
            setHapticsState(!haptics);
          }}
          disabled={!isHapticAvailable()}
        />
        <ToggleRow
          icon={Bell}
          title="Notifications"
          note="Completion notifications"
          on={notifications}
          onToggle={() => {
            if (notifications) {
              setNotificationsEnabled(false);
              setNotificationsState(false);
              return;
            }
            void (async () => {
              const granted = (await requestNotificationPermission()) === "granted";
              setNotificationsEnabled(granted);
              setNotificationsState(granted);
              if (granted) setToast("Notifications enabled");
              else setToast("Permission denied - allow Aero Gym in your browser settings");
            })();
          }}
        />
      </div>

      {/* Data: export / import */}
      <div className="mt-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Data</h3>
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 rounded-xl border border-card-border bg-background px-3 py-2 text-sm font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-muted-3 hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5 inline" aria-hidden />
            Export backup
          </button>
          <ImportDropZone onFile={handleFile} />
        </div>
      </div>

      {/* Granular clear-data with double-tap confirmation */}
      <div className="mt-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Clear data</h3>
        {(Object.keys(CLEAR_META) as ClearTarget[]).map((target) => {
          const confirming = clearConfirm === target;
          return (
            <div key={target} className="relative mt-1">
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-destructive transition-[width] duration-[4000ms] ease-linear ${
                  confirming ? "w-full" : "w-0"
                }`}
              />
              <button
                type="button"
                onClick={() => runClear(target)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 transition-colors ${
                  confirming
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-card-border bg-background text-muted-2 hover:border-destructive hover:text-destructive"
                }`}
              >
                <span>
                  <span className="mr-1 font-semibold text-foreground">{CLEAR_META[target].label}</span>
                  <span className="text-[10px] text-muted-2">{CLEAR_META[target].note}</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {confirming ? "Tap again" : "Clear"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* About */}
      <div className="mt-4 rounded-xl border border-card-border bg-background px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-2" aria-hidden />
          <span className="font-display text-sm font-bold text-foreground">{APP_NAME}</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-2">
          Local-first gym tracker. Your data stays in your browser - no account, no cloud.
        </p>
        <p className="mt-0.5 text-[11px] text-muted-2">v0.1.0 - {COPYRIGHT}</p>
      </div>

      {importData && (
        <Modal open onClose={() => setImportData(null)} title="Import backup?">
          <div className="space-y-3">
            <p className="text-sm text-muted-2">
              This overwrites your existing data with the backup contents. This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImportData(null)}
                className="flex-1 rounded-full border border-card-border bg-card px-4 py-2 text-sm font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-muted-3 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmImport}
                className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wider text-accent-text transition-colors hover:opacity-90"
              >
                Import
              </button>
            </div>
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}

interface ToggleRowProps {
  icon: typeof Bell;
  title: string;
  note: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/** Single-switch settings row with a sliding toggle. */
function ToggleRow({ icon: Icon, title, note, on, onToggle, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-card-border bg-background px-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`h-4.5 w-4.5 shrink-0 ${disabled ? "text-muted-3" : "text-muted-2"}`} aria-hidden />
        <span className="min-w-0">
          <span className={`block truncate text-sm font-semibold ${disabled ? "text-muted-2" : "text-foreground"}`}>
            {title}
          </span>
          <span className={`block truncate text-[10px] ${disabled ? "text-muted-3" : "text-muted-2"}`}>{note}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        disabled={disabled}
        aria-label={`${on ? "Disable" : "Enable"} ${title}`}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          on ? "bg-accent" : "bg-card-border"
        } ${disabled ? "opacity-50" : "hover:bg-accent/80"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform duration-200 ${
            on ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

/** Drag-and-drop import zone with a tap-to-browse fallback. */
function ImportDropZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      className={`flex-1 rounded-xl border px-3 py-2 text-center transition-colors ${
        drag ? "border-accent bg-accent-soft/40" : "border-card-border bg-background"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <Upload className="mx-auto h-4 w-4 text-muted-2" aria-hidden />
      <span className="ml-1 text-sm font-bold uppercase tracking-wider text-muted-2">Import</span>
    </div>
  );
}
