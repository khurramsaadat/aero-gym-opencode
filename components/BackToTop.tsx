"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

const THRESHOLD = 600;

/**
 * Back to top button (protocol): appears after 600px of scrolling and
 * returns the active scroll container to the top smoothly. The app
 * scrolls an inner element on desktop, so the listener runs in capture
 * mode and remembers whichever element actually scrolled.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const scroller = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        scroller.current = target;
        setVisible(target.scrollTop > THRESHOLD);
        return;
      }
      scroller.current = null;
      setVisible(window.scrollY > THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  const scrollToTop = () => {
    const element = scroller.current;
    if (element) {
      element.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-40 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-card text-muted-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-accent hover:text-accent-text lg:bottom-24 lg:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4" aria-hidden />
    </button>
  );
}
