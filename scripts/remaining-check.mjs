import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
await page.waitForSelector('#stage[data-ready="true"]');
const state = () => page.evaluate(() => window.adventureQA.snapshot());
await page.click("#start");
await page.waitForTimeout(2700);
await page.screenshot({ path: "qa/21-sheep-start.png" });
await page.keyboard.press("Space");
if ((await state()).sheep.some((s) => s.following))
  throw Error("Distant call falsely worked");
await page.screenshot({ path: "qa/22-sheep-distant-call.png" });
async function moveTo(x, y) {
  for (let i = 0; i < 80; i++) {
    const d = (await state()).david,
      dx = x - d.x,
      dy = y - d.y;
    if (Math.abs(dx) < 9 && Math.abs(dy) < 9) return;
    const key =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "ArrowRight"
          : "ArrowLeft"
        : dy > 0
          ? "ArrowDown"
          : "ArrowUp";
    await page.keyboard.down(key);
    await page.waitForTimeout(
      Math.min(
        180,
        Math.max(25, (Math.max(Math.abs(dx), Math.abs(dy)) / 190) * 1000),
      ),
    );
    await page.keyboard.up(key);
  }
  throw Error("Cannot move to " + [x, y] + JSON.stringify(await state()));
}
for (let i = 0; i < 2; i++) {
  let s = (await state()).sheep[i];
  await moveTo(s.x - 30, s.y);
  await page.keyboard.press("Space");
  await page.waitForTimeout(200);
  if (!(await state()).sheep[i].following)
    throw Error("Nearby sheep not called");
  await page.screenshot({ path: `qa/23-sheep-follow-${i}.png` });
  await moveTo(450, 498);
  await page.waitForTimeout(650);
  await moveTo(225, 498);
  await page.waitForTimeout(1400);
  if (!(await state()).sheep[i].saved) throw Error("Sheep not penned");
  if (i === 0) {
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
  "SHEEP + BROOK PASS: real herding, pen scoring, distant call rejection, jagged rejection, five unique pickups.",
);
await browser.close();
