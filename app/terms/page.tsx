import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { LAST_UPDATED, REPO_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you use Aero Gym: local data ownership, health disclaimer, acceptable use and third-party services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      intro="These terms cover your use of Aero Gym, a free training log that runs entirely in your browser. By using the app you agree to them."
      updated={LAST_UPDATED}
    >
      <LegalSection title="The service">
        <p>
          Aero Gym lets you log workouts, body measurements and body weight, and shows related
          statistics. It is provided free of charge, with no account and no hosted storage. Features
          and availability may change as the app develops.
        </p>
      </LegalSection>

      <LegalSection title="Your data is yours">
        <p>
          Training data lives in your browser&apos;s local storage. You are responsible for it: export
          backups regularly if the records matter to you, because clearing browser storage, using
          private browsing or switching devices will not carry the data over.
        </p>
        <p>
          Aero Gym cannot recover data that a browser or device has removed, and does not hold a copy.
        </p>
      </LegalSection>

      <LegalSection title="Not medical advice">
        <p>
          The exercise database, form guides, progress charts, BMI and body-fat estimates are
          general information, not medical or professional advice. Body-fat estimates use the US
          Navy circumference formula and are approximate.
        </p>
        <p>
          Train within your limits, consult a qualified professional before starting a new program,
          and stop if something hurts. You accept the risks of the training you choose to do.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <ul className="list-disc space-y-1 pl-5">
          <li>Do not use the app to break the law or to harm other people.</li>
          <li>Do not attempt to disrupt the hosted site or the public APIs it depends on.</li>
          <li>Do not misrepresent the app as a medically supervised service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Third-party services">
        <p>
          Exercise data and images come from wger.de, weather and air quality from Open-Meteo, and
          photography from Unsplash. Each service has its own terms and privacy practices. Coach
          profiles bundled with the app are illustrative directory entries, and any arrangement you
          make with a coach is between the two of you.
        </p>
      </LegalSection>

      <LegalSection title="Availability and warranty">
        <p>
          The app is provided &quot;as is&quot;, without warranties of any kind. Forecasts, exercise metadata
          and third-party availability can be wrong or temporarily unavailable, and the service may
          be interrupted for maintenance or hosting reasons.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, Aero Gym and its maintainer are not liable for
          indirect or consequential loss, including lost training data, arising from use of the app.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          These terms may be updated as the app changes; the date above shows the current version.
          Continued use after an update means you accept the revised terms.
        </p>
        <p>
          Reach the maintainer through{" "}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-accent/40 underline-offset-2">
            the project issue tracker
          </a>
          . Our <Link href="/privacy" className="underline decoration-accent/40 underline-offset-2">Privacy Policy</Link>{" "}
          explains what is stored locally.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
