"use client";

import { useEffect } from "react";

/** Auto-dismiss confirmation toast for widget actions (4s). */
export function Toast({ message, onClose }: { message: string; onClose?: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(() => onClose?.(), 4000);
    return () => window.clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-2xl border border-card-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-[0_10px_40px_rgba(0,0,0,0.35)] animate-[fadein_200ms_ease-out,slideup_300ms_ease-out]">
      {message}
    </div>
  );
}
