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
  const url = (process.env.GAME_URL || "http://localhost:5173/") + "?qa";
  await page.goto(url);
  await page.waitForSelector('#stage[data-ready="true"]');
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  await page.click("#practice-toggle");
  await page.locator("#journey-art").evaluate((img) => img.decode());
  if ((await state()).keepsakes.length)
    throw Error("Rewards granted before playing");
  async function within(selector) {
    const outer = await page.locator("#stage").boundingBox(),
      b = await page.locator(selector).boundingBox();
    if (
      !b ||
      b.x < outer.x - 1 ||
      b.y < outer.y - 1 ||
      b.x + b.width > outer.x + outer.width + 1 ||
      b.y + b.height > outer.y + outer.height + 1
    )
      throw Error(selector + " outside game");
  }
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(120);
    await within("#practice");
    for (const mission of ["sheep", "maze", "armor", "brook", "sling"])
      await within(`[data-mission="${mission}"]`);
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({ path: "qa/50-storybook-map.png" });
  await page.click("#music-toggle");
  if ((await state()).music) throw Error("Music toggle did not apply");
  await page.click("#music-toggle");
  if (!(await state()).music) throw Error("Music did not resume");
  await page.keyboard.press("Escape");
  await page.click("#narration");
  if ((await state()).narration) throw Error("Voice did not turn off");
  await page.click("#narration");
  if (!(await state()).narration) throw Error("Voice did not resume");
  await page.click("#practice-toggle");
  await page.click('[data-mission="maze"]');
  await within("#tutorial");
  await page.screenshot({ path: "qa/51-colourful-instructions.png" });
  await page.waitForTimeout(2700);
  let previous = 0;
  for (const next of (await state()).mazePath.slice(1)) {
    const dx = (next % 9) - (previous % 9),
      dy = Math.floor(next / 9) - Math.floor(previous / 9);
    await page.keyboard.press(
      dx
        ? dx > 0
          ? "ArrowRight"
          : "ArrowLeft"
        : dy > 0
          ? "ArrowDown"
          : "ArrowUp",
    );
    await page.waitForTimeout(230);
    previous = next;
  }
  await page.waitForFunction(() => {
    const s = window.adventureQA.snapshot();
    return s.phase === "success" && s.successTime >= 4;
  });
  await page.waitForFunction(() =>
    window.adventureQA.snapshot().keepsakes.includes("maze"),
  );
  if (!(await state()).keepsakes.includes("maze"))
    throw Error("Real completion did not earn keepsake");
  await page.screenshot({ path: "qa/52-chapter-celebration.png" });
  await page.click("#continue");
  await page.click("#book-toggle");
  if (
    !(await page
      .locator('[data-mission="maze"]')
      .evaluate((e) => e.classList.contains("earned")))
  )
    throw Error("Earned chapter not marked");
  await page.screenshot({ path: "qa/53-keepsake-book.png" });
  await page.reload();
  await page.waitForSelector('#stage[data-ready="true"]');
  if (!(await state()).keepsakes.includes("maze"))
    throw Error("Keepsake did not persist");
  await page.click("#start");
  await page.waitForTimeout(2700);
  if ((await state()).sheepTimeLimit !== 30)
    throw Error("Rescue does not start with 30 seconds");
  await page.click("#book-toggle");
  const before = (await state()).sheepRemaining;
  await page.waitForTimeout(500);
  if ((await state()).sheepRemaining !== before)
    throw Error("Book did not pause countdown");
  await page.keyboard.press("Escape");
  if ((await state()).paused) throw Error("Closing book did not resume");
  await page.click("#help");
  await page.click("#modal-actions button:nth-child(2)");
  if (
    !(await page.locator("#modal-content").textContent()).includes(
      "Child playtesting has not yet been conducted",
    )
  )
    throw Error("Child playtest status unclear");
  await page.screenshot({ path: "qa/54-playtest-guide.png" });
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/premium-results.json",
    JSON.stringify(
      {
        checks: [
          "illustrated map and chapter bounds at 3 viewports",
          "no unearned rewards",
          "music and local narration controls",
          "colourful instruction bounds",
          "real maze completion earns reward",
          "keepsake persists across reload",
          "30-second timer",
          "book pauses and resumes countdown",
          "honest child-playtest guide",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "PREMIUM PASS: map, actual earned keepsake, persistence, audio controls, colourful instructions, book pause, playtest guide.",
  );
} finally {
  await browser.close();
}
