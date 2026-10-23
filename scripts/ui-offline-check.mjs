import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
let errors = [];
let requests = [];
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  hasTouch: true,
  offline: true,
});
const html = readFileSync("dist/index.html", "utf8");
await context.route("http://offline-game.test/**", (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path === "/manifest.webmanifest")
    return route.fulfill({
      status: 200,
      contentType: "application/manifest+json",
      body: readFileSync("dist/manifest.webmanifest"),
    });
  if (/^\/icons\/[a-z0-9-]+\.png$/.test(path))
    return route.fulfill({
      status: 200,
      contentType: "image/png",
      body: readFileSync("dist" + path),
    });
  return route.fulfill({ status: 200, contentType: "text/html", body: html });
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (
    r.resourceType() !== "document" &&
    !/\/(manifest\.webmanifest|icons\/[a-z0-9-]+\.png)$/.test(
      new URL(r.url()).pathname,
    )
  )
    requests.push(r.url());
});
await page.goto("http://offline-game.test/?qa");
await page.waitForSelector('#stage[data-ready="true"]');
await page.waitForSelector("canvas");
await page.evaluate(() => document.fonts.ready);
if (
  !(await page.evaluate(
    () =>
      document.fonts.check('850 18px "Adventure Nunito"') &&
      document.fonts.check('750 18px "Adventure Arabic"', "مغامرة"),
  ))
)
  throw Error("Bilingual UI fonts unavailable offline");
const loadedFaces = await page.evaluate(() =>
  Array.from(document.fonts)
    .filter(
      (face) =>
        face.family.includes("Adventure Nunito") ||
        face.family.includes("Adventure Arabic"),
    )
    .map((face) => ({ family: face.family, status: face.status })),
);
if (
  loadedFaces.length !== 2 ||
  loadedFaces.some((face) => face.status !== "loaded")
)
  throw Error("Bundled font faces did not load offline");
const state = () => page.evaluate(() => window.adventureQA.snapshot());
await page.click("#start");
await page.waitForTimeout(100);
if ((await state()).audioState !== "running")
  throw Error("Audio did not unlock");
await page.click("#sound");
await page.waitForTimeout(150);
if (!(await state()).muted || (await state()).audioState !== "suspended")
  throw Error("Audio mute failed");
await page.click("#restart");
await page.click("#modal-actions button:nth-child(2)");
await page.click("#practice-toggle");
await page.click('[data-mission="armor"]');
await page.waitForTimeout(2700);
for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1024, height: 768 },
]) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(200);
  const box = await page.locator("#stage").boundingBox();
  const p = (x, y) => [
    box.x + (x * box.width) / 1280,
    box.y + (y * box.height) / 720,
  ];
  await page.touchscreen.tap(...p(220, 482));
  await page.touchscreen.tap(...p(650, 227));
  if (!(await state()).equipped.includes("helmet"))
    throw Error("Scaled touch anchor failed");
  await page.screenshot({ path: `qa/32-touch-${viewport.width}.png` });
  await page.click("#pause");
  await page.click("#modal-actions button:nth-child(2)");
}
await page.setViewportSize({ width: 1280, height: 720 });
await page.click("#language");
if ((await state()).language !== "en") throw Error("EN toggle");
await page.screenshot({ path: "qa/33-english.png" });
await page.click("#language");
if ((await state()).language !== "ar") throw Error("AR toggle");
await page.screenshot({ path: "qa/34-arabic.png" });
await page.click("#restart");
await page.click("#modal-actions button:nth-child(2)");
await page.click("#practice-toggle");
await page.click('[data-mission="sling"]');
await page.keyboard.down("Space");
await page.waitForTimeout(400);
await page.evaluate(() => window.dispatchEvent(new Event("blur")));
await page.keyboard.up("Space");
if (
  !(await state()).paused ||
  (await state()).charge !== 0 ||
  (await state()).shot !== "ready"
)
  throw Error("Focus loss failed to cancel charge");
await page.click("#modal-actions button:first-child");
await page.mouse.move(160, 680);
await page.mouse.down();
await page.waitForTimeout(1000);
await page.mouse.move(400, 600);
await page.mouse.up();
await page.waitForFunction(
  () => ["hit", "miss"].includes(window.adventureQA.snapshot().shot),
  undefined,
  { timeout: 10000 },
);
if ((await state()).shot !== "hit")
  throw Error(
    "Pointer hold/release capture failed: " + JSON.stringify(await state()),
  );
if (errors.length || requests.length)
  throw Error(JSON.stringify({ errors, requests }));
console.log(
  "UI + OFFLINE PASS: production HTML runs with networking disabled and no external gameplay-asset requests; 1920/1024 scaled touch, EN/AR, sound unlock/mute, focus cancel, pointer release outside.",
);
await browser.close();
