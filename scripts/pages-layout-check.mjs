import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
mkdirSync("qa/pages", { recursive: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    hasTouch: true,
  });
  const page = await context.newPage(),
    errors = [],
    results = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto((process.env.GAME_URL || "http://127.0.0.1:4180/") + "?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  await page.evaluate(() => document.fonts.ready);
  for (const size of [
    { width: 1280, height: 720 },
    { width: 1366, height: 650 },
    { width: 1180, height: 820 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(250);
    const pixels = await page
      .locator("h1")
      .evaluate(
        (e) =>
          parseFloat(getComputedStyle(e).fontSize) *
          parseFloat(
            document.documentElement.style.getPropertyValue("--game-scale"),
          ),
      );
    if (size.width >= 1000 && pixels < 50)
      throw Error("Existing large cover title shrank");
    for (const id of ["start", "practice-toggle"]) {
      const b = await page.locator("#" + id).boundingBox();
      if (!b || b.height < 43 || b.y + b.height > size.height)
        throw Error("CTA bounds");
      const hit = await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.id,
        { x: b.x + b.width / 2, y: b.y + b.height / 2 },
      );
      if (hit !== id) throw Error("Cover art obstructed a control");
    }
    const s = await page.evaluate(() => window.adventureQA.snapshot());
    if (s.titleScene.sheep.length !== 9 || s.titleScene.david.facing !== -1)
      throw Error("Cover actors changed");
    await page.screenshot({ path: `qa/pages/cover-${size.width}.png` });
    results.push({ ...size, titlePixels: pixels });
  }
  await page.setViewportSize({ width: 1366, height: 650 });
  await page.click("#language");
  await page.click("#language");
  await page.screenshot({ path: "qa/pages/cover-arabic.png" });
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/pages/layout-results.json",
    JSON.stringify(
      {
        results,
        checks: [
          "large desktop cover retained",
          "tablet/phone CTA bounds",
          "nine sheep behind clickable buttons",
          "Arabic cover",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "PAGES LAYOUT PASS: existing large cover, bilingual UI and responsive CTA bounds.",
  );
} finally {
  await browser.close();
}
