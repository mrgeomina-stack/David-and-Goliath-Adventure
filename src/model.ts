export type Point = { x: number; y: number };
export type Mission = "sheep" | "maze" | "armor" | "brook" | "sling";
export const ORDER: Mission[] = ["sheep", "maze", "armor", "brook", "sling"];
export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a: number, b: number, t: number) =>
  a + (b - a) * clamp(t, 0, 1);
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export type Maze = {
  cols: number;
  rows: number;
  edges: number[][];
  seed: number;
};
export function path(maze: Maze, start = 0, end = 62): number[] {
  const queue = [start],
    prev = new Map<number, number>([[start, -1]]);
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    if (c === end) break;
    for (const n of maze.edges[c])
      if (!prev.has(n)) {
        prev.set(n, c);
        queue.push(n);
      }
  }
  if (!prev.has(end)) return [];
  const result = [end];
  while (result[0] !== start) result.unshift(prev.get(result[0])!);
  return result;
}
export function createMaze(seed: number): Maze {
  for (let attempt = 0; attempt < 10000; attempt++) {
    const random = rng(seed + attempt),
      edges: number[][] = Array.from({ length: 63 }, () => []),
      stack = [0],
      seen = new Set([0]);
    while (stack.length) {
      const c = stack.at(-1)!,
        x = c % 9,
        y = Math.floor(c / 9);
      const options = [
        x > 0 ? c - 1 : -1,
        x < 8 ? c + 1 : -1,
        y > 0 ? c - 9 : -1,
        y < 6 ? c + 9 : -1,
      ].filter((n) => n >= 0 && !seen.has(n));
      if (!options.length) {
        stack.pop();
        continue;
      }
      const n = options[Math.floor(random() * options.length)];
      edges[c].push(n);
      edges[n].push(c);
      seen.add(n);
      stack.push(n);
    }
    const maze = { cols: 9, rows: 7, edges, seed: seed + attempt };
    const len = path(maze).length - 1;
    if (len >= 16 && len <= 22) return maze;
  }
  throw new Error("No suitable maze");
}
export class MazeModel {
  maze: Maze;
  cell = 0;
  from = 0;
  moveTime = 1;
  bumps = 0;
  complete = false;
  constructor(seed = 17) {
    this.maze = createMaze(seed);
  }
  move(dx: number, dy: number) {
    if (this.moveTime < 0.16 || this.complete) return false;
    const nx = (this.cell % 9) + dx,
      ny = Math.floor(this.cell / 9) + dy;
    const next = ny * 9 + nx;
    if (
      nx < 0 ||
      nx > 8 ||
      ny < 0 ||
      ny > 6 ||
      !this.maze.edges[this.cell].includes(next)
    ) {
      this.bumps++;
      return false;
    }
    this.from = this.cell;
    this.cell = next;
    this.moveTime = 0;
    return true;
  }
  update(dt: number) {
    this.moveTime += dt;
    if (this.cell === 62 && this.moveTime >= 0.16) this.complete = true;
  }
  get position(): Point {
    const t = clamp(this.moveTime / 0.16, 0, 1);
    return {
      x: lerp(this.from % 9, this.cell % 9, t),
      y: lerp(Math.floor(this.from / 9), Math.floor(this.cell / 9), t),
    };
  }
}
export type Gear = "tunic" | "mail" | "helmet" | "sword";
export const GEAR: Gear[] = ["tunic", "mail", "helmet", "sword"];
export const anchors: Record<Gear, Point> = {
  tunic: { x: 650, y: 395 },
  mail: { x: 650, y: 395 },
  helmet: { x: 650, y: 227 },
  sword: { x: 691, y: 441 },
};
// Distinct generous regions prevent a sword dropped on the chest being accepted.
export const gearZones: Record<
  Gear,
  { x: number; y: number; w: number; h: number }
