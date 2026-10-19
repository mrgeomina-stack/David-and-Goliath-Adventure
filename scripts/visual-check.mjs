import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  async function bounds() {
    const stage = await page.locator("#stage").boundingBox();
    for (const id of ["start", "practice-toggle", "difficulty"]) {
      const b = await page.locator("#" + id).boundingBox();
      if (
        !b ||
        b.x < stage.x ||
        b.y < stage.y ||
        b.x + b.width > stage.x + stage.width ||
        b.y + b.height > stage.y + stage.height
      )
        throw Error(id + " clipped");
    }
  }
  await bounds();
  await page.click("#language");
  await page.waitForTimeout(150);
  await bounds();
  await page.screenshot({ path: "qa/36-title-english.png" });
  await page.click("#language");
  await page.waitForTimeout(150);
  await bounds();
  await page.screenshot({ path: "qa/37-title-arabic.png" });
  await page.click("#language");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(200);
  await bounds();
  await page.screenshot({ path: "qa/38-title-1920.png" });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(200);
  await bounds();
  await page.screenshot({ path: "qa/39-title-tablet.png" });
  await page.click("#practice-toggle");
  await page.click('[data-mission="maze"]');
  await page.waitForTimeout(2700);
  await page.screenshot({ path: "qa/40-maze-tablet.png" });
  const route = (await state()).mazePath;
  let previous = 0;
  for (let i = 1; i < route.length; i++) {
    const next = route[i],
      dx = (next % 9) - (previous % 9),
      dy = Math.floor(next / 9) - Math.floor(previous / 9);
    const button = page.locator(`[data-dir="${dx},${dy}"]`);
    const b = await button.boundingBox();
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForTimeout(230);
    if ((await state()).cell !== next)
      throw Error("Brief scaled touch failed at step " + i);
    previous = next;
  }
  await page.waitForTimeout(1400);
  await page.screenshot({ path: "qa/41-delivery-tablet.png" });
  await page.waitForTimeout(2800);
  if ((await state()).phase !== "success")
    throw Error("Touch route did not finish");
  await page.click("#continue");
  if ((await state()).phase !== "title")
    throw Error("Practice did not return safely");
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.click("#practice-toggle");
  await page.click('[data-mission="maze"]');
  await page.waitForTimeout(2700);
  const frames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let first = 0,
          last = 0,
          n = 0;
        function sample(t) {
          if (!first) first = t;
          last = t;
          if (++n < 120) requestAnimationFrame(sample);
          else
            resolve({
              frames: n,
              seconds: (last - first) / 1000,
              estimatedFps: ((n - 1) * 1000) / (last - first),
            });
        }
        requestAnimationFrame(sample);
      }),
  );
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/visual-results.json",
    JSON.stringify(
      {
        checks:
          "Title layouts in EN/AR, 1920 and tablet; actual full maze route via brief scaled touchscreen taps; cinematic and replay",
        frames,
        errors,
      },
      null,
      2,
    ),
  );
  console.log("VISUAL + TOUCH PASS:", JSON.stringify(frames));
} finally {
  await browser.close();
}
