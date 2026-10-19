import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
await page.click("#practice-toggle");
await page.click('[data-mission="armor"]');
await page.waitForTimeout(2800);
const state = () => page.evaluate(() => window.adventureQA.snapshot());
await page.screenshot({ path: "qa/07-armor-start.png" });
async function drag(a, b) {
  await page.mouse.move(...a);
  await page.mouse.down();
  await page.mouse.move(...b, { steps: 15 });
  if (a[0] === 220 && a[1] === 280)
    await page.screenshot({ path: "qa/07b-armor-dragging.png" });
  await page.mouse.up();
  await page.waitForTimeout(200);
}
await drag([220, 482], [650, 441]);
if ((await state()).equipped.length) throw Error("Helmet accepted at waist");
await page.screenshot({ path: "qa/08-armor-wrong.png" });
for (const [a, b] of [
  [
    [220, 280],
    [650, 395],
  ],
  [
    [1045, 280],
    [650, 395],
  ],
  [
    [220, 482],
    [650, 227],
  ],
])
  await drag(a, b);
if ((await state()).fallTime !== -1) throw Error("Premature collapse");
await page.screenshot({ path: "qa/09-armor-three.png" });
await drag([1045, 482], [691, 441]);
await page.screenshot({ path: "qa/10-armor-dressed.png" });
await page.waitForTimeout(2400);
await page.screenshot({ path: "qa/11-armor-fall.png" });
await page.waitForTimeout(1800);
await page.screenshot({ path: "qa/12-armor-removal.png" });
await page.waitForTimeout(2000);
await page.screenshot({ path: "qa/13-armor-recovered.png" });
if ((await state()).phase !== "success") throw Error("No armor success");
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "ARMOR PASS: wrong-zone reset, 3/4 gating, real drag of all four, staged 6.5s collapse/removal/recovery.",
);
await browser.close();
