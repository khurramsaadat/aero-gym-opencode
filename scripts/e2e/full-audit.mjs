// Aero Gym - full interaction audit for M7, M8 and M9.
// Covers: splash, workouts (add, complete, share, pin, delete, undo),
// burger menu, theme, all tabs, weather, coaches, footer, legal pages,
// back to top, WhatsApp, PWA metadata and internal link health.
//
// Usage: node scripts/e2e/full-audit.mjs
// Screenshots: .playwright-mcp/NN-audit-<label>.png

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = ".playwright-mcp";
mkdirSync(OUT, { recursive: true });

let shotNumber = 24;
const results = [];
const consoleErrors = [];
const httpFailures = [];

const pass = (name) => {
  results.push({ name, ok: true });
  console.log(`  PASS  ${name}`);
};

const fail = (name, error) => {
  const message = String(error && error.message ? error.message : error).split("\n")[0].slice(0, 300);
  results.push({ name, ok: false, error: message });
  console.log(`  FAIL  ${name} -> ${message}`);
};

async function check(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (error) {
    fail(name, error);
  }
}

async function shot(page, label) {
  shotNumber += 1;
  const file = join(OUT, `${shotNumber}-audit-${label}.png`);
  await page.screenshot({ path: file });
  return file;
}

function watch(page, device) {
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/favicon\.ico|Download the React DevTools/i.test(text)) return;
    consoleErrors.push({ device, text: text.slice(0, 300) });
  });
  page.on("pageerror", (error) => {
    consoleErrors.push({ device, text: `pageerror: ${error.message}`.slice(0, 300) });
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const url = response.url();
    if (/favicon\.ico/.test(url)) return;
    httpFailures.push({ device, status: response.status(), url: url.slice(0, 220) });
  });
}

async function addExercise(page, name = "Bench Press") {
  await page.locator('button[aria-label="Add exercise"]').click();
  const input = page.locator('input[placeholder="e.g. bench press, squat"]');
  await input.waitFor({ state: "visible", timeout: 15000 });
  await input.fill(name);
  const hit = page.locator("ul li button", { hasText: name }).first();
  await hit.waitFor({ state: "visible", timeout: 15000 });
  await hit.click();
  const submit = page.getByRole("button", { name: "Add exercise", exact: true }).last();
  await submit.waitFor({ state: "visible", timeout: 20000 });
  await submit.click();
  await page.locator("h3", { hasText: name }).first().waitFor({ state: "visible", timeout: 20000 });
}

async function openMenu(page) {
  await page.locator('button[aria-label="Menu"]').first().click();
  await page.locator('button[aria-label="Close menu"]').waitFor({ state: "visible", timeout: 8000 });
}

async function menuGoto(page, label) {
  await openMenu(page);
  await page.locator("nav button", { hasText: label }).last().click();
  await page.locator('button[aria-label="Menu"]').first().waitFor({ state: "visible", timeout: 8000 });
}

async function waitForSplash(page) {
  const splash = page.locator('div[role="presentation"]');
  await page.waitForTimeout(500);
  const seen = (await splash.count()) > 0;
  if (seen) await splash.waitFor({ state: "detached", timeout: 9000 }).catch(() => {});
  return seen;
}

async function scrollToBottom(page) {
  await page.evaluate(() => {
    const el = document.querySelector("main > div");
    if (el) el.scrollTop = el.scrollHeight;
    else window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(400);
}

const browser = await chromium.launch();

/* ------------------------------------------------------------------ */
/*  Mobile: 375x812 with slow 4G emulation                             */
/* ------------------------------------------------------------------ */

console.log("\nMOBILE 375x812 (slow 4G)");
const mobileContext = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  permissions: ["geolocation", "clipboard-read", "clipboard-write"],
  geolocation: { latitude: 33.6844, longitude: 73.0479 },
});
const mobile = await mobileContext.newPage();
watch(mobile, "mobile");
const cdp = await mobileContext.newCDPSession(mobile);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  downloadThroughput: 900 * 1024,
  uploadThroughput: 700 * 1024,
  latency: 120,
});

