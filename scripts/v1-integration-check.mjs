import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const checks = [],
  errors = [];
const result = {};
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  const url = (process.env.GAME_URL || "http://localhost:4173/") + "?qa";
  await page.goto(url);
  await page.waitForSelector("#stage[data-ready=true]");
  await page.screenshot({ path: "qa/67-v1-title.png" });
  const needs = {
    sheep: [
      "animals_sheep_idle_01",
      "animals_sheep_idle_02",
      "animals_sheep_idle_03",
      "animals_lion_idle",
      "props_fence",
    ],
    maze: [
      "background_02_maze_ground",
      "props_maze_wall_stone",
      "props_food_basket",
      "npcs_brother_03_idle",
    ],
    armor: [
      "background_03_saul_tent",
      "props_armor_tunic",
      "props_armor_mail",
      "props_armor_helmet",
      "props_armor_sword",
    ],
    brook: [
      "background_04_brook",
      "props_stone_01",
      "props_stone_02",
      "props_stone_03",
      "props_stone_jagged",
      "props_pouch",
    ],
    sling: ["background_05_battlefield", "goliath_idle", "props_pouch"],
  };
  let number = 68;
  for (const mission of ["sheep", "maze", "armor", "brook", "sling"]) {
    await page.goto(url);
    await page.waitForSelector("#stage[data-ready=true]");
    await page.click("#practice-toggle");
    await page.click(`[data-mission="${mission}"]`);
    await page.waitForTimeout(2700);
    const s = await state();
    if (!s.heroRig.ready || s.heroRig.source !== "david-rig.png")
      throw Error("Cohesive painted character rig did not load");
    if (s.visualAssetsLoaded !== 64 || s.visualAssetIssues.length)
      throw Error(
        "Asset validation/load failed " + JSON.stringify(s.visualAssetIssues),
      );
    for (const id of needs[mission])
      if (!s.visualAssetsUsed.includes(id))
        throw Error("Real scene did not draw " + id);
    if (s.visualAssetsUsed.includes("background_01_shepherd_hills"))
      throw Error("Damaged meadow rendered");
    const blocked = ["armor_", "kneel_collect", "sling_charge", "dress_"];
    if (
      s.visualAssetsUsed.some(
        (id) =>
          id.startsWith("david_") && blocked.some((part) => id.includes(part)),
      )
    )
      throw Error("Provisional pose replaced live rig");
    await page.screenshot({ path: `qa/${number++}-v1-${mission}.png` });
    checks.push(
      mission +
        ": live supplied sprites/background and existing articulated motion",
    );
  }
  const s = await state();
  if (
    Math.hypot(
      s.renderedGoliathForehead.x - 1000,
      s.renderedGoliathForehead.y - 259,
    ) > 0.01
  )
    throw Error("Visual forehead moved from actual collider");
  result.forehead = s.renderedGoliathForehead;
  await page.evaluate(() => {
    const overlay = document.createElement("div");
    overlay.id = "alignment-qa";
    overlay.style.cssText =
      "position:absolute;inset:0;pointer-events:none;z-index:6";
    overlay.innerHTML =
      '<svg width="1280" height="720" viewBox="0 0 1280 720"><circle cx="1000" cy="259" r="43" fill="none" stroke="#ff40bf" stroke-width="2"/><path d="M985 259h30M1000 244v30M174 513h20M184 503v20" stroke="#ff40bf" stroke-width="2"/><text x="905" y="202" fill="#98345e" font-size="16">Actual forehead collider</text><text x="70" y="464" fill="#98345e" font-size="16">Fixed launch (184,513)</text></svg>';
    document.querySelector("#stage").append(overlay);
  });
  await page.screenshot({ path: "qa/73-v1-forehead-release-alignment.png" });
  await page.locator("#alignment-qa").evaluate((e) => e.remove());
  checks.push("read-only geometry overlay checked and removed");
  await page.keyboard.down("Space");
  await page.waitForTimeout(1000);
  await page.keyboard.up("Space");
  await page.waitForFunction(
    () => window.adventureQA.snapshot().shot === "flying",
  );
  const flight = await state();
  if (
    !flight.renderedProjectile ||
    Math.hypot(
      flight.renderedProjectile.x - flight.stone.x,
      flight.renderedProjectile.y - flight.stone.y,
    ) > 0.01
  )
    throw Error("Rendered stone detached from authoritative flight");
  result.flight = {
    model: flight.stone,
    rendered: flight.renderedProjectile,
    charge: flight.charge,
  };
  await page.waitForFunction(
    () => window.adventureQA.snapshot().shot === "hit",
  );
  await page.waitForTimeout(900);
  await page.screenshot({ path: "qa/74-v1-goliath-reaction.png" });
  checks.push(
    "drawn projectile equals real ballistic object; genuine hit triggers supplied reaction sequence",
  );
  await page.waitForTimeout(2200);
  await page.click("#continue");
  if ((await state()).phase !== "victory")
    throw Error("Sling did not reach canonical finale");
  await page.click("#continue");
  if ((await state()).phase !== "title")
    throw Error("Finale restart did not return to title");
  checks.push("canonical finale followed by real restart to title");
  if (errors.length) throw Error(errors.join("\n"));
  writeFileSync(
    "qa/v1-integration-results.json",
    JSON.stringify(
      {
        ...result,
        checks,
        errors,
        quarantine: "Damaged meadow IDAT checksum; original meadow retained",
        missing:
          "24 optional effect frames; existing procedural animation retained",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "V1 ART PASS: 64 decoded candidates, five real scenes, original rig, forehead alignment, actual projectile and hit reaction.",
  );
} finally {
  await browser.close();
}
