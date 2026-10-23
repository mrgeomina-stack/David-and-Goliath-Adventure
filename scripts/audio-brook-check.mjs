import { collectWithRing } from "./brook-input.mjs";
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
  });
  const page = await context.newPage(),
    errors = [];
  await page.addInitScript(() => {
    if (window.speechSynthesis) speechSynthesis.getVoices = () => [];
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto((process.env.GAME_URL || "http://localhost:4173/") + "?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  await context.setOffline(true);
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  await page.click("#language");
  await page.click("#language");
  await page.click("#practice-toggle");
  await page.click('[data-mission="armor"]');
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioEvents.voice >= 1,
  );
  if ((await state()).language !== "ar") throw Error("Arabic not selected");
  await page.screenshot({ path: "qa/94-arabic-spoken-guidance-phone.png" });
  await page.click("#pause");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioState === "suspended",
  );
  await page.click("#modal-actions button:first-child");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioState === "running",
  );
  await page.click("#sound");
  const muted = (await state()).audioEvents.voice;
  await page.waitForTimeout(500);
  if (
    (await state()).audioState !== "suspended" ||
    (await state()).audioEvents.voice !== muted
  )
    throw Error("Mute did not silence playback");
  await page.click("#sound");
  await page.click("#book-toggle");
  await page.click('[data-mission="brook"]');
  await page.waitForTimeout(2800);
  const first = await state();
  await page.waitForTimeout(250);
  const second = await state();
  if (
    Math.hypot(first.ring.x - second.ring.x, first.ring.y - second.ring.y) < 25
  )
    throw Error("Ring not moving briskly in 2D");
  await page.screenshot({ path: "qa/95-scattered-brook-phone.png" });
  const box = await page.locator("canvas").boundingBox();
  async function tap(p) {
    await page.touchscreen.tap(
      box.x + (p.x * box.width) / 1280,
      box.y + (p.y * box.height) / 720,
    );
  }
  await tap(first.stones.find((s) => !s.smooth));
  await page.waitForTimeout(450);
  if ((await state()).stoneCount !== 0) throw Error("Jagged stone scored");
  const offRing = await state();
  await tap(
    offRing.stones.find(
      (s) =>
        s.smooth &&
        Math.hypot(s.x - offRing.ring.x, s.y - offRing.ring.y) > 250,
    ),
  );
  if ((await state()).stoneCount !== 0)
    throw Error("A tap bypassed the moving ring timing requirement");
  await page.waitForTimeout(450);
  await collectWithRing(page, 5, true);
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
  const result = await state();
  if (
    result.audioEvents.complete !== 1 ||
    result.audioEvents.roar ||
    result.stoneCount !== 5
  )
    throw Error("Completion audio or collection incorrect");
  if (result.sampleDurations.sheep < 4 || result.sampleDurations.complete < 12)
    throw Error("Uploaded recordings were not decoded");
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/audio-brook-results.json",
    JSON.stringify(
      {
        offline: true,
        language: "ar",
        audio: result.audioEvents,
        decodedSeconds: result.sampleDurations,
        touchUniqueStones: 5,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "AUDIO + BROOK PASS: offline Arabic fallback, pause/mute, supplied recording decoding, 2D motion, touch jagged/off-ring rejection and five timed unique stones, one victory.",
  );
} finally {
  await browser.close();
}
