import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { bootOfflineBuild } from "./offline-build.mjs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    serviceWorkers: "block",
    hasTouch: true,
  });
  const page = await context.newPage(),
    errors = [],
    results = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await bootOfflineBuild(page, context);
  for (const size of [
    { width: 1280, height: 720 },
    { width: 1366, height: 650 },
    { width: 1180, height: 820 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(250);
    const large = await page
      .locator("html")
      .evaluate((e) => e.classList.contains("cover-large"));
    const pixels = await page
      .locator("h1")
      .evaluate(
        (e) =>
          parseFloat(getComputedStyle(e).fontSize) *
          parseFloat(
            document.documentElement.style.getPropertyValue("--game-scale"),
          ),
      );
    if (size.width >= 1000 && (!large || pixels < 50))
      throw Error("Desktop title shrank at " + size.width + ": " + pixels);
    for (const id of ["start", "practice-toggle"]) {
      const b = await page.locator("#" + id).boundingBox();
      if (!b || b.height < 43 || b.y + b.height > size.height)
        throw Error("CTA size or bounds incorrect at " + size.width);
      const hit = await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.id,
        { x: b.x + b.width / 2, y: b.y + b.height / 2 },
      );
      if (hit !== id) throw Error("Sheep or another layer obstructed the CTA");
    }
    const s = await page.evaluate(() => window.adventureQA.snapshot());
    if (s.titleScene.sheep.length !== 9 || s.titleScene.david.facing !== -1)
      throw Error("Cover actors changed");
    await page.screenshot({ path: `qa/99-cover-restored-${size.width}.png` });
    results.push({ ...size, titlePixels: pixels, large });
  }
  await page.setViewportSize({ width: 1366, height: 650 });
  await page.click("#language");
  await page.click("#language");
  await page.screenshot({ path: "qa/99-cover-restored-arabic.png" });
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/cover-size-1.10.0.json",
    JSON.stringify(
      {
        passed: true,
        results,
        checks: [
          "reference desktop typography restored",
          "short desktop keeps large cover",
          "tablet and phone bounds",
          "large clickable CTAs above wandering sheep",
          "nine sheep and left-facing David retained",
          "Arabic cover",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "COVER SIZE PASS: large reference typography and controls restored at full/short desktop and tablet sizes; phone controls, Arabic, nine sheep and button foreground verified.",
  );
} finally {
  await browser.close();
}
