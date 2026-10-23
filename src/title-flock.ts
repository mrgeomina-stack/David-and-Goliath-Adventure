/** Decorative cover actors only. Rescue sheep and their collision model are unchanged. */
const paths = [
  { x: 1030, y: 647, rx: 114, ry: 37, period: 27, phase: 0.4 },
  { x: 854, y: 646, rx: 122, ry: 39, period: 33, phase: 2.2 },
  { x: 1134, y: 590, rx: 34, ry: 14, period: 23, phase: 1.8 },
  { x: 703, y: 583, rx: 63, ry: 14, period: 29, phase: 3.1 },
  { x: 507, y: 622, rx: 79, ry: 12, period: 31, phase: 0.8 },
  { x: 248, y: 623, rx: 69, ry: 16, period: 26, phase: 1.1 },
  { x: 435, y: 690, rx: 98, ry: 8, period: 37, phase: 2.4 },
  { x: 682, y: 693, rx: 68, ry: 9, period: 28, phase: 0.1 },
  { x: 1100, y: 699, rx: 45, ry: 7, period: 35, phase: 1.5 },
];
export const TITLE_DAVID = { x: 934, y: 665, scale: 2.9, facing: -1 as const };
export function titleFlockAt(time: number) {
  return paths
    .map((path, id) => {
      const omega = (2 * Math.PI) / path.period;
      const angle = time * omega + path.phase;
      const velocity = -path.rx * omega * Math.sin(angle);
      const y = path.y + path.ry * Math.sin(angle);
      return {
        id,
        x: path.x + path.rx * Math.cos(angle),
        y,
        height: 160 + (y - 590) * 0.5,
        facing: velocity < 0 ? (-1 as const) : (1 as const),
        // Narrow briefly at the slow turn, instead of snapping a full-width sprite.
        turnScale: Math.max(0.88, Math.min(1, Math.abs(velocity) / 3.2)),
        walking: Math.abs(velocity) > 2.4,
        gaitTime: time * 0.7 + id * 0.37,
        bob:
          Math.sin(time * 5.6 + id * 1.7) *
          Math.min(1.3, Math.abs(velocity) * 0.06),
      };
    })
    .sort((a, b) => a.y - b.y || a.id - b.id);
}