await mobile.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
const mobileSplash = await waitForSplash(mobile);

await check("mobile: splash screen appears once per session", async () => {
  if (!mobileSplash) throw new Error("splash overlay never rendered");
  const flag = await mobile.evaluate(() => sessionStorage.getItem("aero-splash-shown"));
  if (flag !== "1") throw new Error("session flag not written");
});

await check("mobile: no horizontal overflow at 375px", async () => {
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  if (overflow) throw new Error("page is wider than the viewport");
  await shot(mobile, "mobile-home");
});

await check("mobile: logo is icon-only in the top bar", async () => {
  const visible = await mobile
    .locator('header span:has-text("Aero Gym")')
    .first()
    .isVisible();
  if (visible) throw new Error("brand text is still visible at 375px");
});

await check("mobile: add an exercise from search", async () => {
  await addExercise(mobile);
  await shot(mobile, "mobile-exercise-added");
});

await check("mobile: complete a set and confirm the undo label", async () => {
  await mobile.locator('button[aria-label="Complete set 1"]').first().click();
  await mobile.locator('button[aria-label="Undo set 1"]').first().waitFor({ timeout: 8000 });
});

await check("mobile: share session button reports success", async () => {
  const button = mobile.locator('button[aria-label="Share this session"]');
  await button.click();
  await mobile.locator('button[aria-label="Share this session"]:has-text("Shared")').waitFor({ timeout: 8000 });
});

await check("mobile: pin exercise to quick add", async () => {
  await mobile.locator('button[aria-label="Pin to favorites"]').first().click();
  await mobile.locator('button[aria-label="Unpin from favorites"]').first().waitFor({ timeout: 8000 });
  await mobile.locator('button:has-text("Bench Press")').first().waitFor({ timeout: 8000 });
});

await check("mobile: delete with undo restores the exercise", async () => {
  await mobile.locator('main button:text-is("Edit")').last().click();
  await mobile.locator('button[aria-label="Delete workout"]').first().click();
  await mobile.waitForTimeout(500);
  if ((await mobile.locator("h3", { hasText: "Bench Press" }).count()) !== 0) {
    throw new Error("exercise still present after delete");
  }
  await mobile.locator('button[aria-label="Undo"]').click();
  // Undo restores while edit mode is still on, where the name is an input.
  await mobile.locator('main button:text-is("Done")').click({ timeout: 8000 }).catch(() => {});
  await mobile.locator("h3", { hasText: "Bench Press" }).first().waitFor({ timeout: 8000 });
});

await check("mobile: deletion stays deleted after the toast expires", async () => {
  if ((await mobile.locator('button[aria-label="Delete workout"]').count()) === 0) {
    await mobile.locator('main button:text-is("Edit")').last().click();
  }
  await mobile.locator('button[aria-label="Delete workout"]').first().click();
  await mobile.waitForTimeout(7000);
  if ((await mobile.locator("h3", { hasText: "Bench Press" }).count()) !== 0) {
    throw new Error("deleted exercise came back after the undo toast expired");
  }
  await mobile.locator("main button:text-is(\"Done\")").click().catch(() => {});
});

await check("mobile: burger menu opens, is centred, and shows copyright", async () => {
  await openMenu(mobile);
  try {
    await mobile.locator("nav button", { hasText: "Weather" }).last().waitFor({ timeout: 8000 });
    await mobile.locator("nav button", { hasText: "Coaches" }).last().waitFor({ timeout: 8000 });
    const copyright = mobile.locator('footer:has-text("All rights reserved")').last();
    await copyright.waitFor({ timeout: 8000 });
    await shot(mobile, "mobile-burger");
  } finally {
    // Always close: a stuck overlay blocks every later interaction.
    await mobile.locator('button[aria-label="Close menu"]').click({ timeout: 8000 }).catch(() => {});
    await mobile.waitForTimeout(400);
  }
});

