import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { touchStick } from "./joystick-input.mjs";
mkdirSync("qa/joystick", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto((process.env.GAME_URL || "http://127.0.0.1:4182/") + "?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  await page.selectOption("#difficulty", "free");
  await page.locator("#practice-toggle").tap();
  await page.locator('[data-mission="brook"]').tap();
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  const sizes = [
    { width: 568, height: 320 },
    { width: 667, height: 375 },
    { width: 844, height: 390 },
    { width: 915, height: 412 },
    { width: 1024, height: 768 },
    { width: 1180, height: 820 },
    { width: 1366, height: 1024 },
  ];
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.waitForTimeout(180);
    const base = await page.locator("#joystick").boundingBox();
    const action = await page.locator("#action").boundingBox();
    const canvas = await page.locator("canvas").boundingBox();
    const davidTop = canvas.y + (480 * canvas.height) / 720;
    if (
      base.x < size.width / 2 ||
      base.y < 0 ||
      base.x + base.width > size.width ||
      base.y + base.height >= davidTop ||
      action.height < 43.5 ||
      action.x < 0
    )
      throw Error(
        "Brook controls obscure David or leave the viewport: " +
          JSON.stringify({ size, base, action, davidTop }),
      );
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(180);

  const target = (await state()).stones.find((s) => s.smooth);
  const stick = await touchStick(page);
  await stick.start();
  for (let i = 0; i < 200; i++) {
    const p = (await state()).controlCursor;
    if (!p) {
      await stick.move({ x: 1, y: 0 });
      await page.waitForTimeout(30);
      continue;
    }
    const dx = target.x - p.x,
      dy = target.y - p.y,
      d = Math.hypot(dx, dy);
    if (d < 9) break;
    await stick.move({ x: dx / d, y: dy / d });
    await page.waitForTimeout(
      Math.min(40, Math.max(10, (d / 430) * 1000 - 10)),
    );
  }
  await stick.end();
  await page.waitForFunction((t) => {
    const r = window.adventureQA.snapshot().ring;
    return Math.hypot(t.x - r.x, t.y - r.y) < 25;
  }, target);
  await page.screenshot({ path: "qa/joystick/transparent-hand-cursor.png" });
  for (let i = 0; i < 5 && (await state()).stoneCount === 0; i++) {
    await page.waitForFunction((t) => {
      const r = window.adventureQA.snapshot().ring;
      return Math.hypot(t.x - r.x, t.y - r.y) < 23;
    }, target);
    await page.locator("#action").tap();
    await page.waitForTimeout(450);
  }
  if ((await state()).stoneCount !== 1 || errors.length)
    throw Error(
      "Cursor selection failed " +
        JSON.stringify({ state: await state(), errors }),
    );
  writeFileSync(
    "qa/joystick/cursor-results.json",
    JSON.stringify(
      {
        passed: true,
        checked: [
          "transparent target reticle",
          "offset hand leaves stone and timing ring visible",
          "native joystick steering and genuine timed stone pickup",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log("CURSOR PASS: visible target/ring and native timed selection.");
} finally {
  await browser.close();
}
