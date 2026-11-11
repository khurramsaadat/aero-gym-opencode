"use client";

import Image from "next/image";

/** Daily rotating Unsplash fitness photos (desktop only, PRD §4.2). */
const IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=340&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&h=340&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1400&h=340&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1400&h=340&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&h=340&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&h=340&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1400&h=340&fit=crop&q=80",
];

/** Picks the photo for today (stable per weekday, rotates daily). */
export function getDailyPhoto(): string {
  const dayIndex = new Date().getDay();
  return IMAGES[dayIndex % IMAGES.length];
}

/**
 * Desktop-only motivational banner with a daily rotating fitness photo
 * (PRD §4.2) and the day's quote.
 */
export function MotivationalBanner({ quote }: { quote: string }) {
  return (
    <div className="hidden rounded-2xl lg:block">
      <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card">
        <Image
          src={getDailyPhoto()}
          alt="Fitness motivation"
          width={1400}
          height={340}
          className="h-[170px] w-full object-cover sm:h-[200px] lg:h-[170px]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-display text-sm italic text-muted-2 sm:text-base">&quot;{quote}&quot;</p>
        </div>
      </div>
    </div>
  );
}
