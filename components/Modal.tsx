"use client";

import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/** Generic centered modal with scrim and scroll lock. */
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
        role="button"
        tabIndex={-1}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-card-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-card-border px-5 py-3.5">
          <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-muted-2 transition-colors hover:bg-card-border hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
