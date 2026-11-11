"use client";

import { useEffect, useRef } from "react";
import { useYear } from "./YearProvider";

interface BurgerButtonProps {
  open: boolean;
  onToggle: () => void;
  label: string;
}

/**
 * Animated burger: the middle line disappears first, then the top and
 * bottom lines rotate into a cross. The cross stays exactly centered
 * where the three lines were - no position shift.
 */
export function BurgerButton({ open, onToggle, label }: BurgerButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={label}
      aria-expanded={open}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-card text-muted-2 shadow-sm transition-colors duration-200 hover:border-accent hover:text-foreground"
    >
      <span className="relative block h-[21px] w-5">
        <span
          className={`absolute left-0 right-0 top-0 h-0.75 bg-current transition duration-200 ${
            open ? "translate-y-[9px] rotate-45 delay-75" : "delay-75"
          }`}
        />
        <span
          className={`absolute left-0 right-0 top-[9px] h-0.75 bg-current transition duration-200 ${
            open ? "opacity-0 delay-0" : "opacity-100 delay-75"
          }`}
        />
        <span
          className={`absolute left-0 right-0 bottom-0 h-0.75 bg-current transition duration-200 ${
            open ? "-translate-y-[9px] -rotate-45 delay-75" : "delay-75"
          }`}
        />
      </span>
    </button>
  );
}

interface BurgerMenuProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

/**
 * Full-page menu overlay: center-aligned links with staggered
 * fade-in-up entrance. Copyright sits at the bottom under a thin line.
 */
export function BurgerMenu({ open, onClose, children }: BurgerMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = overlayRef.current;
    if (!root) return;
    if (open) {
      root.classList.remove("pointer-events-none", "opacity-0");
      document.body.style.overflow = "hidden";
    } else {
      root.classList.add("pointer-events-none", "opacity-0");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-50 flex transition-opacity duration-300 opacity-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" aria-hidden />
      <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-background shadow-[1px_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-end px-4 pt-5">
          <BurgerButton open={open} onToggle={onClose} label={open ? "Close menu" : "Menu"} />
        </div>
        <nav className="mt-2 flex-1 overflow-y-auto px-4">{children}</nav>
        <footer className="mt-auto border-t border-card-border px-4 py-4 text-center text-[11px] text-muted">
          <p>
            {useYear()} Aero Gym by Khurram | All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

/** Staggered fade-in-up style for mobile menu links. */
export const menuLinkBase =
  "flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-2 transition duration-250 hover:bg-card-border hover:text-foreground motion-reduce:transition-none";

export function menuLinkDelay(index: number): string {
  return `${Math.min(75 + index * 60, 400)}ms`;
}

interface MenuLinkProps {
  index: number;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  children: React.ReactNode;
}

/** Center-aligned menu link with staggered fade-in-up entrance. */
export function MenuLink({ index, icon: Icon, onClick, children }: MenuLinkProps) {
  return (
    <button
      key={index}
      onClick={onClick}
      style={{ animationDelay: menuLinkDelay(index) }}
      className={`${menuLinkBase} fade-in-up`}
    >
      <Icon className="h-4.5 w-4.5" />
      {children}
    </button>
  );
}
