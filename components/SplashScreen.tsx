"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SPLASH_KEY = "aero-splash-shown";
const SPLASH_MS = 2500;

// React's development double-effect check re-runs this effect immediately.
// The second run must not skip the hide timer, so the claim lives at module
// level and the timer is never cleared by the simulated unmount.
let splashClaimed = false;

/**
 * Splash screen (PRD §4.12): a black and white gym photo with the logo,
 * shown for 2.5 seconds once per browser session.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (splashClaimed) return;
    splashClaimed = true;
    try {
      if (sessionStorage.getItem(SPLASH_KEY) === "1") return;
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    window.setTimeout(() => setVisible(false), SPLASH_MS);
    // Intentionally no cleanup: the overlay is mounted for the app's
    // lifetime, and clearing the timer here would leave it on screen.
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      role="presentation"
      aria-hidden="true"
    >
      <Image
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-45 grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      <div className="relative flex flex-col items-center">
        <Image
          src="/android-chrome-512x512.png"
          alt="Aero Gym"
          width={88}
          height={88}
          priority
          className="rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        />
        <span className="mt-4 font-display text-2xl font-bold tracking-[0.2em] text-white">
          AERO GYM
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">
          Train with intent
        </span>
      </div>
    </div>
  );
}
