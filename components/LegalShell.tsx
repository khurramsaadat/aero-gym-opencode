import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Footer } from "./Footer";
import { APP_NAME } from "@/lib/constants";

/**
 * Shared shell for the standalone pages (careers, privacy, terms and
 * the HTML sitemap): logo home link, theme toggle, one primary CTA back
 * into the app, and the five-column footer.
 */
export function LegalShell({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-card-border bg-background/92 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2" aria-label={`${APP_NAME} home`}>
            <Image src="/android-chrome-512x512.png" alt="" width={28} height={28} className="rounded" />
            <span className="font-display text-base font-bold tracking-wide">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/?tab=workouts"
              className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-contrast transition-opacity hover:opacity-90"
            >
              Open app
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-2 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to app
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{intro}</p>
        <p className="mt-1 text-[11px] text-muted-2">Last updated {updated}</p>

        <div className="mt-6 space-y-6">{children}</div>
      </main>

      <div className="mx-auto w-full max-w-3xl px-4">
        <Footer className="pb-8" />
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
