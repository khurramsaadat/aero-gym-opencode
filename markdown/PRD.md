# Product Requirements Document (PRD)
**Product Name:** Aero Gym
**Document Version:** 0.15
**Date:** 10 Nov 2026

## 1. Product Overview
Aero Gym is a responsive, mobile-first web application designed to help users log, track, and visualize their daily fitness routines. It features an exercise database of 200+ exercises (with wger.de API integration for 600+ more), templates, body measurements with reactive BMI/body composition, progress tracking, coaching profiles, and a desktop-friendly layout. All data persists in browser localStorage - no cloud accounts needed.

## 2. Goals & Objectives
- **Efficiency:** Log exercises quickly with exercise search, favorites bar, templates, and smart prefill
- **In-the-Moment Tracking:** Interactive set bubbles, rest timer (toggleable), workout duration timer, screen wake lock
- **Consistency:** Calendar heatmap, analytics, streaks, confetti celebrations
- **Simplicity:** localStorage persistence, no sign-up, offline-capable PWA
- **Desktop & Mobile:** Responsive layout with sidebar nav on desktop, bottom nav on mobile

## 3. Design & UX/UI Guidelines
- **Dark theme:** Gold's Gym style (black, gold #C9A227 as sole accent - no emerald, orange, or blue)
- **Light theme:** JEFIT-inspired clean teal (#00BFA5) accent on white (#ffffff) / light gray (#f7f8fa) background with dark readable text
- Dark/Light theme toggle with CSS custom properties on `[data-theme]` attribute
- Light mode text colors: neutral-400=#4a5568, neutral-500=#374151, neutral-600=#2d3748, neutral-700=#1a202c (all dark/black for readability)
- Light mode cards have subtle shadows, clean typography with navy text (#111827)
- Animated burger menu (3 lines to X) replacing settings cog
- 4px neutral scrollbar, transparent track
- Mobile-first (375px+) with desktop sidebar (1024px+)

## 4. Core Features

### 4.1. Navigation
- **Mobile:** Theme toggle (first), Workouts, Analytics, Progress, History (bottom tab bar)
- **Desktop:** Left sidebar with tab labels and icons (Workouts, Analytics, Progress, History, Coaches)
- **Typography:** Oswald font for headings (h1-h6) and nav labels; Geist Sans for body text
- **Weight Unit:** KG/LBS toggle inline next to weight input; auto-converts all existing data
- **Burger Menu:** Full-page animated menu with body weight, measurements, templates, coaches, settings (rest timer toggle, export, import, notifications)

### 4.2. Daily Log (Main View)
- **Compact Top Row:** Date header with app logo (mobile), centered date, burger menu
- **Motivational Banner:** Daily rotating Unsplash fitness photo (desktop only)
- **Streak Banner:** Consecutive day streak + weekly goal (4 days) with progress bar + share button + 50 daily quotes
- **Summary Cards:** Compact pills (Exercises, Sets Done, Weather) - each opens detail modal on tap
- **Quick-add Favorites Bar:** Pin up to 10 exercises for one-tap adding, pills wrap to multiple rows, gold "Added!" flash feedback, Edit/Done mode for mobile delete, no icons for compact layout, persisted to localStorage
- **Workout Cards:** 80x80 wger exercise images, PR/superset/drop/equipment badges, form guide tooltip, compact layout
- **Set Tracker:** Tappable bubbles with confetti on completion, haptic feedback, per-set reps labels (tap to edit individual set reps, gold highlight when different from default)
- **Cardio Completion:** "Mark Complete" button for cardio exercises (Walk, Run, etc.)
- **Edit Mode:** Inline editing, equipment selector (8 options), set type toggle, exercise swap, reorder, delete with undo, star icon to pin/unpin favorites directly from card
- **Session Notes:** Expandable 5-star rating + text notes
- **Copy Previous Workout:** One-tap copy yesterday's workout when empty
- **Add Exercise:** FAB opens 2-step modal with wger preview image, equipment selector

### 4.3. Superset Visual Grouping
- Paired exercises wrapped in gradient border container (gold/40 border, gradient from-gold/10)
- Superset icon badge + "SUPERSET" header with line divider in gold
- Clearly visible in both dark and light themes

### 4.4. Weather Page
- Full weather page (replaces modal) using Open-Meteo API (free, no API key)
- Current conditions: temperature, feels like, high/low, sunrise/sunset, weather description
- 8 detail cards: humidity, wind, visibility, UV index, dew point, pressure, cloud cover, rain
- Air quality: AQI badge, PM2.5, PM10, NO2, O3 with color-coded categories
- Hourly 48h horizontal scrolling forecast with weather icons
- 7-day forecast with gradient temperature range bars
- Sun and moon section

### 4.5. Burger Menu (Mobile) / Sidebar (Desktop)
- **Measurements:** Unit toggles (cm/in, kg/lb), tap-to-edit ScrollPicker for all values, 12 tape measurements, auto-saves on each field change
- **BMI & Body Composition:** Separate expandable card with color-coded BMI scale, body fat estimate (Navy method), 7-day trend weight. Reactively updates when Measurements change (weight, height, waist, neck) via custom events.
- **Templates:** Save/load/share/delete workout templates
- **Achievements:** 8 unlockable badges
- **Muscle Balance Donut:** Recharts PieChart with bold white labels inside slices
- **Settings:** Rest timer toggle, sound effects toggle, haptic feedback toggle, export/import with drag-and-drop, notifications, granular clear data (workouts, body weight, measurements, favorites, all)
- **Theme Toggle:** Bottom nav (mobile first item) / sidebar header icon (desktop)

### 4.6. Calendar / History View
- Tab renamed from "Calendar" to "History", positioned last in bottom nav
- **Weekly Strip:** Last 7 days quick access with completion % badges
- **Monthly Grid:** Completion % badges + muscle group dots
- **Muscle Distribution Donut:** PieChart with Week/Month/All toggle

### 4.7. Share Workout
- **Clean Share Card:** Emoji headers (no line dividers), completion %, exercises, sets, volume, muscles, per-exercise lines, app link
- **Web Share API** with clipboard fallback + textarea fallback

### 4.8. Analytics View
- **Range Toggle:** 7 / 14 / 30 days
- **Stat Cards:** Active days, total sets, avg/day
- **Volume Chart:** Recharts BarChart
- **Muscles Worked This Week:** Front/back split with progress bars per muscle group
- **Consistency Insight:** Smart text feedback
- **90-Day Frequency Heatmap**
- **Volume by Muscle Chart**
- **Muscle Balance Donut + Achievements**

### 4.9. Progress View
- **View Toggle:** Exercise Weight / Body Weight
- **Range Toggle:** 7 Days / 4 Weeks / 3 Months
- **Exercise Selector + Line Chart + Stat Cards**

### 4.10. wger.de API Integration
- **Exercise Images:** 80x80 thumbnails from wger.de on workout cards
- **Exercise Data:** Description, muscles (primary + secondary), equipment fetched per exercise
- **Form Guide:** Expandable tooltip with step-by-step instructions from wger
- **Exercise Search:** Dual search - local 200+ exercises + wger.de 600+ with deduplication
- **Equipment Badges:** User-saved equipment prioritized over wger data
- **Muscle Anatomy:** Front/back progress bars in Analytics
- **Caching:** 7-day localStorage cache, parallel fetch of 600 translations, scoring-based matching

### 4.11. Coaches Section
- 5 coach profiles with photos, ratings, experience, pricing, specialties
- Detail pages with hero photo, bio, focus tags, certifications, CTA

### 4.12. Splash Screen
- 2.5s B&W gym photo splash with Aero Gym logo, once per session (sessionStorage)

### 4.13. Branding
- **Name:** Aero Gym
- **Logo:** android-chrome-512x512.png, displayed as icon-only on mobile, icon + text on desktop sidebar
- **Favicons:** favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png
- **OG Image:** aero-og.jpg background with bold gold "AERO GYM" text overlay, feature pills, description text
- **Colors:** Dark theme gold (#C9A227), Light theme teal (#00BFA5)
- **Copyright:** "2026 Aero Gym by Khurram | All rights reserved."

## 5. Technical Stack
- **Framework:** Next.js 16.4.5 (App Router, Turbopack)
- **UI:** React 19.3.0, Tailwind CSS v4 (@theme inline)
- **Icons:** Lucide React
- **Charts:** Recharts (PieChart, BarChart, LineChart, RadarChart)
- **Fonts:** Geist Sans + Geist Mono
- **Images:** next/image with wger.de + Unsplash remote patterns
- **APIs:** wger.de REST API (exercise-translation, exerciseinfo, exerciseimage)
- **Storage:** localStorage (myWorkoutLogs, myBodyWeight, myMeasurements, myTemplates, myDayMeta, workout-theme, workout-height, workout-rest-timer, workout-favorites, workout-active-tab, wger-exercise-cache, workout-length-unit, workout-weight-unit)
- **PWA:** manifest.json
- **Hosting:** Netlify (https://aero-gym.netlify.app)

## 6. Data Architecture
- **WorkoutLog:** `{ [YYYY-MM-DD]: Workout[] }`
- **Workout:** id, name, category, weight, duration, reps, repsPerSet[], sets, completedSets[], setTypes[], supersetWith, prevWeight, prevReps, equipment
- **BodyWeightLog:** `{ [YYYY-MM-DD]: number }`
- **BodyMeasurement:** neck, shoulders, chest, waist, hips, leftArm, rightArm, forearm, wrist, leftThigh, rightThigh, calves
- **MeasurementLog:** `{ [YYYY-MM-DD]: BodyMeasurement }`
- **DayMetaLog:** `{ [YYYY-MM-DD]: { note?: string, rating?: number } }`
- **WorkoutTemplate:** id, name, exercises[]
- **FavoriteExercise:** name, category, weight/reps/duration, sets
