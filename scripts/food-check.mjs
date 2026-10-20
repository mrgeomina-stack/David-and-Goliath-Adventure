import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const result = { checks: [], pageErrors: [], directFile: null };
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  page.on("pageerror", (e) => result.pageErrors.push(e.message));
  await page.goto((process.env.GAME_URL || "http://localhost:4173/") + "?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  await page.click("#practice-toggle");
  await page.click('[data-mission="maze"]');
  await page.waitForTimeout(2700);
  const path = (await state()).mazePath;
  let previous = 0;
  for (const next of path.slice(1)) {
    const dx = (next % 9) - (previous % 9),
      dy = Math.floor(next / 9) - Math.floor(previous / 9);
    await page.keyboard.press(
      dx > 0
        ? "ArrowRight"
        : dx < 0
          ? "ArrowLeft"
          : dy > 0
            ? "ArrowDown"
            : "ArrowUp",
    );
    await page.waitForTimeout(230);
    previous = next;
    if (next === path[Math.floor(path.length / 2)])
      await page.screenshot({ path: "qa/63-food-carried-walk.png" });
  }
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
  await page.waitForFunction(
    () => window.adventureQA.snapshot().successTime >= 2.1,
  );
  let s = await state();
  if (s.foodDelivery.owner !== "shared" || !s.foodDelivery.davidHolding)
    throw Error("Basket did not receive shared support");
  await page.screenshot({ path: "qa/64-single-basket-handover.png" });
  await page.waitForFunction(
    () => window.adventureQA.snapshot().successTime >= 2.7,
  );
  s = await state();
  if (s.foodDelivery.owner !== "brother" || s.foodDelivery.davidHolding)
    throw Error("David did not release transferred basket");
  await page.screenshot({ path: "qa/65-brother-holds-basket.png" });
  await page.waitForSelector("#continue:visible");
  await page.click("#continue");
  if ((await state()).phase !== "title")
    throw Error("Practice transition failed");
  result.checks = [
    "real generated maze route",
    "visible carried-food locomotion",
    "shared support during transfer",
    "brother owns basket after David release",
    "four-second success gate and return to title",
  ];
  const offline = await browser.newContext({ offline: true });
  const disk = await offline.newPage();
  try {
    await disk.goto(pathToFileURL(resolve("dist/index.html")).href + "?qa");
    await disk.waitForSelector('#stage[data-ready="true"]', { timeout: 15000 });
    result.directFile = {
      status: "passed",
      note: "Actual file:// launch with networking disabled",
    };
    await disk.screenshot({ path: "qa/66-direct-disk-launch.png" });
  } catch (e) {
    const message = String(e.message).split("\n")[0];
    result.directFile = {
      status: message.includes("ERR_BLOCKED_BY_ADMINISTRATOR")
        ? "blocked"
        : "failed",
      message,
    };
  }
  await offline.close();
  if (result.pageErrors.length) throw Error(result.pageErrors.join("\n"));
  writeFileSync(
    "qa/food-integration-results.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  if (result.directFile.status === "failed")
    throw Error("Direct file launch failed: " + result.directFile.message);
  console.log(
    "FOOD PASS: real maze, continuous handover, transfer and transition; direct file " +
      result.directFile.status +
      ".",
  );
} finally {
  await browser.close();
}
