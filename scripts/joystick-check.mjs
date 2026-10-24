import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { touchStick } from "./joystick-input.mjs";
const folder = "qa/joystick";
mkdirSync(folder, { recursive: true });
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
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  const stick = await touchStick(page);
  const tap = (s) => page.locator(s).tap();
  const logical = async (x, y) => {
    const b = await page.locator("canvas").boundingBox();
    return { x: b.x + (x * b.width) / 1280, y: b.y + (y * b.height) / 720 };
  };
  async function start(mission) {
    await tap(
      (await state()).phase === "title" ? "#practice-toggle" : "#book-toggle",
    );
    await tap(`[data-mission="${mission}"]`);
    await page.waitForFunction((m) => {
      const s = window.adventureQA.snapshot();
      return s.phase === "play" && s.mission === m;
    }, mission);
    await page.waitForTimeout(150);
  }
  async function moveTo(target, cursor = false) {
    await stick.start();
    for (let i = 0; i < 280; i++) {
      const s = await state(),
        p = cursor ? s.controlCursor : s.david;
      if (!p) {
        await stick.move({ x: 1, y: 0 });
        await page.waitForTimeout(35);
        continue;
      }
      const dx = target.x - p.x,
        dy = target.y - p.y,
        l = Math.hypot(dx, dy);
      if (l < 9) {
        await stick.end();
        return;
      }
      await stick.move({ x: dx / l, y: dy / l });
      await page.waitForTimeout(
        Math.min(
          45,
          Math.max(
            12,
            (l / (cursor ? 430 : s.carriedIndex !== null ? 290 : 245)) * 1000,
          ),
        ),
      );
    }
    throw Error(
      "Steering did not reach " +
        JSON.stringify(target) +
        " " +
        JSON.stringify(await state()),
    );
  }
  await start("sheep");
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
    const b = await page.locator("#joystick").boundingBox(),
      k = await page.locator("#joystick-knob").boundingBox();
    if (
      b.x < size.width / 2 ||
      b.x + b.width > size.width ||
      b.y < 0 ||
      b.y + b.height > size.height ||
      k.width < 44 ||
      k.height < 44
    )
      throw Error("Joystick size/bounds " + JSON.stringify({ size, b, k }));
    if (await page.locator("[data-dir]:visible").count())
      throw Error("Old arrows still displayed");
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(180);
  // Tapping a distant sheep must not teleport it into David's arms.
  let sheep = (await state()).sheep[0];
  let p = await logical(sheep.x, sheep.y - 22);
  await page.touchscreen.tap(p.x, p.y);
  if ((await state()).carriedIndex !== null) throw Error("Remote sheep lift");
  await moveTo({ x: sheep.x - 45, y: sheep.y });
  sheep = (await state()).sheep[0];
  p = await logical(sheep.x, sheep.y - 22);
  await stick.start();
  await stick.tapWhileHeld(p);
  await stick.end();
  if ((await state()).carriedIndex !== 0)
    throw Error("Tapped sheep not lifted");
  await page.waitForTimeout(650);
  await moveTo({ x: 450, y: 498 });
  await moveTo({ x: 225, y: 498 });
  await page.waitForTimeout(550);
  if (!(await state()).sheep[0].saved)
    throw Error("Sheep did not physically enter pen");
  await page.screenshot({ path: folder + "/sheep-delivered.png" });
  await stick.start({ x: 1, y: 0 });
  await page.waitForTimeout(150);
  await stick.end(true);
  const stopped = (await state()).david;
  await page.waitForTimeout(250);
  if (
    Math.hypot(
      (await state()).david.x - stopped.x,
      (await state()).david.y - stopped.y,
    ) > 1
  )
    throw Error("Cancelled joystick stuck");
  await stick.start({ x: 1, y: 0 });
  await page.locator("#pause").click();
  if (
    (await state()).stickDirection.x ||
    (await page.locator("#joystick").getAttribute("data-active")) !== "false"
  )
    throw Error("Pause did not release joystick");
  await stick.end();
  await tap("#modal-actions button:first-child");
  await start("maze");
  let prev = 0;
  for (const n of (await state()).mazePath.slice(1)) {
    await stick.steer(
      { x: (n % 9) - (prev % 9), y: Math.floor(n / 9) - Math.floor(prev / 9) },
      45,
    );
    await page.waitForTimeout(210);
    prev = n;
  }
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
  await page.waitForTimeout(2700);
  await page.screenshot({ path: folder + "/maze-delivery.png" });
  await start("armor");
  // Original direct finger dragging still equips a real piece.
  const cdp = await page.context().newCDPSession(page);
  const a = await logical(220, 280),
    b = await logical(650, 370);
  const dispatch = (type, points) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((p) => ({ ...p, id: 0, radiusX: 8, radiusY: 8 })),
    });
  await dispatch("touchStart", [a]);
  for (let i = 1; i <= 8; i++)
    await dispatch("touchMove", [
      { x: a.x + ((b.x - a.x) * i) / 8, y: a.y + ((b.y - a.y) * i) / 8 },
    ]);
  await dispatch("touchEnd", []);
  if (!(await state()).equipped.includes("tunic"))
    throw Error("Direct armour drag regressed");
  const gear = [
    ["helmet", { x: 220, y: 482 }, { x: 650, y: 227 }],
    ["mail", { x: 1045, y: 280 }, { x: 650, y: 370 }],
    ["sword", { x: 1045, y: 482 }, { x: 691, y: 441 }],
  ];
  if (await page.locator("#input-controls").isVisible())
    throw Error("Armour must have no joystick or Pick / Place controls");
  async function dragPiece(from, to) {
    const a = await logical(from.x, from.y),
      b = await logical(to.x, to.y);
    await dispatch("touchStart", [a]);
    for (let i = 1; i <= 8; i++) {
      await dispatch("touchMove", [
        { x: a.x + ((b.x - a.x) * i) / 8, y: a.y + ((b.y - a.y) * i) / 8 },
      ]);
      await page.waitForTimeout(18);
    }
    await dispatch("touchEnd", []);
  }
  for (const [item, tray, anchor] of gear) {
    if (item === "helmet") {
      await dragPiece(tray, { x: 691, y: 500 });
      if ((await state()).equipped.includes(item))
        throw Error("Wrong armour placement accepted");
    }
    await dragPiece(tray, anchor);
    if (!(await state()).equipped.includes(item))
      throw Error("Drag did not attach " + item);
  }
  await page.waitForTimeout(3100);
  await page.screenshot({ path: folder + "/armour-collapse.png" });
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
  await start("brook");
  const stones = (await state()).stones.filter((s) => s.smooth).slice(0, 5);
  for (const stone of stones) {
    await moveTo(stone, true);
    for (let attempt = 0; attempt < 5; attempt++) {
      if (
        (await state()).stones.some(
          (s) => s.x === stone.x && s.y === stone.y && s.collected,
        )
      )
        break;
      await page.waitForFunction((stone) => {
        const s = window.adventureQA.snapshot();
        return Math.hypot(s.ring.x - stone.x, s.ring.y - stone.y) < 23;
      }, stone);
      await tap("#action");
      await page.waitForTimeout(450);
    }
  }
  if ((await state()).stoneCount !== 5)
    throw Error("Cursor did not collect five unique timed stones");
  await page.screenshot({ path: folder + "/brook.png" });
  await start("sling");
  await stick.start({ x: 0, y: -1 });
  await page.waitForTimeout(300);
  await stick.end(true);
  if ((await state()).shot !== "ready" || (await state()).charge !== 0)
    throw Error("Cancelled sling fired");
  await stick.start({ x: -1, y: 0 });
  await page.waitForTimeout(1000);
  await stick.end();
  await page.waitForTimeout(1700);
  if ((await state()).shot !== "hit")
    throw Error(
      "Joystick hold/release missed " + JSON.stringify(await state()),
    );
  await page.waitForTimeout(2100);
  await page.screenshot({ path: folder + "/sling-success.png" });
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    folder + "/results.json",
    JSON.stringify(
      {
        engine: "Chromium, native emulated touch (not physical Safari)",
        sizes,
        checks: [
          "right-side concentric joystick, >=44px knob",
          "nearby sheep single tap and physical pen delivery",
          "independent simultaneous fingers",
          "pointer cancellation and pause reset",
          "real maze completion",
          "direct finger armour drag retained",
          "joystick cursor wrong/correct armour placement and collapse",
          "five unique timed brook stones",
          "cancelled sling never fires",
          "joystick pull/hold/release actual hit",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "JOYSTICK PASS: native touch across seven sizes and all five activities.",
  );
} finally {
  await browser.close();
}
