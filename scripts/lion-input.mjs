/** Only real player inputs; the QA snapshot is used solely to observe the cue. */
export async function playLionEncounter(page) {
  for (const stage of ["rescue", "defend"]) {
    await page.waitForFunction((stage) => {
      const b = window.adventureQA.snapshot().lionEncounter;
      return b.stage === stage && b.inWindow;
    }, stage);
    const box = await page.locator("#action").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
  }
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase === "success",
  );
}