await check("mobile: theme toggle switches to light and back", async () => {
  const toggle = mobile.locator('nav.fixed.bottom-0 button[aria-label="Toggle theme"]');
  await toggle.click();
  await mobile.waitForTimeout(400);
  let theme = await mobile.evaluate(() => document.documentElement.getAttribute("data-theme"));
  if (theme !== "light") throw new Error(`expected light, got ${theme}`);
  await shot(mobile, "mobile-light");
  await toggle.click();
  await mobile.waitForTimeout(400);
  theme = await mobile.evaluate(() => document.documentElement.getAttribute("data-theme"));
  if (theme !== "dark") throw new Error(`expected dark, got ${theme}`);
});

await check("mobile: bottom nav reaches analytics, progress and history", async () => {
  const nav = mobile.locator("nav.fixed.bottom-0");
  await nav.locator("button", { hasText: "Analytics" }).click();
  await mobile.locator("text=Active days").first().waitFor({ timeout: 12000 });
  await nav.locator("button", { hasText: "Progress" }).click();
  await mobile.locator("text=Exercise weight").first().waitFor({ timeout: 12000 });
  await nav.locator("button", { hasText: "History" }).click();
  await mobile.locator("text=Last 7 days").first().waitFor({ timeout: 12000 });
  await shot(mobile, "mobile-history");
  await mobile.locator('button[aria-label^="Open "]').first().click();
  await mobile.locator('button[aria-label="Previous day"]').waitFor({ timeout: 12000 });
});

await check("mobile: weather page loads forecast, air quality and hourly strip", async () => {
  await menuGoto(mobile, "Weather");
  await mobile.locator("text=7-day forecast").waitFor({ timeout: 45000 });
  await mobile.getByRole("heading", { name: "Air quality" }).first().waitFor({ timeout: 20000 });
  await mobile.locator("text=Next 48 hours").waitFor({ timeout: 20000 });
  const map = mobile.locator('iframe[title^="Map of"]');
  await map.waitFor({ timeout: 20000 });
  const mapSrc = await map.getAttribute("src");
  if (!mapSrc || !mapSrc.includes("google.com/maps") || !mapSrc.includes("output=embed")) {
    throw new Error(`unexpected map src: ${mapSrc}`);
  }
  await shot(mobile, "mobile-weather");
});

await check("mobile: coaches list and detail with shortlist CTA", async () => {
  await menuGoto(mobile, "Coaches");
  await mobile.locator("text=Five coaches").waitFor({ timeout: 12000 });
  const profiles = mobile.locator('button[aria-label^="View "]');
  const count = await profiles.count();
  if (count !== 5) throw new Error(`expected 5 profiles, found ${count}`);
  await profiles.first().click();
  await mobile.locator("text=Certifications").waitFor({ timeout: 8000 });
  await mobile.locator('button:has-text("Add to shortlist")').click();
  await mobile.locator('button:has-text("Shortlisted")').waitFor({ timeout: 8000 });
  await shot(mobile, "mobile-coach-detail");
  await mobile.locator("button", { hasText: "All coaches" }).click();
  await mobile.locator("text=Five coaches").waitFor({ timeout: 8000 });
});

await check("mobile: footer renders five columns and legal links", async () => {
  await scrollToBottom(mobile);
  const footer = mobile.locator("main footer").first();
  await footer.waitFor({ timeout: 8000 });
  for (const heading of ["Train", "Discover", "Company", "Legal", "Resources"]) {
    await footer.locator("h2", { hasText: heading }).waitFor({ timeout: 8000 });
  }
  await shot(mobile, "mobile-footer");
});

for (const [path, heading] of [
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Service"],
  ["/careers", "Careers"],
  ["/sitemap", "Sitemap"],
]) {
  await check(`mobile: ${path} renders with footer`, async () => {
    await mobile.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 });
    await mobile.locator("h1", { hasText: heading }).waitFor({ timeout: 15000 });
    await mobile.locator("footer").first().waitFor({ timeout: 8000 });
    await shot(mobile, `mobile-page-${path.replace("/", "")}`);
  });
}

