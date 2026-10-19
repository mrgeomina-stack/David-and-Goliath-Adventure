import { chromium } from "@playwright/test";
import { resolve } from "node:path";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto((process.env.GAME_URL || "http://localhost:5173/") + "?qa");
await page.waitForSelector('#stage[data-ready="true"]');
await page.waitForSelector("canvas");
await page.screenshot({ path: "qa/01-title.png" });
await page.click("#practice-toggle");
await page.click('[data-mission="maze"]');
await page.waitForTimeout(3000);
await page.screenshot({ path: "qa/02-maze-start.png" });
const state = () => page.evaluate(() => window.adventureQA.snapshot());
const route = (await state()).mazePath;
await page.keyboard.press("ArrowLeft");
await page.waitForTimeout(250);
if ((await state()).cell !== 0) throw Error("Wall not solid");
await page.screenshot({ path: "qa/03-maze-wall.png" });
let old = 0;
for (let i = 1; i < route.length; i++) {
  const n = route[i],
    dx = (n % 9) - (old % 9),
    dy = Math.floor(n / 9) - Math.floor(old / 9);
  await page.keyboard.down(
    dx > 0
      ? "ArrowRight"
      : dx < 0
        ? "ArrowLeft"
        : dy > 0
          ? "ArrowDown"
          : "ArrowUp",
  );
  await page.waitForTimeout(75);
  await page.keyboard.up(
    dx > 0
      ? "ArrowRight"
      : dx < 0
        ? "ArrowLeft"
        : dy > 0
          ? "ArrowDown"
          : "ArrowUp",
  );
  await page.waitForTimeout(145);
  old = n;
  if (i === 6) await page.screenshot({ path: "qa/04-maze-middle.png" });
}
await page.waitForTimeout(1400);
await page.screenshot({ path: "qa/05-maze-handover.png" });
await page.waitForTimeout(2800);
await page.screenshot({ path: "qa/06-maze-success.png" });
if ((await state()).phase !== "success")
  throw Error("Maze not completed: " + JSON.stringify(await state()));
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "MAZE PASS: real keyboard route, wall rejection, handover, success; zero browser errors.",
);
await browser.close();
