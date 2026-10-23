import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { bootOfflineBuild } from "./offline-build.mjs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    hasTouch: true,
    serviceWorkers: "block",
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.virtualPad = {
      connected: true,
      mapping: "standard",
      index: 0,
      axes: [0, 0, 0, 0],
      buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
    };
    navigator.getGamepads = () => [window.virtualPad];
  });
  await bootOfflineBuild(page, context);
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  await page.click("#start");
  await page.waitForTimeout(2700);
  // Exercise the production standard-gamepad polling path, without mutating game state.
  const d0 = (await state()).david.x;
  await page.evaluate(() => (window.virtualPad.axes[0] = 1));
  await page.waitForTimeout(180);
  await page.evaluate(() => (window.virtualPad.axes[0] = 0));
  if ((await state()).david.x < d0 + 20)
    throw Error("Gamepad stick did not move David");
  // Real simultaneous arrow keys use the same diagonal movement available to children.
  async function moveTo(x, y) {
    for (let i = 0; i < 140; i++) {
      const current = await state();
      if (current.phase === "success" || current.lionEncounter.stage !== "idle")
        return;
      if (current.failed) throw Error("Rescue expired during route");
      const dx = x - current.david.x,
        dy = y - current.david.y;
      if (Math.abs(dx) < 9 && Math.abs(dy) < 9) return;
      const keys = [];
      const distances = [];
      if (Math.abs(dx) >= 9) {
        keys.push(dx > 0 ? "ArrowRight" : "ArrowLeft");
        distances.push(Math.abs(dx));
      }
      if (Math.abs(dy) >= 9) {
        keys.push(dy > 0 ? "ArrowDown" : "ArrowUp");
        distances.push(Math.abs(dy));
      }
      const speed = current.carriedIndex !== null ? 290 : 245;
      for (const key of keys) await page.keyboard.down(key);
      await page.waitForTimeout(
        Math.min(
          160,
          Math.max(
            20,
            ((Math.min(...distances) * (keys.length === 2 ? Math.SQRT2 : 1)) /
              speed) *
              1000,
          ),
        ),
      );
      for (const key of keys) await page.keyboard.up(key);
    }
    throw Error("Rescue route blocked");
  }
  for (let i = 0; i < 4; i++) {
    let s = (await state()).sheep[i];
    await moveTo(s.x - 30, s.y);
    if (i === 1) {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(150);
      const box = await page.locator("#action").boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    } else await page.keyboard.press("Space");
    await page.waitForTimeout(200);
    if ((await state()).liftProgress <= 0 || (await state()).liftProgress >= 1)
      throw Error("Missing animated lift");
    if (!(await state()).sheep[i].carried)
      throw Error("Nearby sheep not lifted");
    await page.screenshot({ path: `qa/23-sheep-follow-${i}.png` });
    if (i === 0) {
      await page.screenshot({ path: "qa/48-sheep-lift.png" });
      await page.waitForTimeout(420);
      if ((await state()).liftProgress !== 1)
        throw Error("Lift did not finish");
      await page.screenshot({ path: "qa/49-sheep-carried.png" });
    }
    await moveTo(450, 498);
    await page.waitForTimeout(100);
    await moveTo(225, 498);
    await page.waitForTimeout(460);
    if (!(await state()).sheep[i].saved) throw Error("Sheep not penned");
    if (i === 1) await page.setViewportSize({ width: 1280, height: 720 });
    if (i < 3) {
      await moveTo(450, 498);
    }
  }

  const saved = (await state()).sheep.filter((s) => s.saved).length;
  if (saved !== 4)
    throw Error("Encounter did not retain four real pen deliveries");
  const remaining = (await state()).sheepRemaining;
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.stage === "seize",
  );
  await page.screenshot({ path: "qa/99-lion-seizes-lamb.png" });
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.stage === "rescue",
  );
  await page.keyboard.press("Space");
  if ((await state()).lionEncounter.stage !== "retry")
    throw Error("Early timing did not fail");
  await page.screenshot({ path: "qa/99-lion-retry.png" });
  const action = async () => {
    const b = await page.locator("#action").boundingBox();
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  };
  await action();
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.stage === "retry",
  );
  if ((await state()).lionEncounter.misses !== 2)
    throw Error("Timeout did not permit local retry");
  await action();
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.inWindow,
  );
  await page.screenshot({ path: "qa/99-lion-rescue-green.png" });
  const a = async (down) =>
    page.evaluate((down) => {
      window.virtualPad.buttons[0] = { pressed: down, value: down ? 1 : 0 };
    }, down);
  await a(true);
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.stage === "rush",
  );
  await page.waitForTimeout(1050);
  await page.screenshot({ path: "qa/99-lion-lift.png" });
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.stage === "defend",
  );
  await page.waitForTimeout(150);
  if ((await state()).lionEncounter.stage !== "defend")
    throw Error("Held A cleared both timing challenges");
  await a(false);
  await page.click("#pause");
  const paused = (await state()).lionEncounter.time;
  await page.waitForTimeout(500);
  if ((await state()).lionEncounter.time !== paused)
    throw Error("Pause failed in timing challenge");
  await page.click("#modal-actions button:first-child");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.stage === "retry",
  );
  if (
    !(await state()).lionEncounter.rescued ||
    (await state()).lionEncounter.checkpoint !== "defend"
  )
    throw Error("Second miss lost the rescued lamb");
  await a(true);
  await page.waitForTimeout(80);
  await a(false);
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.inWindow,
  );
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(120);
  await page.screenshot({ path: "qa/99-lion-phone-defend.png" });
  await action();
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.stage === "guard",
  );
  await page.waitForTimeout(500);
  await page.screenshot({ path: "qa/99-lion-staff-defense.png" });
  await page.waitForFunction(
    () => window.adventureQA.snapshot().lionEncounter.stage === "return",
  );
  await page.waitForTimeout(2900);
  await page.screenshot({ path: "qa/99-lion-return-to-pen.png" });
  if ((await state()).sheep.filter((s) => s.saved).length !== 4)
    throw Error("Scored final lamb before physical pen return");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
  if ((await state()).sheepRemaining !== remaining)
    throw Error("Encounter consumed the rescue timer");
  if ((await state()).sheep.filter((s) => s.saved).length !== 5)
    throw Error("Fifth lamb not delivered");
  if (
    (await state()).audioEvents.sheep !== 5 ||
    !(await state()).audioEvents.roar
  )
    throw Error("Uploaded sounds did not play during rescue");
  if ((await state()).audioEvents.complete !== 1)
    throw Error("Victory did not play exactly once");
  await page.waitForTimeout(2800);
  await page.screenshot({ path: "qa/99-lion-victory.png" });
  await page.click("#continue");
  if ((await state()).mission !== "maze")
    throw Error("Next-level transition broken");
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/lion-encounter-1.11.0.json",
    JSON.stringify(
      {
        passed: true,
        offline: true,
        checks: [
          "four real rescues plus a fifth lamb",
          "gamepad movement",
          "early miss",
          "timeout",
          "unlimited local retries",
          "A rescue and held-button edge",
          "pause",
          "second-stage checkpoint",
          "touch defense",
          "staff contact",
          "physical pen entry",
          "uploaded roar and sheep audio",
          "one victory",
          "maze transition",
        ],
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "LION ENCOUNTER PASS: real rescues, early/timeout retries, keyboard/touch/emulated gamepad, held-button protection, pause, both challenges, safe return, one victory, next maze; offline.",
  );
} finally {
  await browser.close();
}
