import { describe, it, expect } from "vitest";
import { canvasPoint } from "../src/touch";
import { fittedScale, compactLayout } from "../src/mobile";
describe("mobile coordinates and fit", () => {
  for (const [w, h] of [
    [568, 320],
    [667, 375],
    [844, 390],
    [1024, 768],
    [1366, 1024],
  ])
    it(`fits ${w}×${h} without cropping world coordinates`, () => {
      const scale = fittedScale(w, h),
        width = 1280 * scale,
        height = 720 * scale,
        left = (w - width) / 2,
        top = (h - height) / 2;
      expect(width).toBeLessThanOrEqual(w + 0.01);
      expect(height).toBeLessThanOrEqual(h + 0.01);
      for (const p of [
        { x: 650, y: 227 },
        { x: 220, y: 482 },
        { x: 1045, y: 280 },
        { x: 215, y: 192 },
      ]) {
        const mapped = canvasPoint(
          { x: left + p.x * scale, y: top + p.y * scale },
          { left, top, width, height },
        );
        expect(mapped.x).toBeCloseTo(p.x);
        expect(mapped.y).toBeCloseTo(p.y);
      }
    });
  it("selects compact controls for landscape phones and smaller tablets", () => {
    expect(compactLayout(844, 390)).toBe(true);
    expect(compactLayout(1024, 768)).toBe(true);
  });
});