> = {
  tunic: { x: 550, y: 340, w: 200, h: 80 },
  mail: { x: 550, y: 340, w: 200, h: 80 },
  helmet: { x: 550, y: 162, w: 200, h: 130 },
  sword: { x: 605, y: 421, w: 180, h: 104 },
};
export const trays: Record<Gear, Point> = {
  tunic: { x: 220, y: 280 },
  mail: { x: 1045, y: 280 },
  helmet: { x: 220, y: 482 },
  sword: { x: 1045, y: 482 },
};
export class ArmorModel {
  equipped = new Set<Gear>();
  fallTime = -1;
  sequences = 0;
  drop(item: Gear, p: Point) {
    if (this.equipped.has(item) || this.fallTime >= 0) return false;
    const z = gearZones[item];
    const valid =
      p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h;
    if (!valid) return false;
    this.equipped.add(item);
    if (this.equipped.size === 4) {
      this.fallTime = 0;
      this.sequences++;
    }
    return true;
  }
  update(dt: number) {
    if (this.fallTime >= 0) this.fallTime += dt;
  }
  get complete() {
    return this.fallTime >= 6.5;
  }
}
export const PEN = {
  x: 128,
  y: 410,
  w: 200,
  h: 158,
  gateTop: 458,
  gateBottom: 538,
};
export function penInside(p: Point) {
  return p.x > 146 && p.x < 305 && p.y > 428 && p.y < 550;
}
// Fences have one broad entrance on the right. The same test is used by David and sheep.
export function fieldBlocked(p: Point) {
  if (p.x < 95 || p.x > 1170 || p.y < 220 || p.y > 594) return true;
  const left = Math.abs(p.x - 128) < 18 && p.y > 395 && p.y < 584;
  const horizontal =
    (Math.abs(p.y - 410) < 18 || Math.abs(p.y - 568) < 18) &&
    p.x > 110 &&
    p.x < 345;
  const right =
    Math.abs(p.x - 328) < 18 &&
    p.y > 395 &&
    p.y < 584 &&
    (p.y < 458 || p.y > 538);
  return left || horizontal || right;
}
export function walk(
  p: Point,
  dx: number,
  dy: number,
  blocked: (p: Point) => boolean,
) {
  const x = { x: p.x + dx, y: p.y };
  if (!blocked(x)) p.x = x.x;
  const y = { x: p.x, y: p.y + dy };
  if (!blocked(y)) p.y = y.y;
}
export type Sheep = Point & {
  following: boolean;
  saved: boolean;
  phase: number;
  startled: number;
};
export class SheepModel {
  david: Point = { x: 480, y: 470 };
  sheep: Sheep[];
  lion: Point = { x: 1090, y: 340 };
  time = 0;
  called = 0;
  constructor(seed = 1) {
    const random = rng(seed);
    this.sheep = [
      { x: 650 + random() * 100, y: 340 + random() * 70 },
      { x: 830 + random() * 130, y: 490 + random() * 40 },
    ].map((p, i) => ({
      ...p,
      following: false,
      saved: false,
      phase: i * 3,
      startled: 0,
    }));
  }
  call() {
    let result = false;
    for (const s of this.sheep)
      if (!s.saved && distance(s, this.david) < 85) {
        s.following = true;
        result = true;
      }
    if (result) this.called++;
    return result;
  }
  update(dt: number, dir: Point) {
    this.time += dt;
    walk(this.david, dir.x * 190 * dt, dir.y * 190 * dt, fieldBlocked);
    const threat = distance(this.lion, this.david) < 185;
    const target = threat
      ? { x: 1130, y: 280 }
      : this.sheep.find((s) => !s.saved) || { x: 1110, y: 330 };
    const l = distance(target, this.lion);
    if (l > 4) {
      this.lion.x += ((target.x - this.lion.x) / l) * (threat ? 80 : 13) * dt;
      this.lion.y += ((target.y - this.lion.y) / l) * (threat ? 80 : 13) * dt;
    }
    for (const s of this.sheep) {
      if (s.saved) continue;
      s.startled = Math.max(0, s.startled - dt);
      const d = distance(s, this.david);
      if (distance(s, this.lion) < 72) {
        s.startled = 1.5;
        s.following = false;
        walk(s, -80 * dt, 30 * dt, fieldBlocked);
      } else if (s.following && d > 43) {
        walk(
          s,
          ((this.david.x - s.x) / d) * 150 * dt,
          ((this.david.y - s.y) / d) * 150 * dt,
          fieldBlocked,
        );
      } else if (!s.following) {
        walk(
          s,
          Math.cos(this.time * 0.7 + s.phase) * 9 * dt,
          Math.sin(this.time + s.phase) * 7 * dt,
          fieldBlocked,
        );
      }
      if (penInside(s)) {
        s.saved = true;
        s.following = false;
      }
    }
  }
  get count() {
    return this.sheep.filter((s) => s.saved).length;
  }
  get complete() {
    return this.count >= 2;
  }
}
export type Stone = Point & { smooth: boolean; collected: boolean; id: number };
export class BrookModel {
  stones: Stone[];
  ring = 230;
  row = 0;
  direction = 1;
  count = 0;
  cooldown = 0;
  time = 0;
  last: Stone | null = null;
  errorTime = 0;
  constructor(seed = 1) {
    const random = rng(seed);
    this.stones = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 230 + (i % 5) * 162 + (random() - 0.5) * 30,
      y: 335 + Math.floor(i / 5) * 145 + (random() - 0.5) * 22,
      smooth: ![2, 5, 8].includes(i),
      collected: false,
    }));
  }
  update(dt: number, easy = true) {
    this.time += dt;
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.errorTime = Math.max(0, this.errorTime - dt);
    this.ring += this.direction * (easy ? 155 : 215) * dt;
    if (this.ring > 1010) {
      this.ring = 1010;
      this.direction = -1;
      this.row = 1;
    }
    if (this.ring < 200) {
      this.ring = 200;
      this.direction = 1;
      this.row = 0;
    }
  }
  scoop(p?: Point) {
    if (this.cooldown || this.count === 5) return false;
    this.cooldown = 0.4;
    const target = p
      ? this.stones.find((s) => !s.collected && distance(s, p) < 50)
      : this.stones
          .filter(
            (s) =>
              !s.collected &&
              distance(s, { x: this.ring, y: 335 + this.row * 145 }) < 58,
          )
          .sort(
            (a, b) =>
              distance(a, { x: this.ring, y: 335 + this.row * 145 }) -
              distance(b, { x: this.ring, y: 335 + this.row * 145 }),
          )[0];
    if (!target || !target.smooth) {
      this.errorTime = 0.5;
      return false;
    }
    target.collected = true;
    this.last = target;
    this.count++;
    return true;
  }
  get complete() {
    return this.count === 5;
  }
}
export const SHOT = {
  origin: { x: 184, y: 513 },
  target: { x: 1000, y: 259 },
  radius: 43,
  gravity: 900,
  angle: (52 * Math.PI) / 180,
  minSpeed: 850,
  maxSpeed: 1130,
  maxCharge: 1.8,
};
export function flight(charge: number, t: number): Point {
  const speed = lerp(SHOT.minSpeed, SHOT.maxSpeed, charge / SHOT.maxCharge);
  return {
    x: SHOT.origin.x + Math.cos(SHOT.angle) * speed * t,
    y:
      SHOT.origin.y -
      Math.sin(SHOT.angle) * speed * t +
      0.5 * SHOT.gravity * t * t,
  };
}
export function segmentCircle(a: Point, b: Point, c: Point, r: number) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    len = dx * dx + dy * dy;
  const t = len ? clamp(((c.x - a.x) * dx + (c.y - a.y) * dy) / len, 0, 1) : 0;
  return distance({ x: a.x + dx * t, y: a.y + dy * t }, c) <= r;
}
export class SlingModel {
  charge = 0;
  charging = false;
  state: "ready" | "flying" | "hit" | "miss" = "ready";
  time = 0;
  stone: Point = { ...SHOT.origin };
  trail: Point[] = [];
  elapsed = 0;
  hold() {
    if (this.state === "ready") this.charging = true;
  }
  release() {
    if (!this.charging || this.state !== "ready") return false;
    this.charging = false;
    this.state = "flying";
    this.time = 0;
    return true;
  }
  cancel() {
    this.charging = false;
    if (this.state === "ready") this.charge = 0;
  }
  update(dt: number) {
    this.elapsed += dt;
    if (this.charging) this.charge = Math.min(SHOT.maxCharge, this.charge + dt);
    if (this.state !== "flying") return;
    const old = this.stone;
    this.time += dt;
    this.stone = flight(this.charge, this.time);
    this.trail.push({ ...this.stone });
    if (segmentCircle(old, this.stone, SHOT.target, SHOT.radius)) {
      this.state = "hit";
      return;
    }
    if (this.stone.y > 598 || this.stone.x > 1330) this.state = "miss";
  }
}
