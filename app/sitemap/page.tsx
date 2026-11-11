import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { LAST_UPDATED } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every page in Aero Gym, plus the app views and the external data sources it uses.",
  alternates: { canonical: "/sitemap" },
};

const APP_LINKS = [
  { label: "Workouts", href: "/?tab=workouts", note: "Daily log, sets, favorites, timers" },
  { label: "Analytics", href: "/?tab=analytics", note: "Volume, muscle split, consistency" },
  { label: "Progress", href: "/?tab=progress", note: "Exercise and body weight trends" },
  { label: "History", href: "/?tab=history", note: "Calendar and muscle distribution" },
  { label: "Weather", href: "/?tab=weather", note: "Conditions, air quality, 7-day forecast" },
  { label: "Coaches", href: "/?tab=coaches", note: "Coach directory and profiles" },
];

const PAGES = [
  { label: "Home", href: "/", note: "The training app" },
  { label: "Careers", href: "/careers", note: "How the product is built" },
  { label: "Privacy Policy", href: "/privacy", note: "Local data and third parties" },
  { label: "Terms of Service", href: "/terms", note: "Use of the app" },
  { label: "Sitemap", href: "/sitemap", note: "This page" },
];

/** HTML sitemap: app views, standalone pages and data sources. */
export default function SitemapPage() {
  return (
    <LegalShell
      title="Sitemap"
      intro="A plain index of everything Aero Gym serves, including the app views that live behind a single route."
      updated={LAST_UPDATED}
    >
      <LegalSection title="App views">
        <ul className="divide-y divide-card-border">
          {APP_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="flex items-center justify-between gap-3 py-2">
                <span className="text-sm font-semibold text-foreground">{link.label}</span>
                <span className="text-[11px] text-muted-2">{link.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Pages">
        <ul className="divide-y divide-card-border">
          {PAGES.map((page) => (
            <li key={page.href}>
              <Link href={page.href} className="flex items-center justify-between gap-3 py-2">
                <span className="text-sm font-semibold text-foreground">{page.label}</span>
                <span className="text-[11px] text-muted-2">{page.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Data sources">
        <ul className="divide-y divide-card-border">
          <li className="flex items-center justify-between gap-3 py-2">
            <a
              href="https://wger.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-foreground hover:text-accent-text"
            >
              wger.de
            </a>
            <span className="text-[11px] text-muted-2">Exercise database and images</span>
          </li>
          <li className="flex items-center justify-between gap-3 py-2">
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-foreground hover:text-accent-text"
            >
              Open-Meteo
            </a>
            <span className="text-[11px] text-muted-2">Weather and air quality</span>
          </li>
          <li className="flex items-center justify-between gap-3 py-2">
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-foreground hover:text-accent-text"
            >
              Unsplash
            </a>
            <span className="text-[11px] text-muted-2">Photography</span>
          </li>
        </ul>
      </LegalSection>
    </LegalShell>
  );
}
