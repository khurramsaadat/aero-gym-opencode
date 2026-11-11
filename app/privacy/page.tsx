import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { LAST_UPDATED, REPO_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Aero Gym stores training data in your browser, which third-party services it contacts, and how to export or delete everything.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro="Aero Gym is a local-first training log. There is no account, no server database and no advertising. This page explains exactly what stays on your device and which outside services the app contacts."
      updated={LAST_UPDATED}
    >
      <LegalSection title="What the app stores">
        <p>
          Everything you enter is saved in your browser&apos;s local storage under a fixed set of keys.
          Nothing is uploaded to Aero Gym.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Workout logs, including exercise names, sets, reps, weights, durations and timestamps.</li>
          <li>Body weight entries and the twelve body measurement fields.</li>
          <li>Session notes and day ratings.</li>
          <li>Workout templates and pinned quick-add exercises.</li>
          <li>Settings: theme, height, weight and length units, rest timer preference, active tab.</li>
          <li>Cached exercise metadata from wger.de and the optional weather location and coach shortlist.</li>
        </ul>
        <p>
          Browser local storage for this site can be inspected and cleared at any time from your
          browser&apos;s developer tools or site settings.
        </p>
      </LegalSection>

      <LegalSection title="What leaves your device">
        <p>
          The app is served as static files and makes no calls to an Aero Gym backend. A few
          features fetch public data directly from third parties, which means those services see
          your IP address and the request parameters:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <a href="https://wger.de" target="_blank" rel="noopener noreferrer" className="underline decoration-accent/40 underline-offset-2">
              wger.de
            </a>{" "}
            for exercise names, descriptions, muscles and images when you search or open a form guide.
          </li>
          <li>
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline decoration-accent/40 underline-offset-2">
              Open-Meteo
            </a>{" "}
            for the weather page. Coordinates are sent only when you open Weather and are stored
            locally so the page can reload quickly.
          </li>
          <li>
            <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline decoration-accent/40 underline-offset-2">
              Unsplash
            </a>{" "}
            for motivational photos, the splash screen and coach portraits.
          </li>
        </ul>
        <p>
          There are no analytics scripts, advertising pixels, session recordings or tracking
          cookies. The only cookies are those your browser or hosting provider may set for its own
          operation, none of which Aero Gym reads.
        </p>
      </LegalSection>

      <LegalSection title="Backups and deletion">
        <p>
          Settings contains an Export backup action that downloads every stored key as a JSON file,
          and an Import action that restores one. Because backups are plain files, treat them like
          any other personal record.
        </p>
        <p>
          Settings also clears data in granules: workout logs, body weight, measurements, favorites
          or everything. Clearing browser storage for the site has the same effect and cannot be
          undone.
        </p>
      </LegalSection>

      <LegalSection title="Children and health data">
        <p>
          Aero Gym is not directed at children under 13 and does not knowingly collect information
          from them. Body measurements are stored only on your device and are never transmitted to
          Aero Gym.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If a future version adds an account or a hosted sync feature, this page will be updated
          before that feature ships and the date above will change.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy can be raised in the public issue tracker at{" "}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-accent/40 underline-offset-2">
            github.com/khurramsaadat/aero-gym-opencode
          </a>
          . See also our <Link href="/terms" className="underline decoration-accent/40 underline-offset-2">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
