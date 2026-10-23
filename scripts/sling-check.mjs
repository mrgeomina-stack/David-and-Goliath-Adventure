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
await page.click("#practice-toggle");
await page.click('[data-mission="sling"]');
await page.waitForTimeout(2700);
await page.screenshot({ path: "qa/14-sling-start.png" });
async function shoot(ms) {
  await page.keyboard.down("Space");
  await page.waitForTimeout(ms);
  await page.keyboard.up("Space");
}
await shoot(10);
await page.waitForTimeout(2400);
if ((await state()).shot !== "miss") throw Error("Low shot should miss");
await page.screenshot({ path: "qa/15-sling-low-miss.png" });
await page.click("#continue");
await shoot(2100);
await page.waitForTimeout(2700);
if ((await state()).shot !== "miss") throw Error("High shot should miss");
await page.screenshot({ path: "qa/16-sling-high-miss.png" });
await page.click("#continue");
await shoot(1000);
await page.waitForTimeout(450);
await page.screenshot({ path: "qa/17-sling-flight.png" });
await page.click("#pause");
const before = await state();
await page.waitForTimeout(300);
if ((await state()).stone.x !== before.stone.x)
  throw Error("Pause did not stop flight");
await page.click("#modal-actions button:first-child");
await page.waitForTimeout(950);
if ((await state()).shot !== "hit")
  throw Error("Ideal shot did not hit: " + JSON.stringify(await state()));
await page.screenshot({ path: "qa/18-sling-hit.png" });
await page.waitForTimeout(2100);
await page.screenshot({ path: "qa/19-sling-success.png" });
await page.click("#continue");
await page.screenshot({ path: "qa/20-victory.png" });
if ((await state()).audioEvents.launch !== 3)
  throw Error("Release whoosh must play exactly once for each real throw");
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "SLING PASS: low and high misses, ideal collision, pause during flight, victory.",
);
await browser.close();
