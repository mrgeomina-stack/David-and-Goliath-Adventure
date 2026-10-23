import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
// Exercise the bundled offline narrator on a device with no installed voices.
await page.addInitScript(() => {
  if (window.speechSynthesis) speechSynthesis.getVoices = () => [];
});
const completions = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
await page.waitForSelector('#stage[data-ready="true"]');
const state = () => page.evaluate(() => window.adventureQA.snapshot());
async function key(code, ms) {
  await page.keyboard.down(code);
  await page.waitForTimeout(ms);
  await page.keyboard.up(code);
}
async function moveTo(x, y) {
  for (let i = 0; i < 90; i++) {
    if ((await state()).phase === "success") return;
    const d = (await state()).david,
      dx = x - d.x,
      dy = y - d.y;
    if (Math.abs(dx) < 9 && Math.abs(dy) < 9) return;
    await key(
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "ArrowRight"
          : "ArrowLeft"
        : dy > 0
          ? "ArrowDown"
          : "ArrowUp",
      Math.min(
        170,
        Math.max(
          25,
          (Math.max(Math.abs(dx), Math.abs(dy)) /
            ((await state()).carriedIndex !== null ? 290 : 245)) *
            1000,
        ),
      ),
    );
  }
  throw Error("Sheep route blocked");
}
async function complete() {
  await page.waitForFunction(() => {
    const s = window.adventureQA.snapshot();
    return s.phase === "success" && s.successTime >= 4;
  });
  const snapshot = await state();
  completions.push({ mission: snapshot.mission, ...snapshot.audioEvents });
  if (snapshot.audioEvents.background !== 1 || !snapshot.musicState.loop)
    throw Error("Background music restarted or lost its loop across chapters");
  if (snapshot.audioEvents.complete !== completions.length)
    throw Error("Missing or repeated completion recording");
  await page.click("#continue");
}
const started = Date.now();
await page.click("#start");
await page.waitForTimeout(2600);
for (let i = 0; i < 4; i++) {
  const s = (await state()).sheep[i];
  await moveTo(s.x - 30, s.y);
  await page.keyboard.press("Space");
  await moveTo(450, 498);
  await page.waitForTimeout(100);
  await moveTo(225, 498);
  await page.waitForTimeout(460);
  if (!(await state()).sheep[i].saved) throw Error("Sheep not penned");
  if (i < 3) await moveTo(450, 498);
}
if ((await state()).audioEvents.sheep !== 4)
  throw Error("Sheep recording did not play once per successful lift");
if (!((await state()).audioEvents.roar >= 1))
  throw Error("Missing periodic lion growl");
await complete();
if ((await state()).mission !== "maze") throw Error("Expected maze");
let prev = 0;
for (const n of (await state()).mazePath.slice(1)) {
  const dx = (n % 9) - (prev % 9),
    dy = Math.floor(n / 9) - Math.floor(prev / 9);
  await key(
    dx
      ? dx > 0
        ? "ArrowRight"
        : "ArrowLeft"
      : dy > 0
        ? "ArrowDown"
        : "ArrowUp",
    70,
  );
  await page.waitForTimeout(150);
  prev = n;
}
await complete();
if ((await state()).phase !== "encounter")
  throw Error("Missing interactive encounter");
await page.screenshot({ path: "qa/90-encounter-purpose.png" });
await key("ArrowRight", 2400);
if (!(await state()).heard) throw Error("Cannot hear giant");
await page.screenshot({ path: "qa/91-encounter-challenge.png" });
await page.keyboard.press("Space");
if ((await state()).phase !== "encounter")
  throw Error("Distant Saul interaction worked");
await key("ArrowLeft", 2300);
if ((await state()).mission !== "maze")
  throw Error("Saul conversation skipped");
await page.keyboard.press("Space");
if ((await state()).mission !== "armor") throw Error("Saul not reached");
await page.waitForTimeout(250);
await page.screenshot({ path: "qa/92-saul-armour-story.png" });
for (const [a, b] of [
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
  await page.mouse.move(...a);
  await page.mouse.down();
  await page.mouse.move(...b, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(100);
}
await page.waitForTimeout(6700);
await complete();
if ((await state()).mission !== "brook") throw Error("Expected brook");
// Use the real moving ring and SPACE for all five pickups, instead of direct tapping.
let attempts = 0;
while ((await state()).stoneCount < 5) {
  const s = await state();
  if (
    s.stones.some(
      (p) =>
        p.smooth &&
        !p.collected &&
        Math.hypot(p.x - s.ring.x, p.y - s.ring.y) < 40,
    )
  ) {
    await page.keyboard.press("Space");
    await page.waitForTimeout(450);
  } else await page.waitForTimeout(40);
  if (attempts++ > 600) throw Error("Timing pickups unreachable");
}
await page.screenshot({ path: "qa/93-brook-random-collection.png" });
await complete();
if ((await state()).mission !== "sling") throw Error("Expected sling");
await key("Space", 1000);
await page.waitForTimeout(1600);
if ((await state()).shot !== "hit") throw Error("Final physics miss");
await complete();
if ((await state()).phase !== "victory") throw Error("No final victory");
await page.screenshot({ path: "qa/31-story-victory.png" });
if (((await state()).audioEvents.voice ?? 0) < 3)
  throw Error("Bundled approach, Goliath and Saul narration did not start");
if (errors.length) throw Error(errors.join("\n"));
const result = {
  seconds: (Date.now() - started) / 1000,
  mode: "Easy; automation used solver route and read-only position feedback; not human/classroom timing",
  errors,
  completions,
  audio: (await state()).audioEvents,
  recordings: (await state()).sampleDurations,
  music: (await state()).musicState,
};
writeFileSync("qa/story-result.json", JSON.stringify(result, null, 2));
console.log("FULL STORY PASS:", JSON.stringify(result));
await browser.close();
