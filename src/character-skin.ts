import { clamp, type Point } from "./model";

export type Chain = { root: Point; joint: Point; end: Point };
const length = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** Two-bone IK keeps the elbow connected, including gentle overreach for props. */
export function solveChain(
  root: Point,
  end: Point,
  upper: number,
  lower: number,
  bend: number,
): Chain {
  const distance = Math.max(0.001, length(root, end));
  const stretch = Math.max(1, distance / (upper + lower - 0.001));
  upper *= stretch;
  lower *= stretch;
  const along = clamp(
    (upper * upper - lower * lower + distance * distance) / (2 * distance),
    -upper,
    upper,
  );
  const across = Math.sqrt(Math.max(0, upper * upper - along * along)) * bend;
  const dx = (end.x - root.x) / distance,
    dy = (end.y - root.y) / distance;
  return {
    root,
    joint: {
      x: root.x + dx * along - dy * across,
      y: root.y + dy * along + dx * across,
    },
    end,
  };
}

function bonePoint(
  point: Point,
  a: Point,
  b: Point,
  x: Point,
  y: Point,
): Point {
  const sx = b.x - a.x,
    sy = b.y - a.y,
    dx = y.x - x.x,
    dy = y.y - x.y;
  const divisor = sx * sx + sy * sy;
  const u = (dx * sx + dy * sy) / divisor,
    v = (dy * sx - dx * sy) / divisor;
  return {
    x: x.x + u * (point.x - a.x) - v * (point.y - a.y),
    y: x.y + v * (point.x - a.x) + u * (point.y - a.y),
  };
}

/** Continuous texture skinning: both bones agree exactly at their shared joint. */
export function skinPoint(
  point: Point,
  source: Chain,
  pose: Chain,
  softness: number,
): Point {
  const dx = source.end.x - source.root.x,
    dy = source.end.y - source.root.y;
  const extent = Math.hypot(dx, dy);
  const along =
    ((point.x - source.joint.x) * dx + (point.y - source.joint.y) * dy) /
    extent;
  const weight = clamp((along + softness) / (2 * softness), 0, 1);
  const t = weight * weight * (3 - 2 * weight);
  const a = bonePoint(point, source.root, source.joint, pose.root, pose.joint);
  const b = bonePoint(point, source.joint, source.end, pose.joint, pose.end);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
