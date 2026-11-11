// Aero Gym - export / import round-trip audit (PRD §4.5, M10).
// Seeds a workout, exports the backup, clears workout logs, imports the
// backup and confirms the data comes back after the app reloads.

import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const BACKUP = ".playwright-mcp/data-backup.json";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.locator('div[role="presentation"]').waitFor({ state: "detached", timeout: 12000 }).catch(() => {});

// Seed one workout.
await page.locator('button[aria-label="Add exercise"]').click();
const input = page.locator('input[placeholder="e.g. bench press, squat"]');
await input.waitFor({ state: "visible", timeout: 15000 });
await input.fill("Bench Press");
await page.locator("ul li button", { hasText: "Bench Press" }).first().click();
await page.getByRole("button", { name: "Add exercise", exact: true }).last().click();
await page.locator("h3", { hasText: "Bench Press" }).first().waitFor({ timeout: 20000 });

// Export from the settings panel inside the burger menu.
await page.locator('button[aria-label="Menu"]').first().click();
await page.locator('button[aria-label="Close menu"]').waitFor({ state: "visible", timeout: 8000 });
const [download] = await Promise.all([
  page.waitForEvent("download", { timeout: 20000 }),
  page.getByRole("button", { name: /Export backup/i }).click(),
]);
await download.saveAs(BACKUP);
const backup = JSON.parse(readFileSync(BACKUP, "utf8"));
const exported = JSON.stringify(backup);
if (!exported.includes("Bench Press")) throw new Error("export does not contain the seeded workout");
console.log("EXPORT_OK", download.suggestedFilename());

// Clear workout logs with the double-tap confirmation.
const clearRow = page.locator('button:has-text("Workout logs")').first();
await clearRow.click();
await clearRow.click();
await page.waitForTimeout(600);
const afterClear = await page.evaluate(() => localStorage.getItem("myWorkoutLogs"));
if (afterClear !== "{}") throw new Error(`workout logs not cleared: ${afterClear}`);
console.log("CLEAR_OK");

// Import the backup back through the hidden file input.
await page.locator('input[type="file"]').setInputFiles(BACKUP);
await page.getByRole("button", { name: "Import", exact: true }).click({ timeout: 15000 });
await page.waitForLoadState("networkidle", { timeout: 45000 });
await page.waitForTimeout(1500);
const restored = await page.evaluate(() => localStorage.getItem("myWorkoutLogs"));
if (!restored || !restored.includes("Bench Press")) throw new Error("import did not restore the workout");
await page.locator("h3", { hasText: "Bench Press" }).first().waitFor({ timeout: 20000 });
console.log("IMPORT_OK");

await page.screenshot({ path: ".playwright-mcp/data-import-restored.png" });
await browser.close();

if (errors.length > 0) {
  console.log("DATA_FAIL page errors:", errors.join(" | "));
  process.exitCode = 1;
} else {
  console.log("DATA_PASS");
}
