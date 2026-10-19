import { describe, it, expect } from "vitest";
import {
  createMaze,
  path,
  MazeModel,
  ArmorModel,
  GEAR,
  anchors,
  BrookModel,
  SlingModel,
  segmentCircle,
  SheepModel,
  fieldBlocked,
  penInside,
} from "../src/model";
describe("maze", () => {
  it("200 seeds are connected trees, have decisions, 16–22-step solutions", () => {
    for (let seed = 0; seed < 200; seed++) {
      const m = createMaze(seed);
      expect(path(m).length).toBeGreaterThanOrEqual(17);
      expect(path(m).length).toBeLessThanOrEqual(23);
      expect(m.edges.flat().length).toBe(124);
      expect(m.edges.filter((e) => e.length === 1).length).toBeGreaterThan(3);
      for (let end = 0; end < 63; end++)
        expect(path(m, 0, end).length).toBeGreaterThan(0);
    }
  });
  it("blocks walls; only arrival at goal wins", () => {
    const m = new MazeModel();
    expect(m.move(-1, 0)).toBe(false);
    expect(m.complete).toBe(false);
    for (const n of path(m.maze).slice(1)) {
      const c = m.cell;
      expect(
        m.move((n % 9) - (c % 9), Math.floor(n / 9) - Math.floor(c / 9)),
      ).toBe(true);
      expect(m.complete).toBe(false);
      m.update(0.17);
    }
    expect(m.complete).toBe(true);
  });
});
describe("armor", () => {
  it("rejects wrong zones and duplicate drops; all 4 trigger one full sequence", () => {
    const m = new ArmorModel();
    expect(m.drop("helmet", anchors.sword)).toBe(false);
    for (const item of GEAR.slice(0, 3))
      expect(m.drop(item, anchors[item])).toBe(true);
    expect(m.fallTime).toBe(-1);
    m.drop("sword", anchors.sword);
    expect(m.sequences).toBe(1);
    expect(m.drop("sword", anchors.sword)).toBe(false);
    m.update(6.4);
    expect(m.complete).toBe(false);
    m.update(0.11);
    expect(m.complete).toBe(true);
  });
});
describe("brook", () => {
  it("counts five unique smooth stones only, errors cannot progress", () => {
    const b = new BrookModel();
    expect(b.scoop({ x: 0, y: 0 })).toBe(false);
    b.update(1);
    expect(b.scoop(b.stones.find((s) => !s.smooth))).toBe(false);
    for (const s of b.stones.filter((s) => s.smooth).slice(0, 5)) {
      b.update(1);
      expect(b.scoop(s)).toBe(true);
      b.update(1);
      expect(b.scoop(s)).toBe(false);
    }
    expect(b.count).toBe(5);
    expect(b.complete).toBe(true);
    expect(new BrookModel().count).toBe(0);
  });
});
describe("sheep rescue", () => {
  it("lifts only one nearby sheep, blocks movement during lifting, and requires pen delivery", () => {
    const s = new SheepModel();
    expect(s.sheep).toHaveLength(4);
    expect(s.pickup()).toBe(false);
    s.david = { x: s.sheep[0].x - 30, y: s.sheep[0].y };
    expect(s.pickup()).toBe(true);
    expect(s.pickup()).toBe(false);
    expect(s.sheep.filter((a) => a.carried)).toHaveLength(1);
    const x = s.david.x;
    s.update(0.1, { x: 1, y: 0 });
    expect(s.david.x).toBe(x);
    expect(s.count).toBe(0);
    for (let i = 0; i < 40; i++) s.update(1 / 60, { x: 0, y: 0 });
    expect(s.liftProgress).toBe(1);
    expect(s.count).toBe(0);
    expect(fieldBlocked({ x: 328, y: 440 })).toBe(true);
    expect(fieldBlocked({ x: 328, y: 497 })).toBe(false);
    s.david = { x: 225, y: 498 };
    for (let i = 0; i < 30; i++) s.update(1 / 60, { x: 0, y: 0 });
    expect(s.count).toBe(1);
    expect(s.carried).toBe(null);
    expect(s.complete).toBe(false);
  });
  it("allows four real round trips across varied starts within Normal's deadline", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const s = new SheepModel(seed, 90);
      const moveTo = (target: { x: number; y: number }) => {
        for (let frame = 0; frame < 900; frame++) {
          const dx = target.x - s.david.x,
            dy = target.y - s.david.y,
            d = Math.hypot(dx, dy);
          if (d < 4 || s.complete) return;
          s.update(1 / 60, { x: dx / d, y: dy / d });
          expect(s.caughtIndex).toBe(null);
        }
        throw Error("Route blocked");
      };
      for (let index = 0; index < 4; index++) {
        if (index) moveTo({ x: 430, y: 498 });
        const sheep = s.sheep[index];
        moveTo({ x: sheep.x - 25, y: sheep.y });
        expect(s.pickup()).toBe(true);
        for (let i = 0; i < 35; i++) s.update(1 / 60, { x: 0, y: 0 });
        moveTo({ x: 430, y: 498 });
        moveTo({ x: 225, y: 498 });
        for (let i = 0; i < 30; i++) s.update(1 / 60, { x: 0, y: 0 });
        expect(s.count).toBe(index + 1);
      }
      expect(s.complete).toBe(true);
      expect(s.time).toBeLessThan(50);
    }
  });
  it("starts a real lion pursuit at zero and catches an unprotected sheep", () => {
    const s = new SheepModel(1, 2);
    s.lion = { x: s.sheep[0].x + 10, y: s.sheep[0].y };
    s.update(0.1, { x: 0, y: 0 });
    expect(s.caughtIndex).toBe(null);
    for (let i = 0; i < 600 && s.caughtIndex === null; i++)
      s.update(1 / 60, { x: 0, y: 0 });
    expect(s.remaining).toBe(0);
    expect(s.hunting).toBe(true);
    expect(s.caughtIndex).not.toBe(null);
    expect(s.sheep.filter((a) => a.caught)).toHaveLength(1);
    expect(s.count).toBe(0);
    const time = s.time;
    s.update(1, { x: 1, y: 0 });
    expect(s.time).toBe(time);
  });
  it("keeps delivered sheep safe, and free play never starts a chase", () => {
    const s = new SheepModel(1, 1);
    s.sheep[0].saved = true;
    s.lion = { ...s.sheep[0] };
    for (let i = 0; i < 100; i++) s.update(1 / 60, { x: 0, y: 0 });
    expect(s.sheep[0].caught).toBe(false);
    const free = new SheepModel(1, null);
    for (let i = 0; i < 20000; i++) free.update(1 / 60, { x: 0, y: 0 });
    expect(free.remaining).toBe(null);
    expect(free.hunting).toBe(false);
    expect(free.caughtIndex).toBe(null);
  });
});
describe("sling", () => {
  for (const fps of [30, 60, 120])
    it(`real low / ideal / high flight at ${fps}fps`, () => {
      for (const [charge, expected] of [
        [0, "miss"],
        [0.96, "hit"],
        [1.8, "miss"],
      ] as const) {
        const s = new SlingModel();
        s.hold();
        s.charge = charge;
        s.release();
        for (let i = 0; i < fps * 5 && s.state === "flying"; i++)
          s.update(1 / fps);
        expect(s.state).toBe(expected);
      }
    });
  it("sweeps fast segments and cannot win without launching", () => {
    expect(
      segmentCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 0 }, 3),
    ).toBe(true);
    const s = new SlingModel();
    s.update(20);
    expect(s.state).toBe("ready");
    s.hold();
    s.cancel();
    expect(s.release()).toBe(false);
  });
});

