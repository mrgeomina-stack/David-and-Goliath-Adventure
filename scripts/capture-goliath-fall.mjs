/** Record the real game without screenshot interruptions; observe, never mutate, QA state. */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, createReadStream } from "node:fs";
import { createServer } from "node:http";
import { bootOfflineBuild } from "./offline-build.mjs";
const before = process.argv.includes("--before"),
  label = before ? "before" : "after";
const folder = `qa/goliath-fall/${label}/recording`;
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    serviceWorkers: "block",
    recordVideo: { dir: folder, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  if (before) {
    const server = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      createReadStream("/tmp/goliath-fall-baseline.html").pipe(res);
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    await page.goto(`http://127.0.0.1:${server.address().port}/?qa`);
    await page.waitForSelector('#stage[data-ready="true"]');
    await page.evaluate(() => document.fonts.ready);
    await context.setOffline(true);
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  } else await bootOfflineBuild(page, context);
  await page.click("#practice-toggle");
  await page.click('[data-mission="sling"]');
  await page.waitForTimeout(2700);
  const recording = page.evaluate(
    () =>
      new Promise((resolve) => {
        const frames = [];
        function observe() {
          const s = window.adventureQA.snapshot();
          if (s.phase === "success")
            frames.push({ now: performance.now(), t: s.successTime });
          if (s.phase === "success" && s.successTime >= 2.8) resolve(frames);
          else requestAnimationFrame(observe);
        }
        requestAnimationFrame(observe);
      }),
  );
  await page.keyboard.down("Space");
  await page.waitForTimeout(1000);
  await page.keyboard.up("Space");
  const frames = await recording;
  const s = await page.evaluate(() => window.adventureQA.snapshot());
  if (
    s.shot !== "hit" ||
    s.audioEvents.impact !== 1 ||
    s.audioEvents.complete !== 1 ||
    errors.length
  )
    throw Error("Recording failed: " + JSON.stringify({ s, errors }));
  const video = page.video();
  await context.close();
  writeFileSync(
    `${folder}/result.json`,
    JSON.stringify(
      {
        label,
        offline: true,
        video: await video.path(),
        frames,
        audio: s.audioEvents,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(label + " uninterrupted actual-game recording passed.");
} finally {
  await browser.close();
}
