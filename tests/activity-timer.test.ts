import { describe, it, expect } from "vitest";
import { ActivityTimer, countdownHue } from "../src/activity-timer";
describe("30-second activity countdown", () => {
  it("counts only active play and clamps at zero", () => {
    const timer = new ActivityTimer();
    expect(timer.remaining).toBe(30);
    timer.tick(7);
    timer.tick(15, false);
    expect(timer.remaining).toBe(23);
    timer.tick(100);
    expect(timer.remaining).toBe(0);
    timer.tick(-5);
    expect(timer.remaining).toBe(0);
  });
  it("leaves Free Play untimed and starts a fresh attempt at 30", () => {
    const free = new ActivityTimer(null);
    free.tick(999);
    expect(free.remaining).toBe(null);
    const retry = new ActivityTimer();
    expect(retry.remaining).toBe(30);
  });
  it("smoothly morphs from green to orange at 20 and red below 10", () => {
    expect(countdownHue(30)).toBe(140);
    expect(countdownHue(20)).toBe(32);
    expect(countdownHue(10)).toBe(0);
    expect(countdownHue(3)).toBe(0);
    expect(countdownHue(25)).toBeGreaterThan(countdownHue(20));
    expect(countdownHue(15)).toBeLessThan(countdownHue(20));
    expect(Math.abs(countdownHue(20.001) - countdownHue(19.999))).toBeLessThan(
      0.02,
    );
  });
});
