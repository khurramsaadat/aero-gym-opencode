// Aero Gym - production PWA / offline audit.
// Serves the built app with `next start -p 3100`, then verifies the
// service worker registers, caches assets, and renders offline.
//
// Usage: npm run build; next start -p 3100; node scripts/e2e/pwa-audit.mjs

import { chromium } from "playwright";

const BASE = process.env.PWA_BASE_URL ?? "http://localhost:3100";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });

const registered = await page.evaluate(async () => {
  if (!("serviceWorker" in navigator)) return { ok: false, reason: "unsupported" };
  const result = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((resolve) => setTimeout(() => resolve(null), 15000)),
  ]);
  return result ? { ok: true, scope: result.scope, active: !!result.active } : { ok: false, reason: "ready timed out" };
});
console.log("SERVICE_WORKER", JSON.stringify(registered));

await page.waitForTimeout(2000);

const caches = await page.evaluate(async () => {
  const names = await window.caches.keys();
  const counts = {};
  for (const name of names) {
    const cache = await window.caches.open(name);
    counts[name] = (await cache.keys()).length;
  }
  return counts;
});
console.log("CACHES", JSON.stringify(caches));

const cdp = await context.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: true,
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0,
});

let offlineOk = false;
let offlineText = "";
try {
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);
  offlineText = (await page.locator("body").innerText()).slice(0, 240);
  offlineOk = /Aero Gym|QUICK ADD|Today|Nothing logged/i.test(offlineText);
} catch (error) {
  offlineText = `reload failed: ${String(error.message).split("\n")[0]}`;
}
console.log("OFFLINE_OK", offlineOk);
console.log("OFFLINE_TEXT", JSON.stringify(offlineText));
await page.screenshot({ path: ".playwright-mcp/pwa-offline.png" });

await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 0,
  downloadThroughput: -1,
  uploadThroughput: -1,
});

const failures = [];
if (!registered.ok) failures.push(`service worker not ready: ${registered.reason}`);
if (!Object.values(caches).some((count) => count > 0)) failures.push("no cached entries");
if (!offlineOk) failures.push("offline reload did not render the app shell");
if (errors.length > 0) failures.push(`page errors: ${errors.join(" | ")}`);

await browser.close();

if (failures.length > 0) {
  console.log("PWA_FAIL", failures.join("; "));
  process.exitCode = 1;
} else {
  console.log("PWA_PASS");
}