describe("pause and timed pickups", () => {
  it("cancel on focus loss clears windup but never changes a launched trajectory", () => {
    const s = new SlingModel();
    s.hold();
    s.update(0.96);
    s.release();
    s.update(0.5);
    const charge = s.charge;
    s.cancel();
    expect(s.charge).toBe(charge);
    for (let i = 0; i < 100 && s.state === "flying"; i++) s.update(1 / 60);
    expect(s.state).toBe("hit");
  });
  it("SPACE scoop uses a real 2D ring radius and misses other rows", () => {
    const b = new BrookModel();
    b.ring = b.stones[0].x;
    b.row = 1;
    expect(b.scoop()).toBe(false);
    b.update(0.5);
    b.ring = b.stones[0].x;
    b.row = 0;
    expect(b.scoop()).toBe(true);
    expect(b.count).toBe(1);
  });
});

describe("ballistic calibration", () => {
  it("keeps the forgiving hit window within 0.3–0.5 seconds", () => {
    const hits: number[] = [];
    for (let charge = 0; charge <= 1.8; charge += 0.01) {
      const s = new SlingModel();
      s.hold();
      s.charge = charge;
      s.release();
      for (let t = 0; t < 600 && s.state === "flying"; t++) s.update(1 / 120);
      if (s.state === "hit") hits.push(charge);
    }
    const window = hits.at(-1)! - hits[0];
    expect(window).toBeGreaterThanOrEqual(0.3);
    expect(window).toBeLessThanOrEqual(0.5);
  });
  it("same launch reaches the same world coordinates at 30/60/120fps", () => {
    const points = [30, 60, 120].map((fps) => {
      const s = new SlingModel();
      s.hold();
      s.charge = 0.96;
      s.release();
      for (let i = 0; i < fps; i++) s.update(1 / fps);
      return s.stone;
    });
    for (const p of points) {
      expect(p.x).toBeCloseTo(points[0].x, 7);
      expect(p.y).toBeCloseTo(points[0].y, 7);
    }
  });
});

it("keeps head, chest and waist equipment zones anatomically distinct", () => {
  expect(new ArmorModel().drop("sword", anchors.mail)).toBe(false);
  expect(new ArmorModel().drop("tunic", anchors.sword)).toBe(false);
  expect(new ArmorModel().drop("mail", anchors.helmet)).toBe(false);
  expect(new ArmorModel().drop("helmet", anchors.tunic)).toBe(false);
});
