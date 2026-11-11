"use client";

import Image from "next/image";
import Link from "next/link";
import { useYear } from "./YearProvider";
import { APP_NAME, APP_URL, REPO_URL } from "@/lib/constants";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    title: "Train",
    links: [
      { label: "Workouts", href: "/?tab=workouts" },
      { label: "Analytics", href: "/?tab=analytics" },
      { label: "Progress", href: "/?tab=progress" },
      { label: "History", href: "/?tab=history" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Weather", href: "/?tab=weather" },
      { label: "Coaches", href: "/?tab=coaches" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Sitemap", href: "/sitemap" },
      { label: "Source", href: REPO_URL, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "wger exercise data", href: "https://wger.de", external: true },
      { label: "Open-Meteo weather", href: "https://open-meteo.com", external: true },
      { label: "Unsplash photos", href: "https://unsplash.com", external: true },
    ],
  },
];

const SOCIALS = [
  { label: "X", href: "https://x.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

/**
 * Five-column footer plus brand block, social links and the dynamic
 * copyright year. Used at the bottom of the app shell and on every
 * standalone page.
 */
export function Footer({ className = "" }: { className?: string }) {
  const year = useYear();

  return (
    <footer className={`w-full border-t border-card-border pt-5 ${className}`}>
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2" aria-label={`${APP_NAME} home`}>
            <Image
              src="/android-chrome-512x512.png"
              alt=""
              width={30}
              height={30}
              className="rounded-md"
            />
            <span className="font-display text-base font-bold tracking-wide text-foreground">
              {APP_NAME}
            </span>
          </Link>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-2">
            Log workouts, track measurements and see progress over time. Everything you enter stays
            in this browser.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-card-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-accent hover:text-accent-text"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer" className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
                {column.title}
              </h2>
              <ul className="mt-2 space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted transition-colors hover:text-accent-text"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs text-muted transition-colors hover:text-accent-text"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-card-border pt-3 text-[11px] text-muted-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} {APP_NAME} by Khurram | All rights reserved.</p>
        <p>
          <a
            href="https://www.google.com/search?q=Aero+Gym+fitness+tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-accent/40 underline-offset-2 hover:text-accent-text"
          >
            Find Aero Gym on Google
          </a>
          <span className="mx-2 text-muted-3">|</span>
          <a
            href={APP_URL}
            className="underline decoration-accent/40 underline-offset-2 hover:text-accent-text"
          >
            {APP_URL.replace("https://", "")}
          </a>
        </p>
      </div>
    </footer>
  );
}
