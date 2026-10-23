import { touchStick } from "./joystick-input.mjs";
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
mkdirSync("qa/pages", { recursive: true });
import { distServer } from "./dist-server.mjs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
let broken = true,
  updated = false;
const server = distServer({
  directory: "pages-dist",
  prefix: "/adventure/",
  transform: (path, bytes) =>
    path === "sw.js" && updated
      ? bytes
          .toString()
          .replace(
            /const VERSION\s*=\s*(['"])(.*?)\1/,
            "const VERSION='qa-update'",
          )
      : bytes,
  fail: (path) => broken && path === "icons/icon-192.png",
});
await new Promise((resolve) =>
  server.listen(Number(process.env.PAGES_PORT || 4188), "127.0.0.1", resolve),
);
const url = `http://127.0.0.1:${process.env.PAGES_PORT || 4188}/adventure/`;
try {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  let page = await context.newPage();
  const tap = async (selector) => {
    const b = await page.locator(selector).boundingBox();
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  };
  const errors = [];
  const externalRequests = [];
  context.on("request", (req) => {
    if (
      new URL(req.url()).protocol.startsWith("http") &&
      !req.url().startsWith(new URL(url).origin + "/")
    )
      externalRequests.push(req.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url + "?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  if (
    (await page.evaluate(() => window.adventureQA.snapshot().pwaState)) !==
    "available"
  )
    throw Error("Hosted offline saving must be optional");
  if (
    await page.evaluate(
      async () =>
        (await navigator.serviceWorker.getRegistrations()).length ||
        (await caches.keys()).length,
    )
  )
    throw Error("Offline copy was downloaded without consent");
  await tap("#book-toggle");
  await page.screenshot({ path: "qa/pages/optional-offline.png" });
  await tap("#offline-retry");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().pwaState === "failed",
    {},
    { timeout: 30000 },
  );
  if (
    (await page.locator("#pwa-status").textContent()).includes("Offline ready")
  )
    throw Error("Partial cache advertised as ready");
  broken = false;
  await tap("#offline-retry");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().pwaState === "ready",
    {},
    { timeout: 45000 },
  );
  await page.screenshot({ path: "qa/pages/offline-ready.png" });
  const manifest = JSON.parse(
    readFileSync("pages-dist/manifest.webmanifest", "utf8"),
  );
  if (
    manifest.orientation !== "landscape" ||
    manifest.display !== "standalone" ||
    manifest.start_url !== "./" ||
    !manifest.icons.some((i) => i.purpose === "maskable")
  )
    throw Error("Manifest incomplete");
  const cache = await page.evaluate(async () => {
    const keys = (await caches.keys()).filter((k) =>
      k.startsWith("davids-pages:"),
    );
    const c = await caches.open(keys[0]);
    return { keys, urls: (await c.keys()).map((r) => r.url) };
  });
  if (
    cache.urls.length !==
      JSON.parse(readFileSync("pages-dist/build-report.json")).precachedFiles ||
    !cache.urls.every((u) => u.startsWith(locationPrefix()))
  )
    throw Error("Missing cached shell or wrong deployment scope");
  function locationPrefix() {
    return url;
  }
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('#stage[data-ready="true"]');
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller)))
    throw Error("Offline document not controlled");
  await tap("#practice-toggle");
  await tap('[data-mission="maze"]');
  await page.waitForTimeout(2700);
  const stick = await touchStick(page);
  let previous = 0;
  for (const next of await page.evaluate(() =>
    window.adventureQA.snapshot().mazePath.slice(1),
  )) {
    const dx = (next % 9) - (previous % 9),
      dy = Math.floor(next / 9) - Math.floor(previous / 9);
    await stick.steer({ x: dx, y: dy }, 50);
    await page.waitForTimeout(240);
    previous = next;
  }
  await page.waitForFunction(() => {
    const s = window.adventureQA.snapshot();
    return s.phase === "success" && s.successTime >= 4;
  });
  await page.screenshot({ path: "qa/pages/cached-offline-play.png" });
  await page.close();
  const reopened = (page = await context.newPage());
  await reopened.goto(url + "?qa");
  await reopened.waitForSelector('#stage[data-ready="true"]');
  if (
    !(await reopened.evaluate(() =>
      window.adventureQA.snapshot().keepsakes.includes("maze"),
    ))
  )
    throw Error("Offline progress did not persist across a new tab");
  await context.setOffline(false);
  await tap("#practice-toggle");
  await tap('[data-mission="maze"]');
  updated = true;
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    await reg.update();
  });
  await page.waitForFunction(
    async () => !!(await navigator.serviceWorker.getRegistration()).waiting,
  );
  if (
    (await page.evaluate(() => window.adventureQA.snapshot().phase)) !== "play"
  )
    throw Error("Update interrupted gameplay");
  await tap("#book-toggle");
  await page.waitForSelector("#pwa-update:not([hidden])");
  await tap("#pwa-update");
  await tap("#modal-actions button:nth-child(2)");
  await page.waitForFunction(
    () => window.adventureQA?.snapshot().phase === "title",
  );
  await page.waitForFunction(
    () => window.adventureQA.snapshot().pwaState === "ready",
  );
  const versions = await page.evaluate(() => caches.keys());
  if (
    !versions.some((k) => k.endsWith(":qa-update")) ||
    versions.filter((k) => k.startsWith("davids-pages:")).length !== 1
  )
    throw Error("Update activation did not clean old game caches");
  if (
    !(await page.evaluate(() =>
      window.adventureQA.snapshot().keepsakes.includes("maze"),
    ))
  )
    throw Error("Update lost keepsake");
  if (externalRequests.length)
    throw Error("External runtime requests: " + externalRequests.join(", "));
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/pages/pwa-results.json",
    JSON.stringify(
      {
        scope: "/adventure/",
        cachedAssets: cache.urls.length,
        checks: [
          "no offline cache or worker until explicit opt-in",
          "secure-context registration",
          "failed required asset does not claim readiness",
          "manual retry completes cache",
          "manifest and maskable install icons",
          "subdirectory deployment",
          "reload offline from actual service worker",
          "real offline maze completion",
          "new tab offline launch",
          "offline keepsake persistence",
          "update waits without interrupting play",
          "explicit update reload and old-cache cleanup",
          "keepsake survives app update",
        ],
        externalRequests,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "PWA PASS: partial-cache failure and retry, install manifest, scoped cache, real offline play and offline relaunch.",
  );
  await context.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
