import { chromium } from "@playwright/test";
import { distServer } from "./dist-server.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
const folder = `qa/armour-fit/${process.env.CAPTURE || "after"}`;
mkdirSync(folder, { recursive: true });
const server = distServer({ directory: "pages-dist" });
await new Promise((r) => server.listen(4195, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4195/?qa");
  await page.waitForSelector('#stage[data-ready="true"]');
  await page.selectOption("#difficulty", "free");
  await page.click("#practice-toggle");
  await page.click('[data-mission="armor"]');
  await page.waitForTimeout(2800);
  for (const [name, from, to] of [
    ["tunic", [220, 280], [650, 395]],
    ["mail", [1045, 280], [650, 395]],
    ["helmet", [220, 482], [650, 227]],
    ["sword", [1045, 482], [691, 441]],
  ]) {
    const b = await page.locator("canvas").boundingBox();
    const at = (p) => ({
      x: b.x + (p[0] * b.width) / 1280,
      y: b.y + (p[1] * b.height) / 720,
    });
    const a = at(from),
      z = at(to);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(z.x, z.y, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(260);
    await page.screenshot({ path: `${folder}/${name}.png` });
  }
  for (const [name, time] of [
    ["strain", 1.2],
    ["tumble", 2.9],
    ["remove", 4.3],
    ["recover", 5.6],
  ]) {
    await page.waitForFunction(
      (t) => window.adventureQA.snapshot().fallTime >= t,
      time,
    );
    await page.screenshot({ path: `${folder}/${name}.png` });
  }
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    `${folder}/results.json`,
    JSON.stringify(
      {
        passed: true,
        equipped: (await page.evaluate(() => window.adventureQA.snapshot()))
          .equipped,
        errors,
      },
      null,
      2,
    ),
  );
  console.log("Armour fit capture passed", folder);
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
