import { touchStick } from "./joystick-input.mjs";
import { collectWithRing } from "./brook-input.mjs";
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  const stick = await touchStick(page);
  await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  const tap = async (selector) => {
    const b = await page.locator(selector).boundingBox();
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  };
  const cdp = await page.context().newCDPSession(page);
  const center = async (selector) => {
    const b = await page.locator(selector).boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const dispatch = async (type, points) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((p, i) => ({
        ...p,
        id: p.id ?? i,
        radiusX: 9,
        radiusY: 9,
        force: 1,
      })),
    });
  const drag = async (a, b, cancel = false) => {
    await dispatch("touchStart", [a]);
    for (let i = 1; i <= 8; i++) {
      await dispatch("touchMove", [
        { x: a.x + ((b.x - a.x) * i) / 8, y: a.y + ((b.y - a.y) * i) / 8 },
      ]);
      await page.waitForTimeout(18);
    }
    await dispatch(cancel ? "touchCancel" : "touchEnd", []);
  };
  const logical = async (x, y) => {
    const b = await page.locator("canvas").boundingBox();
    return { x: b.x + (x * b.width) / 1280, y: b.y + (y * b.height) / 720 };
  };
  async function contained(selector) {
    await page.locator(selector).waitFor({ state: "visible" });
    const s = await page.locator("#stage").boundingBox(),
      b = await page.locator(selector).boundingBox();
    if (
      !b ||
      b.x < s.x - 1 ||
      b.y < s.y - 1 ||
      b.x + b.width > s.x + s.width + 1 ||
      b.y + b.height > s.y + s.height + 1
    )
      throw Error(
        selector +
          " clipped at " +
          JSON.stringify({
            viewport: page.viewportSize(),
            stage: s,
            element: b,
          }),
      );
  }
  const viewports = [
    { width: 568, height: 320 },
    { width: 667, height: 375 },
    { width: 844, height: 390 },
    { width: 915, height: 412 },
    { width: 1024, height: 768 },
    { width: 1180, height: 820 },
    { width: 1366, height: 1024 },
  ];
  for (const size of viewports) {
    await page.setViewportSize(size);
    await page.waitForTimeout(180);
    await contained("#start");
    await contained("#practice-toggle");
    const begin = await page.locator("#start").boundingBox();
    if (begin.height < 43.5) throw Error("Start target too small");
    await tap("#practice-toggle");
    await page.locator("#journey-art").evaluate((img) => img.decode());
    for (const mission of ["sheep", "maze", "armor", "brook", "sling"])
      await contained(`[data-mission="${mission}"]`);
    await tap("#map-close");
  }
  await page.setViewportSize({ width: 667, height: 375 });
  await page.waitForTimeout(180);
  await tap("#practice-toggle");
  await tap('[data-mission="maze"]');
  await page.waitForTimeout(2700);
  for (const selector of ["#joystick-knob", "#hint", "#pause", "#install"]) {
    const b = await page.locator(selector).boundingBox();
    if (b.width < 43.5 || b.height < 43.5)
      throw Error(selector + " smaller than finger target");
  }
  const path = (await state()).mazePath;
  let prev = 0;
  for (let i = 1; i < path.length; i++) {
    const next = path[i],
      dx = (next % 9) - (prev % 9),
      dy = Math.floor(next / 9) - Math.floor(prev / 9);
    if (i === 1) {
      const a = await logical(600, 340);
      await drag(a, { x: a.x + dx * 45, y: a.y + dy * 45 });
    } else await stick.steer({ x: dx, y: dy }, 45);
    await page.waitForTimeout(240);
    if ((await state()).cell !== next)
      throw Error("Finger maze step failed " + i);
    prev = next;
  }
  await page.waitForFunction(() => {
    const s = window.adventureQA.snapshot();
    return s.phase === "success" && s.successTime >= 4;
  });
  await contained("#continue");
  await page.screenshot({ path: "qa/55-phone-maze-celebration.png" });
  await tap("#continue");
  await tap("#practice-toggle");
  await tap('[data-mission="armor"]');
  await page.waitForTimeout(2700);
  await drag(await logical(220, 482), await logical(650, 450));
  if ((await state()).equipped.length) throw Error("Wrong body part accepted");
  await drag(await logical(220, 482), await logical(650, 227), true);
  if ((await state()).equipped.length)
    throw Error("Cancelled drag equipped armour");
  await page.screenshot({ path: "qa/56-phone-armour.png" });
  for (const [from, to] of [
    [
      [220, 280],
      [650, 395],
    ],
    [
      [1045, 280],
      [650, 395],
    ],
    [
      [220, 482],
      [650, 227],
    ],
    [
      [1045, 482],
      [691, 441],
    ],
  ]) {
    await drag(await logical(...from), await logical(...to));
    await page.waitForTimeout(230);
  }
  if ((await state()).equipped.length !== 4)
    throw Error("Finger armour completion failed");
  await page.waitForTimeout(2600);
  await page.screenshot({ path: "qa/57-phone-armour-collapse.png" });
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
  await page.waitForTimeout(2800);
  await tap("#continue");
  // Two independent fingers: movement remains held while a second finger lifts a nearby sheep.
  await page.selectOption("#difficulty", "free");
  await tap("#practice-toggle");
  await tap('[data-mission="sheep"]');
  await page.waitForTimeout(2700);
  const moveTo = async (x, y) => {
    await stick.start();
    for (let i = 0; i < 240; i++) {
      const s = await state(),
        d = s.david;
      const dx = x - d.x,
        dy = y - d.y,
        length = Math.hypot(dx, dy);
      if (length < 12) {
        await stick.end();
        return;
      }
      await stick.move({ x: dx / length, y: dy / length });
      await page.waitForTimeout(
        Math.min(
          45,
          Math.max(
            10,
            (length / (s.carriedIndex === null ? 245 : 290)) * 1000 - 10,
          ),
        ),
      );
    }
    await stick.end();
    throw Error(
      "Touch rescue route blocked at " +
        [x, y] +
        " " +
        JSON.stringify(await state()),
    );
  };
  const sheep = (await state()).sheep[0];
  await moveTo(sheep.x - 35, sheep.y);
  const nearby = (await state()).sheep[0];
  await stick.start();
  await stick.tapWhileHeld(await logical(nearby.x, nearby.y - 22));
  await page.waitForTimeout(600);
  await stick.end();
  if ((await state()).carriedIndex === null)
    throw Error("Multi-finger pickup failed");
  await moveTo(430, 498);
  await moveTo(225, 498);
  await page.waitForTimeout(500);
  if ((await state()).sheep.filter((s) => s.saved).length !== 1)
    throw Error("Carried sheep not delivered");
  await page.screenshot({ path: "qa/58-phone-sheep.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(180);
  if (
    !(await page.locator("#rotate-notice").isVisible()) ||
    !(await state()).paused
  )
    throw Error("Portrait rotation did not protect active game");
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(180);
  if (
    (await page.locator("#rotate-notice").isVisible()) ||
    (await state()).paused
  )
    throw Error("Landscape did not resume safely");
  await tap("#restart");
  await tap("#modal-actions button:nth-child(2)");
  await tap("#practice-toggle");
  await tap('[data-mission="sling"]');
  await page.waitForTimeout(2700);
  const shot = await center("#action");
  await dispatch("touchStart", [shot]);
  await page.waitForTimeout(1000);
  await dispatch("touchEnd", []);
  await page.waitForTimeout(1700);
  if ((await state()).shot !== "hit")
    throw Error("Finger hold/release sling failed");
  await page.waitForTimeout(2200);
  await page.screenshot({ path: "qa/59-phone-finale.png" });
  await tap("#book-toggle");
  await tap('[data-mission="brook"]');
  await page.waitForTimeout(2700);
  const stones = (await state()).stones;
  const bad = stones.find((s) => !s.smooth);
  let point = await logical(bad.x, bad.y);
  await page.touchscreen.tap(point.x, point.y);
  await page.waitForTimeout(450);
  if ((await state()).stoneCount !== 0)
    throw Error("Jagged finger pickup counted");
  await collectWithRing(page, 5, true);
  if ((await state()).stoneCount !== 5)
    throw Error("Touch brook collection failed");
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "qa/62-phone-brook.png" });
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/mobile-results.json",
    JSON.stringify(
      {
        engine:
          "Chromium with native emulated touch events; not physical Safari",
        viewports,
        checks: [
          "44px finger controls",
          "chapter navigation",
          "swipe and joystick maze",
          "phone celebration",
          "actual armour finger drags",
          "wrong zone and cancellation",
          "armour collapse",
          "two-finger movement and pickup",
          "carried sheep delivery",
          "portrait pause and landscape resume",
          "finger sling charge/release and real hit",
          "finger brook taps reject jagged rocks and collect five unique stones",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "MOBILE PASS: phone/tablet bounds, native touch maze and armour, multi-touch rescue, rotation and sling.",
  );
} finally {
  await browser.close();
}
