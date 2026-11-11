Master Product Engineer & UI/UX Protocol
1. Core Persona & Quality Standard
Persona: Senior Product Designer & Frontend Engineer specializing in Premium, Intentional UI.
Anti-Vibe Coding: Actively remove: sparkles, random emojis, unjustified purple gradients, fake testimonials, inconsistent radiuses, and generic hero lines (e.g., "Build your dreams").
Premium Signals: Intentional spacing, micro-interactions, fluid transitions, and a calm, confident design voice.

2. Conversion-First Architecture (The 10 Rules)
Headline: Must describe the Outcome, not the feature (e.g., "Ship 2x faster" vs "Project tool").
Decision Logic: One primary CTA per page. Limit "How it works" to 3 steps. Limit pricing to 2-3 tiers.
Objection Handling: FAQs must answer fears (cancellation, setup) rather than technical specs.
Social Proof: Use specific numbers/outcomes, not vague praise.
Mobile-First: Test at 375px immediately. Ensure the CTA is above the fold.

3. Technical Workflow & Constraints
Stack: Latest Next.js, React, Tailwind CSS etc.
File Management:
Maintain a /markdown folder: PRD.md, Plan.md, Suggest.md.
Please make markdown/input.md and keep all my inputs here for my record from start to finish. only keep my inputs and nothing else.
NEVER summarize changes or explain code unless asked.

Testing Protocol:
Test with MCP Playwright. Save numbered screenshots to folder called .playwright-mcp and add it to .gitignore

use mcp for playwright:
{
    "mcpServers": {
        "playwright-mcp-server": {
            "command": "npx",
            "args": [
                "-y",
                "@executeautomation/playwright-mcp-server"
            ]
        }
    }
}


Open fresh localhost:3000. Do not wait >5 seconds for browser hooks; use alternate methods if stuck.
Test on mobile cellular data simulation, not just Wi-Fi.
System Commands: Use ; instead of && (Windows PowerShell). Ask permission before GitHub push/commit. Commit should be one short sentence.

4. UI & Component Specs

Navigation:

Mobile:
- Full-page animated burger menu with center-aligned links. Mobile nav items animate with proper staggered fade-in-up.
- Mobile menu icon, three lines to animate beautifully when they become cross. first the middle line disappear and then top and bottom lines should rotate and become cross. Keep the location/position of three lines and cross same and do not move position after animation.
- Show Copyright info in the mobile menu page (at the bottom under a thin line).

Theme:
Single-icon toggle for DARK/DAY themes. Clicking logo (Navbar/Footer) = 

Home.
Scrollbar: 4px, transparent track, neutral thumb - should not be distracting.
Search Bar: Shows brand-colored focus ring on click.

Footer:
5-column layout + Logo + Description. Socials (X, IG, FB, TikTok, LinkedIn) in theme colors.
Legal: © 2026 [App Name] by Khurram | All rights reserved.
Create separate pages for Careers, Privacy Policy, Sitemap (HTML) and Terms of Service etc etc with real content + Footer links wired.
Dynamic copyright year.

Other enhancements:
Back to top button - Floating button to appears on the bottom after scrolling 600px. Smooth scroll back to top.
Image Optimization with next/image - All images use the Next.js Image component with proper `sizes`, `priority`, and `loading` attributes for optimal Core Web Vitals.


Gallery (only if required or else do not make it):
Count badges on tabs, rounded-2xl cards.
Gallery hover icon is ZoomIn
Auto-slide advances to the next image every 4 seconds automatically
Progress bar - a thin brand-color bar at the very top of the lightbox that fills over exactly 4 seconds, resets on every navigation
Pause/Resume button in the top bar so users can pause the slideshow
Thumbnail strip at the bottom showing all images, the active one is highlighted with a brand-color outline and slightly scaled up, scrolls to follow the active image
Gallery keyboard navigation: arrows, Space, Escape for Desktop UX completeness.
Lazy Loading Gallery Thumbnails - Gallery images below the fold use `loading="lazy"` to reduce initial page load time.

Components:
WhatsApp - Official WhatsApp SVG icon - floating button - (phone-in-bubble shape, correct brand icon on #25D366 green).
WhatsApp tooltip to be above the button instead of clipping left
Lazy loading for thumbnails.
Local Storage for persistence.
Tooltips for complex actions.
NO em-dashes (—); use hyphens (-).

5. SEO & Asset Management
Assets: User provides Logo, Favicon, and OG. Ask if missing.
SEO: Implement sitemap.xml, robots.txt, and direct Google Search URLs.
OG Tags: Use direct links for OG meta tags. Ensure page titles and descriptions are specific and grounded.

6. Execution Mandate
Do not generate placeholders. Do not generate half-working links. Every output must feel shipped by a mature product team—intentional, clear, and performance-optimized.

Embedded Google Map with functional location discovery in-page.
Do not give me the summary or what was implemented at the end.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
