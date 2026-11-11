"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Award, CalendarDays, Check, Clock, Star, Users } from "lucide-react";
import { COACHES, getShortlist, toggleShortlist, type Coach } from "@/lib/coaches";

/**
 * Coaches section (PRD §4.11): five profiles with photos, ratings,
 * experience, pricing and specialties, plus a detail view with the bio,
 * focus tags and certifications. The single CTA shortlists the coach on
 * this device, so nothing pretends to book a session that does not exist.
 */
export function CoachesView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShortlist(getShortlist());
  }, []);

  const selected = selectedId ? COACHES.find((coach) => coach.id === selectedId) ?? null : null;

  const handleShortlist = (coach: Coach) => {
    const next = toggleShortlist(coach.id);
    setShortlist(next);
    if (next.includes(coach.id)) {
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2200);
    }
  };

  if (selected) {
    const shortlisted = shortlist.includes(selected.id);
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:bg-card-border hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All coaches
        </button>

        <section className="overflow-hidden rounded-2xl border border-card-border bg-card">
          <div className="relative h-64 w-full sm:h-80">
            <Image
              src={selected.image}
              alt={selected.name}
              fill
              priority
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h1 className="font-display text-2xl font-bold text-foreground">{selected.name}</h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-2">
                {selected.role}
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-2">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                {selected.rating.toFixed(1)}
                <span className="font-normal text-muted-2">({selected.reviews} reviews)</span>
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {selected.years} years coaching
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {selected.availability}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted">{selected.bio}</p>

            <div className="mt-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-2">Focus</h2>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selected.focus.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-accent-soft bg-accent-soft/60 px-2.5 py-1 text-[11px] font-semibold text-accent-text"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h2 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-2">
                <Award className="h-3.5 w-3.5" aria-hidden />
                Certifications
              </h2>
              <ul className="mt-1.5 space-y-1">
                {selected.certifications.map((cert) => (
                  <li key={cert} className="flex items-center gap-1.5 text-xs text-muted">
                    <Check className="h-3.5 w-3.5 text-accent" aria-hidden />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-card-border bg-background px-3 py-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
                  Sessions from
                </p>
                <p className="font-display text-xl font-bold text-foreground">
                  ${selected.price}
                  <span className="ml-1 text-[11px] font-medium text-muted-2">/ session</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleShortlist(selected)}
                aria-pressed={shortlisted}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  shortlisted
                    ? "border border-accent-soft bg-accent-soft text-accent-text"
                    : "bg-accent text-accent-contrast hover:opacity-90"
                }`}
              >
                {shortlisted ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Shortlisted
                  </span>
                ) : (
                  "Add to shortlist"
                )}
              </button>
            </div>
            {savedNotice && (
              <p className="mt-2 text-right text-[11px] text-accent-text" role="status">
                Saved on this device
              </p>
            )}
            <p className="mt-2 text-[10px] text-muted-2">
              Shortlisted coaches are stored locally, alongside your training data.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <Users className="h-4 w-4 text-accent" aria-hidden />
              Coaches
            </h1>
            <p className="mt-0.5 text-xs text-muted-2">
              Five coaches across strength, hypertrophy, mobility, Olympic lifting and endurance.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] font-bold text-muted-2">
            {shortlist.length} shortlisted
          </span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {COACHES.map((coach, index) => {
          const shortlisted = shortlist.includes(coach.id);
          return (
            <article
              key={coach.id}
              className="overflow-hidden rounded-2xl border border-card-border bg-card"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={coach.image}
                  alt={coach.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                {shortlisted && (
                  <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-contrast">
                    Shortlisted
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-bold text-foreground">
                      {coach.name}
                    </h2>
                    <p className="truncate text-[11px] uppercase tracking-widest text-muted-2">
                      {coach.role}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                    {coach.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {coach.specialties.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-card-border bg-background px-2 py-0.5 text-[10px] text-muted-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-2">
                    <span className="font-display text-base font-bold text-foreground">
                      ${coach.price}
                    </span>{" "}
                    / session
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedId(coach.id)}
                    aria-label={`View ${coach.name}'s profile`}
                    className="rounded-full border border-card-border bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:border-accent hover:text-accent-text"
                  >
                    View profile
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="px-1 text-[10px] text-muted-2">
        Coach profiles are bundled with the app. Session pricing is set by each coach.
      </p>
    </div>
  );
}
