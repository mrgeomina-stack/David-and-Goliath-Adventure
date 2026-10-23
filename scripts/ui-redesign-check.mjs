import { chromium } from "@playwright/test";
import { distServer } from "./dist-server.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
const phase = process.env.CAPTURE_PHASE || "after";
const directory = `qa/ui-redesign/${phase}`;
mkdirSync(directory, { recursive: true });
const server = distServer();
await new Promise((r) => server.listen(4211, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:4211/?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  await page.evaluate(() => document.fonts.ready);
  const capture = (name) =>
    page.screenshot({
      path: `${directory}/${name}.png`,
      animations: "disabled",
    });
  await capture("home");
  if (phase === "after") {
    const fonts = await page.evaluate(
      () =>
        document.fonts.check('850 18px "Adventure Nunito"') &&
        document.fonts.check('750 18px "Adventure Arabic"', "مغامرة"),
    );
    if (!fonts) throw Error("Bundled bilingual fonts not ready");
    await page.locator("#start").hover();
    await capture("home-hover");
    for (
      let i = 0;
      i < 20 &&
      (await page.evaluate(() => document.activeElement?.id)) !== "start";
      i++
    )
      await page.keyboard.press("Tab");
    await capture("home-focus");
  }
  await page.click("#practice-toggle");
  await capture("missions");
  await page.click("#map-close");
  await page.click("#start");
  await capture("instruction");
  await page.click("#pause");
  await capture("pause");
  await page.click("#modal-actions button:first-child");
  await page.click("#help");
  await capture("teacher");
  if (phase === "after") {
    await page.locator("#modal-content").hover();
    await page.mouse.wheel(0, 850);
    await page.waitForTimeout(150);
    if (
      (await page.locator("#modal-content").evaluate((e) => e.scrollTop)) <= 0
    )
      throw Error("Teacher text cannot scroll");
    await capture("teacher-scrolled");
  }
  await page.click("#modal-actions button:first-child");
  if (phase === "after") {
    for (const viewport of [
      { width: 568, height: 320 },
      { width: 844, height: 390 },
      { width: 1024, height: 768 },
      { width: 1180, height: 820 },
    ]) {
      await page.setViewportSize(viewport);
      for (const language of ["en", "ar"]) {
        while (
          (await page.evaluate(() => window.adventureQA.snapshot()))
            .language !== language
        )
          await page.click("#language");
        await page.click("#pause");
        const panel = await page.locator("#modal").boundingBox();
        if (
          !panel ||
          panel.x < -1 ||
          panel.y < -1 ||
          panel.x + panel.width > viewport.width + 1 ||
          panel.y + panel.height > viewport.height + 1
        )
          throw Error(
            "Popup outside viewport " +
              JSON.stringify({ viewport, language, panel }),
          );
        const footer = await page.locator("#modal-actions").boundingBox();
        if (!footer || footer.y + footer.height > panel.y + panel.height + 1)
          throw Error("Popup actions clipped");
        await page.screenshot({
          path: `${directory}/pause-${viewport.width}-${language}.png`,
        });
        await page.click("#modal-actions button:first-child");
      }
    }
  }
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    `${directory}/results.json`,
    JSON.stringify(
      {
        phase,
        screens: ["home", "missions", "instruction", "pause", "teacher"],
        errors,
      },
      null,
      2,
    ),
  );
  console.log("UI screenshots and bounds PASS:", phase);
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
