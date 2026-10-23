/** Observe the moving ring, then use native input at the actual opportunity. */
export async function collectWithRing(page, count = 5, touch = false) {
  for (let tries = 0; tries < 1200; tries++) {
    const s = await page.evaluate(() => window.adventureQA.snapshot());
    if (s.stoneCount >= count) return;
    if (s.failed) throw Error("Brook timer expired");
    const stone = s.stones.find(
      (p) =>
        p.smooth &&
        !p.collected &&
        Math.hypot(p.x - s.ring.x, p.y - s.ring.y) < 35,
    );
    if (stone) {
      if (touch) {
        const b = await page.locator("canvas").boundingBox();
        await page.touchscreen.tap(
          b.x + (stone.x * b.width) / 1280,
          b.y + (stone.y * b.height) / 720,
        );
      } else await page.keyboard.press("Space");
      await page.waitForTimeout(420);
    } else await page.waitForTimeout(16);
  }
  throw Error("No reachable timed stone opportunity");
}
