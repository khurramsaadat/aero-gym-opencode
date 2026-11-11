import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { LAST_UPDATED, REPO_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "How Aero Gym is built and what hiring looks like: small scope, honest product work, and no open roles at the moment.",
  alternates: { canonical: "/careers" },
};

export default function CareersPage() {
  return (
    <LegalShell
      title="Careers"
      intro="Aero Gym is a small, local-first product. There are no open roles today, but this page explains the work and how hiring happens, so you know where to look when that changes."
      updated={LAST_UPDATED}
    >
      <LegalSection title="Current openings">
        <p>
          None. Every feature in the app is built and maintained by a single product engineer, and
          there is no plan to add headcount in the current cycle.
        </p>
        <p>
          When a role opens it will be posted on this page with a scope, a salary band and a short
          description of the first project. It will not appear only on a job board.
        </p>
      </LegalSection>

      <LegalSection title="What the work looks like">
        <ul className="list-disc space-y-1 pl-5">
          <li>Next.js and React front ends with careful state and storage handling.</li>
          <li>Data visualisation that stays readable on a phone at 375px.</li>
          <li>Local-first architecture: no account walls, no server database.</li>
          <li>Performance and accessibility work measured on real devices and slow networks.</li>
        </ul>
      </LegalSection>

      <LegalSection title="What we look for">
        <p>
          People who finish things, who can explain a decision in two sentences, and who care about
          how an interface feels under a thumb. Product judgement matters more than a long list of
          frameworks.
        </p>
        <p>
          A useful application would be a small working feature in this codebase, not a portfolio
          deck. The repository is public:
          public code, public issues, no whiteboard puzzles.
        </p>
      </LegalSection>

      <LegalSection title="How hiring works">
        <p>
          A short conversation about work you have shipped, a paid small project scoped to one or
          two days, and a decision within a week of that project closing. No take-home marathons and
          no unpaid production work.
        </p>
      </LegalSection>

      <LegalSection title="Speculative applications">
        <p>
          If you want to be considered when a role opens, open a discussion in the{" "}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-accent/40 underline-offset-2">
            project repository
          </a>{" "}
          with a link to something you built and a note about what you would improve in Aero Gym.
          Applications sent that way are read, even when there is no role open.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
