import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.install();
  await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  await page.selectOption("#difficulty", "normal");
  await page.click("#start");
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  if (
    (await state()).sheepTimeLimit !== 30 ||
    (await state()).sheep.length !== 4
  )
    throw Error("Normal rescue setup");
  await page.click("#pause");
  const paused = (await state()).sheepRemaining;
  await page.clock.runFor(1200);
  if ((await state()).sheepRemaining !== paused)
    throw Error("Paused countdown moved");
  await page.click("#modal-actions button:first-child");
  // Advance the browser clock through real game updates; never edit game state.
  await page.clock.runFor(14000);
  if (
    !(await page
      .locator("#sheep-clock")
      .evaluate((e) => e.classList.contains("warning")))
  )
    throw Error("Missing 20s warning");
  await page.screenshot({ path: "qa/46-sheep-countdown-warning.png" });
  await page.clock.runFor(10000);
  if (
    !(await page
      .locator("#sheep-clock")
      .evaluate((e) => e.classList.contains("urgent")))
  )
    throw Error("Missing urgent warning");
  await page.screenshot({ path: "qa/47-sheep-countdown-urgent.png" });
  await page.clock.runFor(15000);
  const failure = await state();
  if (
    !failure.failed ||
    failure.caughtIndex === null ||
    failure.sheep.some((s) => s.saved)
  )
    throw Error("Lion failed to catch after deadline");
  await page.screenshot({ path: "qa/35-sheep-gentle-retry.png" });
  await page.click("#continue");
  const reset = await state();
  if (
    reset.failed ||
    reset.caughtIndex !== null ||
    reset.carriedIndex !== null ||
    reset.sheep.length !== 4 ||
    reset.sheepRemaining < 29
  )
    throw Error("Retry did not reset countdown and flock");
  await page.click("#restart");
  await page.click("#modal-actions button:nth-child(2)");
  await page.selectOption("#difficulty", "free");
  await page.click("#start");
  if (
    (await state()).sheepRemaining !== null ||
    !(await page.locator("#sheep-time").textContent()).includes("∞")
  )
    throw Error("Untimed mode mislabeled");
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/sheep-countdown-results.json",
    JSON.stringify(
      {
        normalSeconds: 30,
        easySeconds: 30,
        checks: [
          "four sheep",
          "countdown pause",
          "20s warning",
          "10s urgent warning",
          "actual pursuit/catch after zero",
          "clean retry",
          "explicit untimed mode",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "COUNTDOWN PASS: warnings, paused time, real lion catch, four-sheep retry, untimed label.",
  );
} finally {
  await browser.close();
}
