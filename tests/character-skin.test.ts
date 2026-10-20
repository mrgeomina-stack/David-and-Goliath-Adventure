import { describe, expect, it } from "vitest";
import { skinPoint, solveChain, type Chain } from "../src/character-skin";

describe("continuous painted character skin", () => {
  const source: Chain = {
    root: { x: 0, y: 0 },
    joint: { x: 0, y: 25 },
    end: { x: 0, y: 50 },
  };
  it("preserves every painted point in the bind pose", () => {
    for (let y = -5; y < 70; y += 2)
      for (let x = -8; x < 9; x += 2) {
        const p = { x, y };
        expect(skinPoint(p, source, source, 6)).toEqual(p);
      }
  });
  it("keeps both bones attached at a shared elbow for carry, reach and throw", () => {
    for (const end of [
      { x: 30, y: 15 },
      { x: -30, y: 15 },
      { x: 50, y: -10 },
      { x: 5, y: 49 },
    ]) {
      const posed = solveChain({ x: 0, y: 0 }, end, 25, 25, 1);
      const elbow = skinPoint(source.joint, source, posed, 6);
      expect(elbow.x).toBeCloseTo(posed.joint.x, 8);
      expect(elbow.y).toBeCloseTo(posed.joint.y, 8);
      const hand = skinPoint(source.end, source, posed, 6);
      expect(hand.x).toBeCloseTo(end.x, 8);
      expect(hand.y).toBeCloseTo(end.y, 8);
    }
  });
  it("reaches prop grips exactly without disconnected or non-finite joints", () => {
    for (const target of [
      { x: 0, y: 0 },
      { x: 100, y: 4 },
      { x: 5, y: -80 },
    ]) {
      const pose = solveChain({ x: 0, y: 0 }, target, 25, 25, -1);
      expect(Object.values(pose.joint).every(Number.isFinite)).toBe(true);
      expect(pose.end).toEqual(target);
    }
  });
  it("deforms continuously across the soft joint instead of separating cutouts", () => {
    const pose = solveChain({ x: 0, y: 0 }, { x: 35, y: 6 }, 25, 25, 1);
    let previous = skinPoint({ x: 4, y: 10 }, source, pose, 7);
    for (let y = 10.1; y < 40; y += 0.1) {
      const current = skinPoint({ x: 4, y }, source, pose, 7);
      expect(
        Math.hypot(current.x - previous.x, current.y - previous.y),
      ).toBeLessThan(0.4);
      previous = current;
    }
  });
});