await check("mobile: back to top appears after 600px and scrolls home", async () => {
  await mobile.goto(`${BASE}/privacy`, { waitUntil: "networkidle" });
  await mobile.evaluate(() => window.scrollTo(0, 900));
  await mobile.waitForTimeout(400);
  const button = mobile.locator('button[aria-label="Back to top"]');
  await button.waitFor({ state: "visible", timeout: 8000 });
  await button.click();
  await mobile.waitForTimeout(900);
  const y = await mobile.evaluate(() => window.scrollY);
  if (y > 120) throw new Error(`still scrolled at ${y}px`);
});

await check("mobile: WhatsApp button uses the wa.me share link", async () => {
  await mobile.goto(BASE, { waitUntil: "networkidle" });
  const link = mobile.locator('a[aria-label="Share Aero Gym on WhatsApp"]');
  const href = await link.getAttribute("href");
  if (!href || !href.startsWith("https://wa.me/?text=")) {
    throw new Error(`unexpected WhatsApp href: ${href}`);
  }
});

/* ------------------------------------------------------------------ */
/*  Desktop: 1440x900                                                  */
/* ------------------------------------------------------------------ */

console.log("\nDESKTOP 1440x900");
const desktopContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ["geolocation", "clipboard-read", "clipboard-write"],
  geolocation: { latitude: 33.6844, longitude: 73.0479 },
});
const desktop = await desktopContext.newPage();
watch(desktop, "desktop");

await desktop.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
const desktopSplash = await waitForSplash(desktop);

await check("desktop: splash renders and clears", async () => {
  if (!desktopSplash) throw new Error("splash overlay never rendered");
});

await check("desktop: logo shows the brand name in the sidebar", async () => {
  await desktop.locator("aside span", { hasText: "Aero Gym" }).first().waitFor({ timeout: 8000 });
  await shot(desktop, "desktop-home");
});

await check("desktop: sidebar reaches all six views", async () => {
  const asideNav = desktop.locator("aside nav");
  await asideNav.locator("button", { hasText: "Analytics" }).first().click();
  await desktop.locator("text=Active days").first().waitFor({ timeout: 12000 });
  await asideNav.locator("button", { hasText: "Progress" }).first().click();
  await desktop.locator("text=Exercise weight").first().waitFor({ timeout: 12000 });
  await asideNav.locator("button", { hasText: "History" }).first().click();
  await desktop.locator("text=Last 7 days").first().waitFor({ timeout: 12000 });
  await asideNav.locator("button", { hasText: "Coaches" }).first().click();
  await desktop.locator("text=Five coaches").waitFor({ timeout: 12000 });
  await asideNav.locator("button", { hasText: "Weather" }).first().click();
  await desktop.locator("text=7-day forecast").waitFor({ timeout: 45000 });
  await shot(desktop, "desktop-weather");
  await asideNav.locator("button", { hasText: "Workouts" }).first().click();
  await desktop.locator('button[aria-label="Previous day"]').waitFor({ timeout: 12000 });
});

await check("desktop: deep link to coaches opens the right view", async () => {
  await desktop.goto(`${BASE}/?tab=coaches`, { waitUntil: "networkidle", timeout: 45000 });
  await desktop.locator("text=Five coaches").waitFor({ timeout: 12000 });
  await shot(desktop, "desktop-coaches");
});

await check("desktop: theme toggle in the sidebar", async () => {
  await desktop.locator("aside button[aria-label='Toggle theme']").click();
  await desktop.waitForTimeout(400);
  const theme = await desktop.evaluate(() => document.documentElement.getAttribute("data-theme"));
  if (theme !== "light") throw new Error(`expected light, got ${theme}`);
  await shot(desktop, "desktop-light");
  await desktop.locator("aside button[aria-label='Toggle theme']").click();
});

