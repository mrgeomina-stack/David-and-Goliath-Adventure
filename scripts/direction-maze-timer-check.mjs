import { touchStick } from "./joystick-input.mjs";
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [],
  checks = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: true,
  });
  page.on("pageerror", (e) => errors.push(e.message));
  const url = (process.env.GAME_URL || "http://localhost:4173/") + "?qa";
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  const stick = await touchStick(page);
  async function open(mission, free = false) {
    await page.goto(url);
    await page.waitForSelector("#stage[data-ready=true]");
    if (free) await page.selectOption("#difficulty", "free");
    await page.click("#practice-toggle");
    await page.click(`[data-mission=${mission}]`);
  }
  await open("sheep", true);
  await page.waitForTimeout(2700);
  const sheep = (await state()).sheep[0];
  for (let i = 0; i < 100; i++) {
    const d = (await state()).david,
      dx = sheep.x - 25 - d.x,
      dy = sheep.y - d.y;
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) break;
    const key =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "ArrowRight"
          : "ArrowLeft"
        : dy > 0
          ? "ArrowDown"
          : "ArrowUp";
    await page.keyboard.down(key);
    await page.waitForTimeout(
      Math.min(
        160,
        Math.max(25, (Math.max(Math.abs(dx), Math.abs(dy)) / 245) * 1000),
      ),
    );
    await page.keyboard.up(key);
  }
  await page.keyboard.press("Space");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().liftProgress === 1,
  );
  for (const [key, face, file] of [
    ["ArrowRight", 1, "84-carry-facing-right"],
    ["ArrowLeft", -1, "85-carry-facing-left"],
  ]) {
    await page.keyboard.down(key);
    await page.waitForTimeout(180);
    await page.keyboard.up(key);
    if (
      (await state()).facing !== face ||
      (await state()).carriedIndex === null
    )
      throw Error("Carry facing incorrect");
    await page.screenshot({ path: `qa/${file}.png` });
  }
  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(100);
  if ((await state()).facing !== -1)
    throw Error("Vertical movement forgot lateral facing");
  await stick.steer({ x: 1, y: 0 }, 45);
  await page.waitForTimeout(100);
  if ((await state()).facing !== 1)
    throw Error("Touch direction did not turn character");
  checks.push(
    "real carried sheep, left/right keyboard facing, retained idle/vertical facing and touch turn",
  );
  await page.clock.install();
  await open("maze");
  const first = await state();
  if (first.activityRemaining !== 30 || first.mazeEdges[0].length !== 2)
    throw Error("Fresh timer/start choice");
  await page.screenshot({ path: "qa/86-branching-maze-green-timer.png" });
  await page.clock.runFor(2700);
  await page.click("#pause");
  const before = (await state()).activityRemaining;
  await page.clock.runFor(4000);
  if ((await state()).activityRemaining !== before)
    throw Error("Pause consumed activity time");
  await page.click("#modal-actions button:first-child");
  await page.clock.runFor(10200);
  if (
    !(await page
      .locator("#sheep-clock")
      .evaluate((e) => e.classList.contains("warning")))
  )
    throw Error("20-second orange state absent");
  await page.screenshot({ path: "qa/87-maze-orange-timer.png" });
  await page.clock.runFor(10200);
  if (
    !(await page
      .locator("#sheep-clock")
      .evaluate((e) => e.classList.contains("urgent")))
  )
    throw Error("Below-10 red state absent");
  await page.screenshot({ path: "qa/88-maze-red-timer.png" });
  await page.clock.runFor(11000);
  if (!(await state()).timedOut || !(await state()).failed)
    throw Error("Maze deadline not enforced");
  await page.screenshot({ path: "qa/89-maze-timeout-retry.png" });
  await page.click("#continue");
  if ((await state()).failed || (await state()).activityRemaining !== 30)
    throw Error("Retry timer not reset");
  checks.push(
    "fresh green timer, genuine start choice, pause freeze, orange at20/red below10, actual expiry and fresh retry",
  );
  for (const mission of ["armor", "brook"]) {
    await open(mission);
    if ((await state()).activityRemaining !== 30)
      throw Error(mission + " timer not 30");
    await page.clock.runFor(34000);
    const s = await state();
    if (!s.failed || !s.timedOut || s.activityRemaining !== 0)
      throw Error(mission + " did not expire");
    await page.click("#continue");
    if ((await state()).failed || (await state()).activityRemaining !== 30)
      throw Error(mission + " retry");
    checks.push(
      mission + ": 30-second expiry blocks input, gentle retry and fresh timer",
    );
  }
  for (const mission of ["sheep", "maze", "armor", "brook", "sling"]) {
    await open(mission, true);
    await page.clock.runFor(3500);
    if (
      (await state()).activityRemaining !== null ||
      !(await page.locator("#countdown-track").isHidden())
    )
      throw Error(mission + " Free Play is not untimed");
  }
  checks.push("all five Free Play activities remain untimed");
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/direction-maze-timer-results.json",
    JSON.stringify({ checks, errors }, null, 2) + "\n",
  );
  console.log(
    "DIRECTION + MAZE + TIMER PASS: real carry facing, start forks, colour bar, per-activity expiry/retry, pause and untimed Free Play.",
  );
} finally {
  await browser.close();
}
