"use client";

import Image from "next/image";
import { BurgerButton } from "./BurgerMenu";

interface StickyTopBarProps {
  menuOpen: boolean;
  onHome: () => void;
  onMenuOpen: () => void;
}

/**
 * Sticky mobile top bar, visible on all pages (PRD §4.2 compact top
 * row): app logo + name on the left (click = Home) and the animated
 * burger menu button on the right.
 */
export function StickyTopBar({ menuOpen, onHome, onMenuOpen }: StickyTopBarProps) {
  return (
    <header className="fixed top-0 z-40 flex h-14 w-full items-center justify-between bg-background/92 backdrop-blur-sm border-b border-card-border px-3 sm:px-4">
      <button onClick={onHome} aria-label="Home" className="flex items-center gap-2">
        <Image
          src="/android-chrome-512x512.png"
          alt="Aero Gym"
          width={28}
          height={28}
          className="rounded"
          priority
        />
        <span className="font-display text-base font-bold tracking-wide text-foreground">
          Aero Gym
        </span>
      </button>
      <BurgerButton open={menuOpen} onToggle={onMenuOpen} label="Menu" />
    </header>
  );
}
