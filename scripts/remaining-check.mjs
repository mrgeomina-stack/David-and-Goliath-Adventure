import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  hasTouch: true,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
await page.waitForSelector('#stage[data-ready="true"]');
const state = () => page.evaluate(() => window.adventureQA.snapshot());
await page.click("#start");
await page.waitForTimeout(2700);
await page.screenshot({ path: "qa/21-sheep-start.png" });
await page.keyboard.press("Space");
if ((await state()).sheep.some((s) => s.carried))
  throw Error("Distant pickup falsely worked");
await page.screenshot({ path: "qa/22-sheep-distant-call.png" });
// Real simultaneous arrow keys use the same diagonal movement available to children.
async function moveTo(x, y) {
  for (let i = 0; i < 140; i++) {
    const current = await state();
    if (current.phase === "success") return;
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
  if (!(await state()).sheep[i].carried) throw Error("Nearby sheep not lifted");
  await page.screenshot({ path: `qa/23-sheep-follow-${i}.png` });
  if (i === 0) {
    await page.screenshot({ path: "qa/48-sheep-lift.png" });
    await page.waitForTimeout(420);
    if ((await state()).liftProgress !== 1) throw Error("Lift did not finish");
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
await page.waitForTimeout(2800);
await page.screenshot({ path: "qa/24-sheep-success.png" });
if ((await state()).phase !== "success") throw Error("Sheep not won");
await page.click("#continue");
if ((await state()).mission !== "maze") throw Error("Story order incorrect");
await page.click("#restart");
await page.click("#modal-actions button:nth-child(2)");
await page.click("#practice-toggle");
await page.click('[data-mission="brook"]');
await page.waitForTimeout(2700);
await page.screenshot({ path: "qa/25-brook-start.png" });
const stones = (await state()).stones;
const rough = stones.find((s) => !s.smooth);
await page.mouse.click(rough.x, rough.y);
await page.waitForTimeout(100);
if ((await state()).stoneCount !== 0) throw Error("Jagged scored");
await page.screenshot({ path: "qa/26-brook-jagged.png" });
await page.waitForTimeout(450);
for (const s of stones.filter((s) => s.smooth).slice(0, 5)) {
  await page.mouse.click(s.x, s.y);
  await page.waitForTimeout(120);
  if ((await state()).stoneCount === 3)
    await page.screenshot({ path: "qa/26b-brook-pickup.png" });
  await page.waitForTimeout(360);
}
await page.waitForTimeout(2800);
await page.screenshot({ path: "qa/27-brook-success.png" });
if ((await state()).stoneCount !== 5 || (await state()).phase !== "success")
  throw Error("Brook incomplete");
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "SHEEP + BROOK PASS: four individual carries, keyboard/touch lifts, pen scoring, distant pickup rejection, jagged rejection, five unique pickups.",
);
await browser.close();
