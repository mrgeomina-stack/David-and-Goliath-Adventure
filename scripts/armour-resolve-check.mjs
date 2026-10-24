import { chromium } from "@playwright/test";
import { distServer } from "./dist-server.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
const server = distServer({ directory: "pages-dist" });
await new Promise((r) => server.listen(4196, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
mkdirSync("qa/armour-resolve", { recursive: true });
try {
  for (const touch of [false, true]) {
    const page = await browser.newPage({
      viewport: touch
        ? { width: 844, height: 390 }
        : { width: 1366, height: 768 },
      hasTouch: touch,
      isMobile: touch,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:4196/?qa");
    await page.waitForSelector('#stage[data-ready="true"]');
    await page.selectOption("#difficulty", "free");
    await page.click("#practice-toggle");
    await page.click('[data-mission="armor"]');
    await page.waitForTimeout(2800);
    const state = () => page.evaluate(() => window.adventureQA.snapshot());
    if (
      (await page.locator("#input-controls").isVisible()) ||
      (await page.locator("#joystick").isVisible()) ||
      (await page.locator("#action").isVisible())
    )
      throw Error("Armour control panel still visible");
    if (
      (await page.locator("#instruction").innerText()).match(
        /Pick|steer|بالدائرة/,
      )
    )
      throw Error("Old control instructions");
    await page.screenshot({
      path: `qa/armour-resolve/${touch ? "touch" : "desktop"}.png`,
    });
    const cdp = touch ? await page.context().newCDPSession(page) : null;
    async function point(x, y) {
      const b = await page.locator("canvas").boundingBox();
      return { x: b.x + (x * b.width) / 1280, y: b.y + (y * b.height) / 720 };
    }
    async function drag(from, to, cancel = false) {
      const a = await point(...from),
        b = await point(...to);
      if (touch) {
        const dispatch = (type, p) =>
          cdp.send("Input.dispatchTouchEvent", {
            type,
            touchPoints: p.map((p) => ({
              ...p,
              id: 0,
              radiusX: 8,
              radiusY: 8,
              force: 1,
            })),
          });
        await dispatch("touchStart", [a]);
        for (let i = 1; i <= 10; i++) {
          await dispatch("touchMove", [
            {
              x: a.x + ((b.x - a.x) * i) / 10,
              y: a.y + ((b.y - a.y) * i) / 10,
            },
          ]);
          await page.waitForTimeout(18);
        }
        await dispatch(cancel ? "touchCancel" : "touchEnd", []);
      } else {
        await page.mouse.move(a.x, a.y);
        await page.mouse.down();
        await page.mouse.move(b.x, b.y, { steps: 12 });
        if (cancel) await page.keyboard.press("Escape");
        await page.mouse.up();
      }
      await page.waitForTimeout(150);
    }
    await drag([220, 482], [650, 450]);
    if ((await state()).equipped.length) throw Error("Wrong drop accepted");
    if (touch) {
      await drag([220, 482], [650, 227], true);
      if ((await state()).equipped.length)
        throw Error("Cancelled drop accepted");
    }
    // Two taps must no longer attach armour without a drag.
    const a = await point(220, 482),
      b = await point(650, 227);
    if (touch) {
      await page.touchscreen.tap(a.x, a.y);
      await page.touchscreen.tap(b.x, b.y);
    } else {
      await page.mouse.click(a.x, a.y);
      await page.mouse.click(b.x, b.y);
    }
    if ((await state()).equipped.length)
      throw Error("Tap-to-place still active");
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
    ])
      await drag(from, to);
    if ((await state()).equipped.length !== 4)
      throw Error("Four direct drops failed");
    await page.waitForFunction(
      () => window.adventureQA.snapshot().fallTime >= 2.15,
    );
    const falling = await state();
    if (falling.audioEvents.armorFall !== 1 || falling.audioEvents.armorClatter)
      throw Error("Fall recording is not aligned to loss of balance");
    await page.waitForFunction(
      () => window.adventureQA.snapshot().fallTime >= 3.15,
    );
    const impact = await state();
    if (
      impact.audioEvents.armorClatter !== 1 ||
      impact.audioEvents.armorCrash ||
      impact.audioEvents.complete
    )
      throw Error("Armour impact/victory audio routing is wrong");
    await page.screenshot({
      path: `qa/armour-resolve/${touch ? "touch" : "desktop"}-fall.png`,
    });
    await page.waitForFunction(
      () => window.adventureQA.snapshot().fallTime >= 6.3,
    );
    await page.screenshot({
      path: `qa/armour-resolve/${touch ? "touch" : "desktop"}-determined.png`,
    });
    await page.waitForFunction(
      () => window.adventureQA.snapshot().phase === "success",
      { timeout: 12000 },
    );
    const complete = await state();
    if (complete.audioEvents.complete || complete.audioEvents.armorCrash)
      throw Error("Armour still plays victory or the old crash");
    if (
      !complete.sampleDurations.armorFall ||
      !complete.sampleDurations.armorClatter
    )
      throw Error("Uploaded recordings did not decode");
    await page.screenshot({
      path: `qa/armour-resolve/${touch ? "touch" : "desktop"}-complete.png`,
    });
    await page.click("#book-toggle");
    await page.click('[data-mission="sheep"]');
    await page.waitForTimeout(150);
    if (!(await page.locator("#joystick").isVisible()))
      throw Error("Sheep joystick missing");
    if (errors.length) throw Error(errors.join("\n"));
    results.push({
      touch,
      hiddenControls: true,
      wrongDropRejected: true,
      twoTapPlacementDisabled: true,
      fourCorrectDrops: true,
      collapseAndSuccess: true,
      sheepJoystickPreserved: true,
      audioEvents: complete.audioEvents,
      sampleDurations: {
        fall: complete.sampleDurations.armorFall,
        clatter: complete.sampleDurations.armorClatter,
      },
      noArmourVictorySound: true,
      errors,
    });
    await page.close();
  }
  writeFileSync(
    "qa/armour-resolve/results.json",
    JSON.stringify({ passed: true, results }, null, 2),
  );
  console.log(JSON.stringify({ passed: true, results }));
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
