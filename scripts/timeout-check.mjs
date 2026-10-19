import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.clock.install();
await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
await page.click("#start");
// Advance browser time, not game state: exercise the same update loop and retry UI.
await page.clock.runFor(101000);
let state = await page.evaluate(() => window.adventureQA.snapshot());
if (!state.failed || state.phase !== "play" || state.sheep.some((s) => s.saved))
  throw Error("Timeout granted progress or did not offer retry");
await page.screenshot({ path: "qa/35-sheep-gentle-retry.png" });
await page.click("#continue");
state = await page.evaluate(() => window.adventureQA.snapshot());
if (
  state.failed ||
  state.mission !== "sheep" ||
  state.sheep.some((s) => s.saved)
)
  throw Error("Retry did not reset safely");
console.log(
  "TIMEOUT PASS: simulated 101 seconds, no auto-win, gentle retry and clean reset.",
);
await browser.close();
