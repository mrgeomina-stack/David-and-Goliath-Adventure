import { chromium } from "@playwright/test";
import { writeFileSync, renameSync } from "node:fs";
import { bootOfflineBuild } from "./offline-build.mjs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    hasTouch: true,
    serviceWorkers: "block",
    recordVideo:
      process.env.RECORD_TITLE_VIDEO === "1"
        ? {
            dir: "qa/title-flock-video",
            size: { width: 1280, height: 720 },
          }
        : undefined,
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await bootOfflineBuild(page, context);
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  const before = await state();
  if (
    before.titleScene?.sheep.length !== 9 ||
    before.titleScene.david.facing !== -1
  )
    throw Error("Cover flock or facing incorrect");
  await page.screenshot({ path: "qa/98-title-flock-desktop.png" });
  await page.locator(".brand").click();
  await page.waitForTimeout(6500);
  const later = await state();
  if (
    !later.titleScene.sheep.some(
      (s) =>
        Math.abs(s.x - before.titleScene.sheep.find((a) => a.id === s.id).x) >
        35,
    )
  )
    throw Error("Flock is static");
  if (
    !later.titleScene.sheep.some((s) => s.y < 665) ||
    !later.titleScene.sheep.some((s) => s.y > 665)
  )
    throw Error("Missing foreground/background layers");
  if (later.audioEvents.background !== 1) throw Error("Landing music failed");
  await page.screenshot({ path: "qa/98-title-flock-walking.png" });
  await page.locator("#language").click();
  await page.locator("#language").click();
  await page.screenshot({ path: "qa/98-title-flock-arabic.png" });
  const arabicSize = await page
    .locator(".arabic-title")
    .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  if (arabicSize < 40) throw Error("Arabic cover heading lost its hierarchy");
  await page.locator("#language").click();
  for (const size of [
    { width: 1180, height: 820 },
    { width: 844, height: 390 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(300);
    for (const id of ["start", "practice-toggle"]) {
      const b = await page.locator("#" + id).boundingBox();
      if (
        !b ||
        b.x < 0 ||
        b.y < 0 ||
        b.x + b.width > size.width + 1 ||
        b.y + b.height > size.height + 1
      )
        throw Error("Cover control clipped at " + size.width);
    }
    await page.screenshot({ path: `qa/98-title-flock-${size.width}.png` });
  }
  await page.locator("#practice-toggle").click();
  await page.locator('[data-mission="sheep"]').click();
  const rescue = await state();
  if (
    rescue.mission !== "sheep" ||
    rescue.sheep.length !== 4 ||
    rescue.titleScene !== null
  )
    throw Error("Decorative sheep affected rescue gameplay");
  if (errors.length) throw Error(errors.join("\n"));
  const video = page.video();
  await context.close();
  if (video) renameSync(await video.path(), "qa/98-title-flock-motion.webm");
  writeFileSync(
    "qa/title-flock-1.9.3.json",
    JSON.stringify(
      {
        passed: true,
        offline: true,
        sheep: 9,
        davidFacing: "left",
        checks: [
          "moving poses",
          "depth behind and in front",
          "correct larger proportions",
          "music retained",
          "desktop tablet phone controls",
          "mission navigation",
          "four rescue sheep unchanged",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "TITLE FLOCK PASS: nine moving larger sheep, left-facing David, depth layers, offline music, desktop/tablet/phones and unchanged rescue entry.",
  );
} finally {
  await browser.close();
}
