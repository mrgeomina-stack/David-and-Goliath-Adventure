import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, extname } from "node:path";
const root = resolve("qa/ui-redesign");
const scenes = [
  [
    "home",
    "Home screen",
    "Rounded title, coral primary action, raised selector and consistent control chips.",
  ],
  [
    "missions",
    "Mission selection",
    "Framed map, gold icon medallions, isolated bilingual labels and earned-status chips.",
  ],
  [
    "pause",
    "Pause popup",
    "Layered teal frame, sky accent, glossy Resume button and a clear secondary action.",
  ],
  [
    "teacher",
    "Teacher corner",
    "Purple accent, separate Arabic/English reading blocks and visible footer controls while text scrolls.",
  ],
  [
    "instruction",
    "In-game instruction",
    "Sky-tinted card, gold icon tile, rounded typography and clear control hierarchy.",
  ],
];
for (const [name] of scenes)
  for (const phase of ["before", "after"])
    readFileSync(`${root}/${phase}/${name}.png`);
const extras = readdirSync(`${root}/after`).filter(
  (n) => n.endsWith(".png") && !scenes.some(([name]) => n === `${name}.png`),
);
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>David’s Big Adventure — UI before & after</title><style>
*{box-sizing:border-box}body{margin:0;background:#e9f3ed;color:#184e56;font:17px/1.5 "Trebuchet MS",Arial,sans-serif}header{padding:36px 44px 30px;background:linear-gradient(120deg,#164f5b,#257e7f);color:#fff9e3;border-bottom:6px solid #f3c764}header small{letter-spacing:2px;font-weight:bold;color:#ffdc91}h1{font-size:40px;line-height:1.1;margin:13px 0}header p{max-width:1040px;margin:10px 0 0;color:#e8f8f0}main{max-width:1460px;margin:auto;padding:24px}.comparison{margin:0 0 30px;padding:20px;background:#fffdf3;border:2px solid #9abdb1;border-radius:24px;box-shadow:0 5px 0 #c4d7cc}.comparison h2{margin:0;font-size:25px}.comparison p{margin:4px 0 14px;color:#466b6b}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;min-width:0}figcaption{display:flex;align-items:center;justify-content:space-between;border-radius:11px 11px 0 0;background:#dfe9e4;padding:8px 13px;font-weight:bold;font-size:13px;letter-spacing:1px}.new figcaption{background:#d4efe8;color:#11585d}.new figcaption b{background:#f9d37d;padding:2px 9px;border-radius:100px}img{display:block;width:100%;height:auto;border:2px solid #b9cfc5;border-radius:0 0 13px 13px}.new img{border-color:#5b9b98}a{color:inherit}footer{padding:0 24px 40px;max-width:1460px;margin:auto}footer a{display:inline-block;background:#fffdf4;border:1px solid #9dbdb0;border-radius:12px;padding:6px 11px;margin:4px;font-size:14px}footer p{margin:8px 0}.note{padding:14px 20px;background:#fff3cb;border-radius:16px}@media(max-width:800px){header{padding:26px 20px}h1{font-size:30px}main{padding:14px}.pair{grid-template-columns:1fr}.comparison{padding:13px}}
</style><header><small>DAVID’S BIG ADVENTURE · UI REDESIGN · 23 OCTOBER 2026</small><h1>A brighter adventure, from the very first button.</h1><p>Before: v1.8.0 · After: v1.9.0. These are actual integrated-game screenshots. Gameplay, controls, progression and story order are preserved. Click a screenshot to inspect the original size.</p></header><main>${scenes.map(([name, title, description], i) => `<section class="comparison" data-scene="${name}"><h2>${i + 1}. ${title}</h2><p>${description}</p><div class="pair"><figure><figcaption>BEFORE <span>v1.8.0</span></figcaption><a href="before/${name}.png"><img src="before/${name}.png" alt="${title} before redesign"></a></figure><figure class="new"><figcaption>AFTER <b>v1.9.0</b></figcaption><a href="after/${name}.png"><img src="after/${name}.png" alt="${title} after redesign"></a></figure></div></section>`).join("")}</main><footer><div class="note"><b>Implementation:</b> src/ui-theme.css, index.html, presentational markup in src/main.ts, shared Canvas card skin in src/art.ts and its draw calls in src/world.ts. Nunito and Noto Sans Arabic fonts are bundled offline. No text was baked into game UI images.</div><p><b>Additional captures:</b></p>${extras.map((n) => `<a href="after/${n}">${n.replace(".png", "").replaceAll("-", " ")}</a>`).join("")}<p>Open this index.html after extracting the complete comparison ZIP. This gallery needs no internet connection.</p></footer></html>`;
writeFileSync(`${root}/index.html`, html);
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
  });
  await page.route("http://ui-comparison.test/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const file = resolve(
      root,
      pathname === "/" ? "index.html" : pathname.slice(1),
    );
    if (!file.startsWith(root + "/")) return route.abort();
    return route.fulfill({
      body: readFileSync(file),
      contentType:
        extname(file) === ".png" ? "image/png" : "text/html; charset=utf-8",
    });
  });
  await page.goto("http://ui-comparison.test/");
  await page
    .locator("img")
    .evaluateAll((imgs) => Promise.all(imgs.map((img) => img.decode())));
  await page.screenshot({ path: `${root}/overview.png`, fullPage: true });
  for (const [name] of scenes)
    await page
      .locator(`[data-scene="${name}"]`)
      .screenshot({ path: `${root}/pair-${name}.png` });
  console.log(
    "Comparison gallery and five before/after pairs generated from actual game captures.",
  );
} finally {
  await browser.close();
}
