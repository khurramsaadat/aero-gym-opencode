# Plan - Aero Gym

**Workspace:** `D:\APPS\free-llms\aero-gym-test`
**Source:** PRD v0.15 (`markdown/PRD.md`)
**Stack:** Next.js 16 (App Router, Turbopack) - React 19 - Tailwind CSS v4 - TypeScript - Recharts - Lucide

## Ground Rules

- **100% fresh implementation** - every line of code is written new from the PRD. The existing `aero-gym-main` app is used **only as a behavioral reference** (storage key names, data shapes, interaction edge-cases). No file/code copying.
- **Scope: PRD-only.** Phase-12 "Advanced" features are out of scope (see [Out of Scope](#out-of-scope) and `Suggest.md`).
- **Verify at every milestone:** `npm run build` + `npm run lint` must pass; features checked in the dev server.
- **Milestone demos:** after each milestone the user can review at `http://localhost:3000`.
- **Testing protocol:** Playwright visual checks, numbered screenshots saved to `.playwright-mcp` (gitignored). Mobile 375px + cellular-data simulation, not just desktop/Wi-Fi.

## Architecture Notes

- Single-page app with client-side tab navigation (Workouts / Analytics / Progress / History / Coaches + Weather), matching the reference app's routing model - all PRD sections live under one route with view switching.
- `localStorage` persistence via a typed storage layer with exactly the PRD keys: `myWorkoutLogs`, `myBodyWeight`, `myMeasurements`, `myTemplates`, `myDayMeta`, `workout-theme`, `workout-height`, `workout-rest-timer`, `workout-favorites`, `workout-active-tab`, `wger-exercise-cache`, `workout-length-unit`, `workout-weight-unit`.
- Theming via CSS custom properties on `[data-theme]` (dark: gold `#C9A227`; light: teal `#00BFA5`), defined in `@theme inline` (Tailwind v4).
- Fonts: **Oswald** (h1-h6 + nav labels), **Geist Sans** (body), Geist Mono for accents.
- External APIs: `wger.de` REST (exercise info/images/translations), Open-Meteo (weather, no key), Unsplash **direct** `images.unsplash.com` URLs for daily photos/splash/coaches (the old `source.unsplash.com` service is dead - verified).
- Protocol extras (from AGENTS.md): legal pages (Careers, Privacy Policy, Terms of Service, HTML sitemap) with real content + wired footer links; 5-column footer with socials; back-to-top button; WhatsApp floating button; Google Maps location discovery. No em-dashes anywhere; no placeholders; dynamic copyright year.

## Milestones

### M1 - Foundation & Theming
- [x] Tailwind v4 `@theme inline`: dark (black + gold `#C9A227` sole accent) / light (white `#fff` / `#f7f8fa` + teal `#00BFA5`) token sets; PRD light-mode text neutrals (400-700), navy card text `#111827`
- [x] `[data-theme]` toggle, persisted to `workout-theme`; ThemeProvider
- [x] Fonts wired (Oswald headings/nav, Geist Sans body)
- [x] 4px transparent-track scrollbar, neutral thumb
- [x] `types.ts` (Workout, WorkoutLog, BodyWeightLog, BodyMeasurement, MeasurementLog, DayMetaLog, WorkoutTemplate, FavoriteExercise per PRD §6)
- [x] Typed `storage.ts` layer (get/set/subscribe, PRD keys)
- [x] Responsive shell: mobile-first 375px+, desktop sidebar 1024px+, bottom nav (mobile), animated burger menu container (middle line disappears first, then top/bottom rotate to cross, no position shift)
- [x] Mobile menu: center-aligned links, staggered fade-in-up; copyright at bottom under thin line
- [x] View shell: tab switching between Workouts / Analytics / Progress / History / Coaches / Weather with tab persistence

### M2 - Daily Log (Workouts tab)
- [x] Date header: app logo (mobile), centered date, burger menu; date navigation; progress ring
- [x] Motivational banner (daily rotating Unsplash photo, desktop only)
- [x] Streak banner: consecutive-day streak + weekly goal (4 days) progress bar + share button; 50 rotating daily quotes
- [x] Summary pills: Exercises / Sets Done / Weather - each opens detail modal (Weather pill goes to the Weather page, PRD §4.4)
- [x] Quick-add Favorites Bar: pin <=10 exercises, wrapping pill rows, gold "Added!" flash, Edit/Done delete mode, icon-less compact layout, persisted
- [x] Workout cards: PR / superset / drop / equipment badges, compact layout (wger 80x80 images + form-guide tooltip land with M3)
- [x] Set tracker: tappable bubbles, confetti on completion, haptic feedback, per-set reps labels (tap to edit, gold highlight when different from default)
- [x] Cardio "Mark Complete" button
- [x] Edit mode: inline edit, equipment selector (8 options), set-type toggle, exercise swap, reorder, delete + undo toast, star pin/unpin to favorites from card
- [x] Session notes: expandable 5-star rating + text notes
- [x] "Copy previous workout" one-tap when day empty
- [x] Add Exercise FAB - 2-step modal with equipment selector (wger preview image lands with M3)
- [x] KG/LBS toggle inline at weight input; auto-converts all existing data (stored in KG, display-only conversion)
- [x] Workout duration timer + screen wake lock; rest timer (toggleable, persisted to `workout-rest-timer`)

### M3 - wger.de Integration & Exercise DB
- [ ] Local exercise database (200+ exercises, categories/muscles/equipment) as a data module
- [ ] wger client: `exerciseinfo`, `exerciseimage`, translations; 7-day `wger-exercise-cache`
- [ ] Dual search: local 200+ + wger 600+, scoring-based matching + deduplication; brand-colored focus ring on the search bar
- [ ] Equipment badges: user-saved priority over wger
- [ ] Form guide: expandable tooltip with step-by-step wger instructions
- [ ] Exercise ID overrides for correct images (e.g., Dumbbell Curl - 1192)

### M4 - Burger Menu / Sidebar Widgets
- [ ] Measurements: unit toggles (cm/in, kg/lb), tap-to-edit fields, 12 tape measurements, autosave per field
- [ ] BMI & Body Composition: color-coded BMI scale, Navy-method body-fat estimate, 7-day trend; reacts to measurement changes via custom events
- [ ] Templates: save / load / share / delete workout templates
- [ ] Achievements: 8 unlockable badges
- [ ] Muscle Balance Donut (Recharts PieChart, bold white in-slice labels)
- [ ] Settings: rest timer toggle, sound effects toggle, haptic toggle, export/import with drag-and-drop, notifications, granular clear-data (workouts / body weight / measurements / favorites / all) with double-tap confirmation
- [ ] About section

### M5 - Analytics View
- [ ] Range toggle 7 / 14 / 30 days; stat cards (active days, total sets, avg/day)
- [ ] Volume chart (Recharts BarChart)
- [ ] Muscles Worked This Week: front/back split with per-muscle progress bars
- [ ] Consistency insight (smart text feedback)
- [ ] 90-day frequency heatmap
- [ ] Volume by Muscle chart
- [ ] Muscle Balance Donut + Achievements

### M6 - Progress & History Views
- [ ] Progress: Exercise Weight / Body Weight toggle; 7 Days / 4 Weeks / 3 Months; exercise selector + line chart + stat cards
- [ ] History (renamed from Calendar, last tab): weekly strip with completion-% badges; monthly grid with completion % + muscle-group dots; Muscle Distribution Donut with Week/Month/All toggle

### M7 - Weather Page
- [ ] Open-Meteo (free, no key), geolocation with fallback; replaces modal
- [ ] Current conditions: temp, feels-like, high/low, sunrise/sunset, description
- [ ] 8 detail cards: humidity, wind, visibility, UV, dew point, pressure, cloud cover, rain
- [ ] Air quality: AQI badge, PM2.5, PM10, NO2, O3 with color-coded categories
- [ ] 48h hourly horizontal scroll with weather icons
- [ ] 7-day forecast with gradient temperature-range bars
- [ ] Sun & moon section

### M8 - Coaches & Sharing
- [ ] Coaches section: 5 profiles (photos, ratings, experience, pricing, specialties)
- [ ] Coach detail pages: hero photo, bio, focus tags, certifications, CTA (one primary CTA per page)
- [ ] Share Workout: clean emoji-header card (no dividers) - completion %, exercises, sets, volume, muscles, per-exercise lines, app link; Web Share API + clipboard fallback + textarea fallback

### M9 - PWA, Splash, Branding, Footer & SEO
- [ ] Splash screen: 2.5s B&W gym photo + Aero Gym logo, once per session (`sessionStorage`)
- [ ] PWA: `manifest.json`, service worker, installable (cache-busted versioning)
- [ ] Branding assets: favicon.ico, 16/32 png, apple-touch-icon, android-chrome 192/512, OG image (bold gold "AERO GYM" on aero-og background, feature pills, description)
- [ ] Logo behavior: icon-only mobile / icon+text desktop sidebar; clicking logo = Home
- [ ] SEO: metadata, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, direct Google Search URLs
- [ ] Legal pages with real content: Careers, Privacy Policy, Terms of Service, HTML sitemap; footer links wired to them
- [ ] Footer: 5-column layout + logo + description; socials (X, IG, FB, TikTok, LinkedIn) in theme colors; dynamic copyright year
- [ ] Back-to-top button: appears after 600px scroll, smooth scroll
- [ ] WhatsApp floating button: official SVG icon on `#25D366`, tooltip above the button (blocked: needs phone number from user)
- [ ] All images via `next/image` with proper `sizes`, `priority`, `loading`
- [ ] Responsive hardening pass (375px+ mobile, 1024px+ desktop sidebar)

### M10 - PRD Compliance Audit & Polish
- [ ] Embedded Google Maps with functional location discovery in-page (blocked: needs API-key decision from user)
- [ ] Line-by-line PRD §3-§6 checklist against the running app; fix gaps
- [ ] localStorage key audit; export/import round-trip test
- [ ] Offline/PWA behavior check
- [ ] Playwright visual pass: 375px mobile + desktop screenshots to `.playwright-mcp`; mobile cellular-data simulation
- [ ] `npm run build` + `npm run lint` clean; final demo to user

## Out of Scope (Future)

Auto-progression suggestions - 1RM calculator - warmup-set calculator - RPE/RIR logging - plate calculator - keyboard shortcuts - gesture controls - CSV export - dark AMOLED variant - data-privacy dashboard. Tracked in `Suggest.md`.

## Verification Commands

```bash
npm run dev     # http://localhost:3000
npm run build   # production build + typecheck
npm run lint    # ESLint
```
