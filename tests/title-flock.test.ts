import { expect, it } from "vitest";
import { TITLE_DAVID, titleFlockAt } from "../src/title-flock";
it("keeps nine large cover sheep clear of the controls, grounded and depth sorted", () => {
  for (let t = 0; t < 120; t += 0.1) {
    const flock = titleFlockAt(t);
    expect(new Set(flock.map((s) => s.id)).size).toBe(9);
    for (const [i, s] of flock.entries()) {
      expect(s.height).toBeGreaterThan(145);
      expect(s.turnScale).toBeGreaterThanOrEqual(0.88);
      expect(s.x - s.height * 0.58).toBeGreaterThan(0);
      expect(s.x + s.height * 0.58).toBeLessThan(1280);
      expect(s.y).toBeLessThan(715);
      expect(s.y - s.height).toBeGreaterThan(410);
      if (i) expect(s.y).toBeGreaterThanOrEqual(flock[i - 1].y);
    }
  }
  expect(TITLE_DAVID.facing).toBe(-1);
});
it("walks continuously both ways and crosses David between front and back", () => {
  const history = Array.from({ length: 500 }, (_, i) => titleFlockAt(i * 0.1));
  for (let id = 0; id < 9; id++) {
    const poses = history.map((f) => f.find((s) => s.id === id)!);
    expect(poses.some((s) => s.facing === -1)).toBe(true);
    expect(poses.some((s) => s.facing === 1)).toBe(true);
    expect(poses.some((s) => !s.walking)).toBe(true);
    for (let i = 1; i < poses.length; i++)
      expect(
        Math.hypot(poses[i].x - poses[i - 1].x, poses[i].y - poses[i - 1].y),
      ).toBeLessThan(4);
  }
  for (const id of [0, 1]) {
    const poses = history.map((f) => f.find((s) => s.id === id)!);
    expect(poses.some((s) => s.y < TITLE_DAVID.y)).toBe(true);
    expect(poses.some((s) => s.y > TITLE_DAVID.y)).toBe(true);
  }
});
