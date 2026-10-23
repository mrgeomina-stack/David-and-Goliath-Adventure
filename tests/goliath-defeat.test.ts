import { expect, it } from "vitest";
import {
  goliathDefeatAt,
  GOLIATH_DIZZY,
  GOLIATH_LANDING,
} from "../src/goliath-defeat";

it("shows a hit and a frozen shock before a readable 0.6-second dizzy beat", () => {
  expect(goliathDefeatAt(0).stage).toBe("hit");
  const first = goliathDefeatAt(0.12),
    last = goliathDefeatAt(0.25);
  expect(first.stage).toBe("shock");
  expect(last.stage).toBe("shock");
  expect(first.wobble).toBe(last.wobble);
  expect(first.pitch).toBe(last.pitch);
  expect(GOLIATH_DIZZY.end - GOLIATH_DIZZY.start).toBeCloseTo(0.6);
  expect(goliathDefeatAt(0.32).dizzy).toBe(true);
  expect(goliathDefeatAt(0.32).wobble).not.toBe(0);
  expect(goliathDefeatAt(0.87).dizzy).toBe(false);
});
it("progresses only from stagger/dizzy into forward pitch, descent and prone", () => {
  expect(
    [0.01, 0.15, 0.5, 0.95, 1.1, 1.24, 1.36, 1.5, 1.59, 1.7].map(
      (t) => goliathDefeatAt(t).stage,
    ),
  ).toEqual([
    "hit",
    "shock",
    "dizzy",
    "pitch",
    "lean",
    "stumble",
    "airborne",
    "descent",
    "near-ground",
    "prone",
  ]);
  expect(goliathDefeatAt(0.87).pitch).toBeLessThan(goliathDefeatAt(1.04).pitch);
  expect(goliathDefeatAt(GOLIATH_LANDING - 0.001).grounded).toBe(false);
  expect(goliathDefeatAt(GOLIATH_LANDING).grounded).toBe(true);
});
it("holds the final face-down pose without looping or drifting back to upright", () => {
  for (const t of [GOLIATH_LANDING, 2, 3, 30, 1000]) {
    const pose = goliathDefeatAt(t);
    expect(pose.stage).toBe("prone");
    expect(pose.pose).toBe(5);
    expect(pose.wobble).toBe(0);
  }
  expect(goliathDefeatAt(-10).stage).toBe("hit");
});
