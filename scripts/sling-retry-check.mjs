import { chromium } from "@playwright/test";
import { distServer } from "./dist-server.mjs";
import { touchStick } from "./joystick-input.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
const folder = "qa/sling-retry";
mkdirSync(folder, { recursive: true });
const server = distServer({ directory: "pages-dist" });
await new Promise((r) => server.listen(4199, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
try {
  for (const touch of [false, true]) {
    const page = await browser.newPage({
      viewport: touch
        ? { width: 844, height: 390 }
        : { width: 1280, height: 720 },
      hasTouch: touch,
      isMobile: touch,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:4199/?qa");
    await page.waitForSelector('#stage[data-ready="true"]');
    await page.selectOption("#difficulty", "normal");
    await page.click("#practice-toggle");
    await page.click('[data-mission="sling"]');
    await page.waitForTimeout(2700);
    const state = () => page.evaluate(() => window.adventureQA.snapshot());
    const stick = touch ? await touchStick(page) : null;
    async function shoot(ms) {
      if (touch) await stick.start({ x: 1, y: 0 });
      else await page.keyboard.down("Space");
      await page.waitForTimeout(ms);
      if (touch) await stick.end();
      else await page.keyboard.up("Space");
    }
    for (const [index, ms] of [10, 2100, 10].entries()) {
      await shoot(ms);
      await page.waitForFunction(
        (n) => window.adventureQA.snapshot().missedThrows === n,
        index + 1,
      );
      const s = await state();
      if (
        s.failed ||
        s.phase !== "play" ||
        s.audioEvents.giantLaugh !== index + 1 ||
        s.audioEvents.impact ||
        s.audioEvents.complete
      )
        throw Error("Miss feedback wrong " + JSON.stringify(s.audioEvents));
      if (await page.locator("#message").isVisible())
        throw Error("Miss opened retry popup");
      if (index === 0) {
        await page.click("#pause");
        const frozen = await state();
        await page.waitForTimeout(500);
        if ((await state()).missTime !== frozen.missTime)
          throw Error("Taunt advanced while paused");
        await page.click("#modal-actions button:first-child");
      }
      if (index === 1)
        await page.screenshot({
          path: `${folder}/${touch ? "phone" : "desktop"}-laugh.png`,
        });
      await page.waitForFunction(
        () => window.adventureQA.snapshot().shot === "ready",
      );
      if ((await state()).charge !== 0) throw Error("Charge did not reset");
    }
    if (!touch) {
      await page.waitForTimeout(31000);
      const s = await state();
      if (
        s.failed ||
        s.phase !== "play" ||
        s.activityRemaining !== null ||
        (await page.locator("#message").isVisible())
      )
        throw Error("Final stage expired");
    }
    await page.screenshot({
      path: `${folder}/${touch ? "phone" : "desktop"}-ready.png`,
    });
    await shoot(990);
    await page.waitForFunction(
      () => window.adventureQA.snapshot().shot === "hit",
    );
    await page.waitForFunction(
      () => window.adventureQA.snapshot().successTime >= 2.1,
    );
    const won = await state();
    if (
      won.audioEvents.impact !== 1 ||
      won.audioEvents.complete !== 1 ||
      won.audioEvents.giantLaugh !== 3
    )
      throw Error("Win sounds wrong");
    await page.screenshot({
      path: `${folder}/${touch ? "phone" : "desktop"}-face-down.png`,
    });
    await page.waitForSelector("#continue:visible");
    await page.click("#continue");
    if ((await state()).phase !== "victory")
      throw Error("Victory transition missing");
    if (errors.length) throw Error(errors.join("\n"));
    results.push({
      touch,
      misses: 3,
      laughs: won.audioEvents.giantLaugh,
      autoReady: true,
      noRetryPopup: true,
      untimedNormal: true,
      pausedTaunt: true,
      genuineHitWins: true,
      impact: won.audioEvents.impact,
      victory: won.audioEvents.complete,
      errors,
    });
    await page.close();
  }
  writeFileSync(
    `${folder}/results.json`,
    JSON.stringify({ passed: true, results }, null, 2),
  );
  console.log(JSON.stringify({ passed: true, results }));
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