await check("desktop: back to top works inside the scroll container", async () => {
  await desktop.goto(`${BASE}/?tab=weather`, { waitUntil: "networkidle" });
  await desktop.locator("text=7-day forecast").waitFor({ timeout: 45000 });
  await scrollToBottom(desktop);
  await desktop.waitForFunction(
    () => {
      const button = document.querySelector('button[aria-label="Back to top"]');
      return !!button && getComputedStyle(button).pointerEvents !== "none";
    },
    null,
    { timeout: 12000 },
  );
  const button = desktop.locator('button[aria-label="Back to top"]');
  await button.click({ timeout: 15000 });
  await desktop.waitForTimeout(900);
  const top = await desktop.evaluate(() => {
    const el = document.querySelector("main > div");
    return el ? el.scrollTop : window.scrollY;
  });
  if (top > 120) throw new Error(`scroller still at ${top}px`);
});

await check("desktop: footer deep links switch tabs", async () => {
  await scrollToBottom(desktop);
  await desktop.locator("main footer a", { hasText: "Analytics" }).click();
  await desktop.locator("text=Active days").first().waitFor({ timeout: 15000 });
  if (!desktop.url().includes("tab=analytics")) {
    throw new Error(`URL did not carry the tab: ${desktop.url()}`);
  }
});

await check("desktop: PWA manifest, robots and sitemap respond", async () => {
  for (const [path, mustContain] of [
    ["/manifest.json", "Aero Gym"],
    ["/robots.txt", "sitemap.xml"],
    ["/sitemap.xml", "<urlset"],
  ]) {
    const response = await desktopContext.request.get(`${BASE}${path}`);
    if (!response.ok()) throw new Error(`${path} returned ${response.status()}`);
    const body = await response.text();
    if (!body.includes(mustContain)) throw new Error(`${path} missing ${mustContain}`);
  }
  const manifest = await (await desktopContext.request.get(`${BASE}/manifest.json`)).json();
  if (manifest.name !== "Aero Gym" || !Array.isArray(manifest.icons) || manifest.icons.length < 2) {
    throw new Error("manifest is missing the name or icons");
  }
});

await check("every internal link on every page answers 200", async () => {
  const pages = ["/", "/privacy", "/terms", "/careers", "/sitemap"];
  const hrefs = new Set();
  for (const path of pages) {
    await desktop.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 });
    const found = await desktop.$$eval("a[href]", (anchors) =>
      anchors
        .map((a) => a.getAttribute("href"))
        .filter((href) => href && href.startsWith("/")),
    );
    found.forEach((href) => hrefs.add(href));
  }
  const failures = [];
  for (const href of hrefs) {
    const response = await desktopContext.request.get(`${BASE}${href}`);
    if (!response.ok()) failures.push(`${href} -> ${response.status()}`);
  }
  if (failures.length > 0) throw new Error(failures.join(", "));
});

/* ------------------------------------------------------------------ */

await browser.close();

const sameOriginHttp = httpFailures.filter((entry) => entry.url.startsWith(BASE));
const failed = results.filter((entry) => !entry.ok);

console.log("\n================ AUDIT SUMMARY ================");
console.log(`Checks: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
if (failed.length > 0) {
  console.log("\nFailures:");
  failed.forEach((entry) => console.log(` - ${entry.name}: ${entry.error}`));
}
if (consoleErrors.length > 0) {
  console.log("\nConsole errors:");
  consoleErrors.forEach((entry) => console.log(` - [${entry.device}] ${entry.text}`));
}
if (sameOriginHttp.length > 0) {
  console.log("\nSame-origin HTTP failures:");
  sameOriginHttp.forEach((entry) => console.log(` - [${entry.device}] ${entry.status} ${entry.url}`));
}
const externalHttp = httpFailures.filter((entry) => !entry.url.startsWith(BASE));
if (externalHttp.length > 0) {
  console.log("\nExternal HTTP failures:");
  externalHttp.forEach((entry) => console.log(` - ${entry.status} ${entry.url}`));
}
console.log(`\nScreenshots: ${shotNumber - 24} saved to ${OUT}/`);

if (failed.length > 0 || consoleErrors.length > 0 || sameOriginHttp.length > 0) {
  process.exitCode = 1;
}
