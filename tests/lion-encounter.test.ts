import { expect, it } from "vitest";
import { LionEncounter } from "../src/lion-encounter";
import { SheepModel, fieldBlocked, penInside } from "../src/model";
function checkpoint() {
  const s = new SheepModel(1);
  for (let i = 0; i < 4; i++)
    Object.assign(s.sheep[i], s.penSpot(i), { saved: true });
  s.david = { x: 225, y: 498 };
  const b = new LionEncounter();
  expect(b.start(s)).toBe(true);
  return { s, b };
}
function advance(b: LionEncounter, s: SheepModel, stage: string) {
  for (let i = 0; i < 2000 && b.stage !== stage; i++) b.update(0.02, s);
  expect(b.stage).toBe(stage);
}
it("starts only after four real rescues, introduces a fifth lamb and leaves the countdown unchanged", () => {
  const s = new SheepModel(),
    b = new LionEncounter();
  expect(b.start(s)).toBe(false);
  const c = checkpoint();
  expect(c.s.sheep).toHaveLength(5);
  expect(c.b.start(c.s)).toBe(false);
  const remaining = c.s.remaining;
  advance(c.b, c.s, "rescue");
  expect(c.s.count).toBe(4);
  expect(c.s.sheep.filter((s) => s.caught).length).toBe(1);
  expect(c.s.remaining).toBe(remaining);
  expect(c.b.press()).toBe("miss");
  expect(c.b.stage).toBe("retry");
  expect(c.s.count).toBe(4);
});
it("allows unlimited local early/timeout retries and checkpoints the second challenge after rescue", () => {
  const { s, b } = checkpoint();
  advance(b, s, "rescue");
  for (let i = 0; i < 25; i++) {
    expect(b.press()).toBe("miss");
    expect(b.press()).toBe("retry");
    expect(b.stage).toBe("rescue");
  }
  b.update(4.3, s);
  expect(b.stage).toBe("retry");
  b.press();
  b.update(1.6, s);
  expect(b.press()).toBe("hit");
  advance(b, s, "defend");
  expect(b.rescued).toBe(true);
  b.update(4.3, s);
  expect(b.checkpoint).toBe("defend");
  expect(b.stage).toBe("retry");
  b.press();
  expect(b.stage).toBe("defend");
  expect(b.rescued).toBe(true);
  expect(s.count).toBe(4);
});
it("requires two successful presses, then carries through the real pen entry before awarding sheep five", () => {
  const { s, b } = checkpoint();
  advance(b, s, "rescue");
  b.update(1.7, s);
  b.press();
  advance(b, s, "defend");
  expect(s.complete).toBe(false);
  b.update(1.7, s);
  b.press();
  advance(b, s, "return");
  for (let i = 0; i < 245; i++) {
    b.update(0.02, s);
    expect(fieldBlocked(s.david)).toBe(false);
    expect(s.count).toBe(4);
  }
  advance(b, s, "done");
  expect(s.count).toBe(5);
  expect(penInside(s.david)).toBe(true);
  expect(s.sheep[b.lambIndex].caught).toBe(false);
  expect(s.sheep[b.lambIndex].x).toBe(s.penSpot(b.lambIndex).x);
});
it("offers at least 1.7 seconds of green time in both difficulties and bounded smooth camera motion", () => {
  for (const easy of [true, false]) {
    const b = new LionEncounter(easy);
    expect(b.window.end - b.window.start).toBeGreaterThanOrEqual(1.7 - 1e-10);
  }
  const { s, b } = checkpoint();
  let before = 0;
  for (let i = 0; i < 280; i++) {
    b.update(0.02, s);
    expect(Math.abs(b.camera - before)).toBeLessThan(0.03);
    before = b.camera;
  }
});
