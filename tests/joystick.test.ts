import { describe, expect, it } from "vitest";
import { stickVector } from "../src/joystick";
import { SheepModel } from "../src/model";

describe("thumb steering", () => {
  it("ignores centre jitter and normalizes diagonal and far-out drags", () => {
    expect(stickVector(2, -2, 30)).toEqual({ x: 0, y: 0 });
    expect(stickVector(0, 0, 0)).toEqual({ x: 0, y: 0 });
    expect(stickVector(-70, 0, 30)).toEqual({ x: -1, y: 0 });
    const d = stickVector(200, 200, 30);
    expect(Math.hypot(d.x, d.y)).toBeCloseTo(1);
    expect(d.x).toBeCloseTo(Math.SQRT1_2);
  });
  it("lifts the tapped nearby sheep rather than a different nearer sheep", () => {
    const model = new SheepModel(1, null);
    model.david = { x: 500, y: 300 };
    Object.assign(model.sheep[0], { x: 510, y: 300 });
    Object.assign(model.sheep[1], { x: 550, y: 300 });
    expect(model.pickup(1)).toBe(true);
    expect(model.carriedIndex).toBe(1);
  });
  it("never remotely lifts a tapped sheep outside the existing reach", () => {
    const model = new SheepModel(1, null);
    Object.assign(model.sheep[0], { x: model.david.x + 100, y: model.david.y });
    expect(model.pickup(0)).toBe(false);
    expect(model.carriedIndex).toBe(null);
  });
});
