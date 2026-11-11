// Aero Gym - visual verification script.
// Captures numbered screenshots to .playwright-mcp/ at mobile (375px,
// cellular-slow-4G emulation) and desktop widths, exercising the shell:
// theme toggle, burger menu open/close, tab switching.
// Usage: node scripts/e2e/screenshot.mjs

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = ".playwright-mcp";
const BASE = "http://localhost:3000";
mkdirSync(OUT_DIR, { recursive: true });

let counter = 0;
function nextName(label) {
  counter += 1;
  return join(OUT_DIR, `${String(counter).padStart(2, "0")}-${label}.png`);
}

const slow4G = {
  offline: false,
  downloadThroughput: 500 * 1024,
  uploadThroughput: 500 * 1024,
  latency: 150,
};

const browser = await chromium.launch();

// ---------- mobile: 375x812, slow 4G ----------
const mobile = await browser.newPage({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
});
// cellular-slow-4G simulation via CDP (emulateNetworkConditions was removed)
const cdp = await mobile.context().newCDPSession(mobile);
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  downloadThroughput: 500 * 1024,
  uploadThroughput: 500 * 1024,
  latency: 150,
});
await mobile.goto(BASE, { waitUntil: "networkidle" });

await mobile.screenshot({ path: nextName("mobile-01-home-dark"), fullPage: false });

// open the burger menu, screenshot the full-page menu
await mobile.click('button[aria-label="Menu"]');
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: nextName("mobile-02-burger-open"), fullPage: true });
await mobile.click('button[aria-label="Close menu"]');
await mobile.waitForTimeout(400);

// switch to a different tab (analytics)
await mobile.locator('nav.fixed.bottom-0 button', { hasText: "Analytics" }).click();
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: nextName("mobile-03-tab-analytics"), fullPage: false });

// theme toggle to light (mobile bottom nav)
await mobile.locator('nav.fixed.bottom-0 button[aria-label="Toggle theme"]').click();
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: nextName("mobile-04-light-theme"), fullPage: false });
await mobile.locator('nav.fixed.bottom-0 button[aria-label="Toggle theme"]').click(); // back to dark
await mobile.waitForTimeout(400);

// ---------- desktop: 1440x900 ----------
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(BASE, { waitUntil: "networkidle" });
await desktop.screenshot({ path: nextName("desktop-05-sidebar-dark"), fullPage: false });

// coaches tab on desktop
await desktop.click('button:has-text("Coaches")');
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: nextName("desktop-06-coaches"), fullPage: false });

// light theme on desktop
await desktop.locator("aside button[aria-label='Toggle theme']").click();
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: nextName("desktop-07-sidebar-light"), fullPage: false });

await browser.close();
console.log(`Saved ${counter} screenshots to ${OUT_DIR}/`);
