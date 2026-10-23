import { writeFileSync } from "node:fs";
/** Observe timeline state only; every transition uses a real key/button gesture. */
export async function watchStory(page, id) {
  const state = () => page.evaluate(() => window.adventureQA.snapshot());
  await page.waitForFunction(
    (id) => window.adventureQA.snapshot().interlude?.id === id,
    id,
  );
  const before = await state();
  if (!(await page.locator("#story-next").isDisabled()))
    throw Error("Story skipped before its animation");
  await page.keyboard.press("Space");
  if ((await state()).phase !== "interlude")
    throw Error("Early SPACE skipped story");
  await page.waitForTimeout(900);
  if (id === "jesse") {
    await page.click("#story-replay");
    if ((await state()).interlude.time > 0.3)
      throw Error("Story replay did not reset timeline");
    await page.click("#pause");
    const frozen = (await state()).interlude.time;
    await page.waitForTimeout(400);
    if ((await state()).interlude.time !== frozen)
      throw Error("Paused story advanced");
    await page.click("#modal-actions button:first-child");
  }
  await page.click("#language"); // English
  if (!(await page.locator("#story-ar").isHidden()))
    throw Error("English story kept Arabic block");
  await page.click("#language"); // Arabic
  if (!(await page.locator("#story-en").isHidden()))
    throw Error("Arabic story kept English block");
  await page.screenshot({ path: `qa/100-${id}-arabic.png` });
  await page.click("#language"); // Bilingual
  const shots = id === "jesse" ? [1, 4.5, 8.5, 12.5] : [2, 4.7, 8, 11, 14];
  for (let i = 0; i < shots.length; i++) {
    await page.waitForFunction(
      (time) => window.adventureQA.snapshot().interlude.time >= time,
      shots[i],
    );
    if (i === 2) {
      await page.setViewportSize({ width: 844, height: 390 });
      // The browser resize event and visualViewport callback run on the next frame.
      await page.waitForFunction(() => {
        const stage = document.getElementById("stage").getBoundingClientRect();
        return stage.width <= innerWidth + 1 && stage.height <= innerHeight + 1;
      });
      // Bilingual text and both controls must remain within the phone viewport.
      for (const selector of [
        ".story-caption",
        "#story-next",
        "#story-replay",
      ]) {
        const box = await page.locator(selector).boundingBox();
        if (
          box.x < 0 ||
          box.x + box.width > 845 ||
          box.y < 0 ||
          box.y + box.height > 391
        )
          throw Error(
            "Story control clipped on phone: " +
              selector +
              " " +
              JSON.stringify(box),
          );
        if (selector !== ".story-caption" && box.height < 43.5)
          throw Error("Story touch control below 44px: " + selector);
      }
    }
    await page.screenshot({ path: `qa/100-${id}-${i}.png` });
    if (i === 2) await page.setViewportSize({ width: 1280, height: 720 });
  }
  await page.waitForFunction(
    () => window.adventureQA.snapshot().interlude.ready,
  );
  // Timeline readiness can precede the next DOM sync by up to 100ms.
  await page.waitForFunction(
    () => !document.getElementById("story-next").disabled,
  );
  const after = await state();
  if (
    after.activityRemaining !== before.activityRemaining ||
    after.sheepRemaining !== before.sheepRemaining
  )
    throw Error("Story consumed gameplay countdown");
  if (after.audioEvents.complete !== before.audioEvents.complete)
    throw Error("Story awarded another victory");
  if (
    id === "goliath" &&
    (after.audioEvents.stomp !== 2 || after.audioEvents.giantLaugh !== 1)
  )
    throw Error("Giant stomp/laughter cues missing or repeated");
  if (id === "jesse") {
    await page.locator("#stage").focus();
    await page.keyboard.press("Space");
  } else {
    await page.locator("#story-next").tap();
  }
  await page.waitForFunction(
    () => window.adventureQA.snapshot().phase !== "interlude",
  );
  writeFileSync(
    `qa/interlude-${id}-1.12.0.json`,
    JSON.stringify(
      {
        passed: true,
        id,
        seconds: after.interlude.time,
        caption: after.interlude.caption,
        audio: after.audioEvents,
        activityRemaining: after.activityRemaining,
        earlySkipBlocked: true,
        replayAndPause: id === "jesse",
        phoneBounds: true,
      },
      null,
      2,
    ),
  );
}
