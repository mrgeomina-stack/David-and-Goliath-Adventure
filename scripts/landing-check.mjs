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
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await bootOfflineBuild(page, context);
  await page.waitForSelector('#stage[data-ready="true"]');
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  await page.click("#practice-toggle");
  await page.click('[data-mission="sling"]');
  await page.waitForTimeout(2700);
  const shoot = async (ms) => {
    await page.keyboard.down("Space");
    await page.waitForTimeout(ms);
    await page.keyboard.up("Space");
  };
  for (const ms of [10, 2100]) {
    await shoot(ms);
    await page.waitForFunction(
      () => window.adventureQA.snapshot().shot === "miss",
    );
    if ((await state()).audioEvents.impact)
      throw Error("A missed shot triggered landing audio");
    await page.click("#continue");
  }
  await shoot(1000);
  await page.waitForFunction(
    () => window.adventureQA.snapshot().shot === "hit",
  );
  let s = await state();
  if (s.audioEvents.impact || s.audioEvents.complete)
    throw Error("Impact/music played before landing");
  await page.click("#pause");
  const frozen = (await state()).successTime;
  await page.waitForTimeout(1200);
  s = await state();
  if (s.successTime !== frozen || s.audioEvents.impact)
    throw Error("Paused fall did not freeze sound timing");
  await page.click("#modal-actions button:first-child");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioEvents.impact === 1,
  );
  s = await state();
  if (s.successTime < 1 || s.successTime > 1.4 || s.audioEvents.complete)
    throw Error("Impact not synchronized with ground frame");
  await page.screenshot({ path: "qa/96-giant-ground-impact.png" });
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioEvents.complete === 1,
  );
  if ((await state()).successTime < 1.65)
    throw Error("Victory masks initial impact");
  await page.waitForTimeout(1500);
  if ((await state()).audioEvents.impact !== 1)
    throw Error("Impact repeated on subsequent frames");
  await page.click("#book-toggle");
  await page.click('[data-mission="sling"]');
  await page.waitForTimeout(2700);
  await shoot(1000);
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioEvents.impact === 2,
  );
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioEvents.complete === 2,
  );
  await page.click("#book-toggle");
  await page.click('[data-mission="sling"]');
  await page.waitForTimeout(2700);
  await page.click("#sound");
  // Exercise the actual on-screen hold/release control after using a toolbar button.
  const action = await page.locator("#action").boundingBox();
  await page.mouse.move(
    action.x + action.width / 2,
    action.y + action.height / 2,
  );
  await page.mouse.down();
  await page.waitForTimeout(1000);
  await page.mouse.up();
  try {
    await page.waitForFunction(
      () => window.adventureQA.snapshot().successTime > 2,
      null,
      { timeout: 8000 },
    );
  } catch (error) {
    throw Error("Muted run did not finish: " + JSON.stringify(await state()), {
      cause: error,
    });
  }
  s = await state();
  if (s.audioEvents.impact !== 2 || s.audioEvents.complete !== 2)
    throw Error("Muted victory generated sound");
  await page.click("#sound");
  await page.waitForTimeout(250);
  if ((await state()).audioEvents.impact !== 2)
    throw Error("Unmute replayed stale impact");
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/landing-results.json",
    JSON.stringify(
      {
        passed: true,
        serviceWorkers: "block",
        checks: [
          "weak/strong misses silent",
          "impact waits for landing",
          "pause freezes landing",
          "one impact per hit",
          "victory follows impact",
          "new run resets",
          "mute suppresses impact and victory",
          "unmute does not replay",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "LANDING PASS: offline weak/strong misses, real hit, pause, ground-frame timing, once per run, replay and mute.",
  );
} finally {
  await browser.close();
}
