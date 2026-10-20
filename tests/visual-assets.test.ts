import { describe, expect, it } from "vitest";
import {
  placedAnchor,
  rootForAnchor,
  visualManifest,
  visualAnimations,
} from "../src/visual-assets";
import { deliveryAt } from "../src/food";
import { SHOT } from "../src/model";

describe("supplied artwork coordinate contract", () => {
  const giant = visualManifest.assets.find((a) => a.id === "goliath_idle")!;
  it("fits both Goliath's authored feet and forehead to the unchanged world geometry", () => {
    const forehead = giant.anchors!.forehead;
    const scale = (590 - SHOT.target.y) / (giant.pivot.y - forehead.y);
    const root = rootForAnchor(giant, SHOT.target, scale, forehead);
    expect(root.y).toBeCloseTo(590);
    expect(placedAnchor(giant, root, scale, forehead)).toEqual(SHOT.target);
    expect(placedAnchor(giant, root, scale, giant.pivot)).toEqual(root);
    expect(SHOT.origin).toEqual({ x: 184, y: 513 });
  });
  it("mirrors about the authored feet pivot and mirrors attachment offsets", () => {
    const david = visualManifest.assets.find((a) => a.id === "david_idle")!;
    const root = { x: 300, y: 500 };
    expect(placedAnchor(david, root, 0.5, david.pivot, true)).toEqual(root);
    const hand = david.anchors!.rightHand;
    const right = placedAnchor(david, root, 0.5, hand),
      left = placedAnchor(david, root, 0.5, hand, true);
    expect(right.x - root.x).toBeCloseTo(root.x - left.x);
    expect(left.y).toEqual(right.y);
  });
  it("retains provisional status and resolves every supplied animation frame", () => {
    const assets = new Map(visualManifest.assets.map((a) => [a.id, a]));
    for (const anim of Object.values(visualAnimations)) {
      expect(anim.frames.every((id) => assets.has(id))).toBe(true);
      if (anim.durationsMs)
        expect(anim.durationsMs).toHaveLength(anim.frames.length);
      if (anim.status === "provisional")
        for (const id of anim.frames)
          expect(assets.get(id)!.status).toBe("provisional");
    }
  });
});
describe("single basket handover", () => {
  it("overlaps both actors' support before David releases the one basket", () => {
    expect(deliveryAt(0).owner).toBe("david");
    expect(deliveryAt(2.15)).toMatchObject({
      owner: "shared",
      davidHolding: true,
      brotherReach: 1,
    });
    expect(deliveryAt(2.3)).toMatchObject({
      owner: "brother",
      davidHolding: false,
      brotherReach: 1,
    });
    expect(deliveryAt(4).basket).toEqual(deliveryAt(2.3).basket);
  });
  it("keeps the basket continuous at every ownership/approach boundary", () => {
    for (const t of [0.8, 1.8, 2.05, 2.3]) {
      const before = deliveryAt(t - 1e-6).basket,
        after = deliveryAt(t + 1e-6).basket;
      expect(Math.hypot(before.x - after.x, before.y - after.y)).toBeLessThan(
        0.001,
      );
    }
  });
});
