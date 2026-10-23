import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { bootOfflineBuild } from "./offline-build.mjs";
const phone = process.argv.includes("--phone");
const label = phone
  ? "phone"
  : process.argv.includes("--before")
    ? "before"
    : "after";
const folder = `qa/goliath-fall/${label}`;
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: phone
      ? { width: 844, height: 390 }
      : { width: 1280, height: 720 },
    hasTouch: true,
    serviceWorkers: "block",
    ...(phone
      ? {}
      : { recordVideo: { dir: folder, size: { width: 1280, height: 720 } } }),
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await bootOfflineBuild(page, context);
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  await page.click("#practice-toggle");
  await page.click('[data-mission="sling"]');
  await page.waitForTimeout(2700);
  if (phone) {
    const b = await page.locator("#action").boundingBox();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        {
          x: b.x + b.width / 2,
          y: b.y + b.height / 2,
          id: 0,
          radiusX: 9,
          radiusY: 9,
          force: 1,
        },
      ],
    });
    await page.waitForTimeout(1000);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  } else {
    await page.keyboard.down("Space");
    await page.waitForTimeout(1000);
    await page.keyboard.up("Space");
  }
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
  if (phone) {
    await page.waitForFunction(
      () => window.adventureQA.snapshot().successTime >= 0.32,
    );
    await page.keyboard.press("Escape");
    const frozen = await state();
    if (!frozen.paused || frozen.successTime >= 0.86)
      throw Error("Did not pause within dizzy phase");
    await page.waitForTimeout(500);
    const held = await state();
    if (held.successTime !== frozen.successTime || held.audioEvents.impact)
      throw Error("Dizzy pause advanced animation or impact");
    await page.screenshot({ path: `${folder}/paused-dizzy.png` });
    await page.click("#modal-actions button:first-child");
    await page.waitForFunction(
      () => window.adventureQA.snapshot().successTime >= 2,
    );
    await page.screenshot({ path: `${folder}/face-down.png` });
    const result = await state();
    if (result.audioEvents.impact !== 1 || result.audioEvents.complete !== 1)
      throw Error("Phone impact/victory not once");
    await page.waitForSelector("#continue:visible");
    await page.click("#continue");
    if ((await state()).phase !== "victory")
      throw Error("Phone victory changed");
    if (errors.length) throw Error(errors.join("\n"));
    writeFileSync(
      `${folder}/result.json`,
      JSON.stringify(
        {
          offline: true,
          realTouchHold: true,
          pausedAt: frozen.successTime,
          heldSeconds: 0.5,
          impact: result.audioEvents.impact,
          completion: result.audioEvents.complete,
          errors,
        },
        null,
        2,
      ),
    );
    await context.close();
    console.log(
      "GOLIATH PHONE PASS: native touch hold/release, dizzy pause/resume, face-down hold, one impact/one victory; offline.",
    );
  } else {
    const frames = [];
    for (const at of [
      0.08, 0.25, 0.42, 0.62, 0.82, 1.02, 1.22, 1.42, 1.64, 1.9, 2.35, 2.85,
    ]) {
      await page.waitForFunction(
        (at) => window.adventureQA.snapshot().successTime >= at,
        at,
      );
      const s = await state();
      await page.screenshot({
        path: `${folder}/${String(frames.length).padStart(2, "0")}.png`,
      });
      frames.push({
        at: s.successTime,
        shot: s.shot,
        impact: s.audioEvents.impact || 0,
        completion: s.audioEvents.complete || 0,
      });
    }
    const s = await state();
    if (
      s.shot !== "hit" ||
      s.audioEvents.impact !== 1 ||
      s.audioEvents.complete !== 1 ||
      s.audioEvents.launch !== 1
    )
      throw Error(
        "Hit/audio sequence changed: " + JSON.stringify(s.audioEvents),
      );
    if (label === "after") {
      if (frames.find((f) => f.at >= 1.02).impact !== 0)
        throw Error("Ground impact played before the forward landing");
      await page.click("#continue");
      if ((await state()).phase !== "victory")
        throw Error("Existing victory transition changed");
    }
    if (errors.length) throw Error(errors.join("\n"));
    await page.waitForTimeout(200);
    const video = page.video();
    await context.close();
    writeFileSync(
      `${folder}/result.json`,
      JSON.stringify(
        {
          label,
          offline: true,
          frames,
          audio: s.audioEvents,
          video: await video.path(),
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      "GOLIATH " +
        label.toUpperCase() +
        " PASS: genuine hit, recorded full defeat, one impact/one victory; offline.",
    );
  }
} finally {
  await browser.close();
}
