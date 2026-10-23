import { touchStick } from "./joystick-input.mjs";
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { bootOfflineBuild } from "./offline-build.mjs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1180, height: 820 },
    hasTouch: true,
    serviceWorkers: "block",
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    if (window.speechSynthesis) speechSynthesis.getVoices = () => [];
  });
  await bootOfflineBuild(page, context);
  await page.waitForSelector('#stage[data-ready="true"]');
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  const stick = await touchStick(page);
  // First landing gesture can be anywhere; audio must not need a mission start.
  await page.locator(".brand").click();
  await page.waitForFunction(
    () => window.adventureQA.snapshot().musicState.started,
  );
  let s = await state();
  if (
    s.phase !== "title" ||
    s.audioEvents.background !== 1 ||
    !s.musicState.loop ||
    s.musicState.targetGain !== 0.14 ||
    s.audioEvents.pop
  )
    throw Error("Landing music not initialized quietly on first gesture");
  if (Math.abs(s.sampleDurations.background - 58.044) > 0.1)
    throw Error("Wrong background recording decoded");
  async function click(selector, method = "mouse") {
    const before = (await state()).audioEvents.pop || 0;
    if (method === "touch") {
      const b = await page.locator(selector).boundingBox();
      await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
    } else if (method === "keyboard") {
      await page.locator(selector).focus();
      await page.keyboard.press("Enter");
    } else await page.click(selector);
    const after = (await state()).audioEvents.pop || 0;
    if (after !== before + 1)
      throw Error(
        `Expected exactly one ${method} pop for ${selector}: ${before} -> ${after}`,
      );
  }
  await click("#practice-toggle");
  await click("#music-toggle");
  if ((await state()).musicState.targetGain !== 0)
    throw Error("Music toggle failed");
  await click("#music-toggle", "keyboard");
  if ((await state()).musicState.targetGain !== 0.14)
    throw Error("Music did not restore");
  await click("#map-close", "touch");
  await page.selectOption("#difficulty", "free");
  await click("#start");
  await page.waitForTimeout(2700);
  await stick.steer({ x: 1, y: 0 }, 45);
  await click("#action", "touch");
  await click("#pause");
  if ((await state()).audioState !== "suspended")
    throw Error("Pause did not stop game audio");
  await click("#modal-actions button:first-child", "touch");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioState === "running",
  );
  await click("#help");
  await click("#modal-actions button:first-child");
  // Muted buttons must not emit pops, and gameplay music must remain muted.
  await click("#sound");
  let muted = (await state()).audioEvents.pop;
  await page.click("#language");
  s = await state();
  if (
    !s.muted ||
    s.audioEvents.pop !== muted ||
    s.musicState.targetGain !== 0 ||
    s.audioState !== "suspended"
  )
    throw Error("Global mute did not suppress all audio");
  await page.click("#sound");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioState === "running",
  );
  await click("#book-toggle");
  await click('[data-mission="armor"]', "touch");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().audioEvents.voice >= 1,
  );
  s = await state();
  if (s.musicState.targetGain !== 0.035 || !s.musicState.guidance)
    throw Error("Bundled guidance did not duck music");
  await click("#narration");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().musicState.targetGain === 0.14,
  );
  // Disabled visible buttons are silent even when receiving a physical pointer press.
  await page.evaluate(() => {
    const b = document.createElement("button");
    b.id = "disabled-audio-probe";
    b.disabled = true;
    b.textContent = "Disabled";
    b.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:99999";
    document.body.append(b);
  });
  const d = await page.locator("#disabled-audio-probe").boundingBox(),
    count = (await state()).audioEvents.pop;
  await page.mouse.click(d.x + d.width / 2, d.y + d.height / 2);
  if ((await state()).audioEvents.pop !== count)
    throw Error("Disabled button popped");
  await page.evaluate(() =>
    document.querySelector("#disabled-audio-probe").remove(),
  );
  await page.setViewportSize({ width: 844, height: 390 });
  await click("#language", "touch");
  s = await state();
  if (s.audioEvents.background !== 1 || !s.musicState.loop)
    throw Error("Music duplicated or restarted");
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/music-ui-1.9.2.json",
    JSON.stringify(
      {
        passed: true,
        serviceWorkers: "block",
        music: s.musicState,
        audio: s.audioEvents,
        checks: [
          "landing first gesture",
          "correct supplied recording",
          "quiet loop",
          "music toggle",
          "mouse touch keyboard pop exactly once",
          "held controls",
          "paused menus",
          "global mute",
          "guidance duck and restore",
          "disabled button silent",
          "phone landscape",
          "no duplicate music sources",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "MUSIC + UI PASS: offline landing track, quiet persistent loop, ducking, controls, menu/touch/keyboard pops, no duplicate clicks, mute and disabled buttons.",
  );
} finally {
  await browser.close();
}
