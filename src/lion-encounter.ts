import { clamp, lerp, type Point, type SheepModel } from "./model";
export type LionStage =
  | "idle"
  | "wander"
  | "seize"
  | "focus"
  | "rescue"
  | "rush"
  | "defend"
  | "guard"
  | "defeated"
  | "return"
  | "retry"
  | "done";
const smooth = (f: number) => {
  const t = clamp(f, 0, 1);
  return t * t * (3 - 2 * t);
};
const between = (a: Point, b: Point, t: number): Point => ({
  x: lerp(a.x, b.x, smooth(t)),
  y: lerp(a.y, b.y, smooth(t)),
});
/** A checkpointed encounter, independent of all other missions and their timers. */
export class LionEncounter {
  stage: LionStage = "idle";
  time = 0;
  total = 0;
  lambIndex = -1;
  misses = 0;
  checkpoint: "rescue" | "defend" = "rescue";
  origin: Point = { x: 0, y: 0 };
  lambOrigin: Point = { x: 0, y: 0 };
  lion: Point = { x: 1190, y: 302 };
  hero: Point = { x: 0, y: 0 };
  lamb: Point = { x: 0, y: 0 };
  rescued = false;
  constructor(public easy = true) {}
  get started() {
    return this.stage !== "idle";
  }
  get active() {
    return this.started && this.stage !== "done";
  }
  get timing() {
    return this.stage === "rescue" || this.stage === "defend";
  }
  get duration() {
    return 4.2;
  }
  get window() {
    return this.easy ? { start: 1.0, end: 3.1 } : { start: 1.25, end: 2.95 };
  }
  get inWindow() {
    return (
      this.timing &&
      this.time >= this.window.start &&
      this.time <= this.window.end
    );
  }
  get camera() {
    if (!this.started || this.stage === "done") return 0;
    const enter = smooth((this.total - 2.2) / 2.6);
    return this.stage === "return"
      ? enter * (1 - smooth(this.time / 4.8))
      : enter;
  }
  start(sheep: SheepModel) {
    if (this.started || sheep.count !== 4 || sheep.carriedIndex !== null)
      return false;
    // Four timed rescues are complete. Introduce one additional lamb only now.
    this.lambIndex = sheep.sheep.length;
    sheep.sheep.push({
      x: 850,
      y: 378,
      saved: false,
      carried: false,
      caught: false,
      phase: 12,
      startled: 0,
    });
    this.origin = { ...sheep.david };
    this.hero = { ...this.origin };
    this.lambOrigin = { ...sheep.sheep[this.lambIndex] };
    this.lamb = { ...this.lambOrigin };
    sheep.caughtIndex = null;
    sheep.sheep[this.lambIndex].caught = true;
    this.set("wander");
    return true;
  }
  private set(stage: LionStage) {
    this.stage = stage;
    this.time = 0;
  }
  press(): "hit" | "miss" | "retry" | null {
    if (this.stage === "retry") {
      this.set(this.checkpoint);
      return "retry";
    }
    if (!this.timing) return null;
    this.checkpoint = this.stage as "rescue" | "defend";
    if (!this.inWindow) {
      this.misses++;
      this.set("retry");
      return "miss";
    }
    if (this.stage === "rescue") {
      this.rescued = true;
      this.set("rush");
    } else this.set("guard");
    return "hit";
  }
  update(dt: number, sheep: SheepModel) {
    if (!this.active) return;
    this.time += dt;
    this.total += dt;
    const t = this.time;
    switch (this.stage) {
      case "wander":
        this.lamb = between(this.lambOrigin, { x: 985, y: 401 }, t / 2.4);
        if (t >= 2.4) this.set("seize");
        break;
      case "seize":
        this.lion = between({ x: 1190, y: 302 }, { x: 1020, y: 425 }, t / 1.8);
        this.lamb = between(
          { x: 985, y: 401 },
          { x: 966, y: 393 },
          Math.max(0, t - 1) / 0.8,
        );
        if (t >= 1.8) this.set("focus");
        break;
      case "focus":
        this.hero = between(this.origin, { x: 700, y: 510 }, t / 1.4);
        if (t >= 1.4) this.set("rescue");
        break;
      case "rescue":
      case "defend":
        if (t > this.duration) {
          this.checkpoint = this.stage;
          this.misses++;
          this.set("retry");
        }
        break;
      case "rush":
        this.hero = between({ x: 700, y: 510 }, { x: 924, y: 485 }, t / 0.85);
        if (t > 0.75) {
          const lift = clamp((t - 0.75) / 0.6, 0, 1);
          this.lamb = between(
            { x: 966, y: 393 },
            { x: this.hero.x - 18, y: this.hero.y - 72 },
            lift,
          );
          this.lamb.y -= Math.sin(lift * Math.PI) * 16;
        }
        if (t >= 1.5) this.set("defend");
        break;
      case "guard":
        this.lion = between({ x: 1020, y: 425 }, { x: 990, y: 488 }, t / 0.7);
        this.hero = {
          x: 924 - Math.sin(clamp(t / 1.3, 0, 1) * Math.PI) * 20,
          y: 485,
        };
        if (t >= 1.3) this.set("defeated");
        break;
      case "defeated":
        this.lion = between({ x: 990, y: 488 }, { x: 1060, y: 521 }, t / 1.4);
        if (t >= 1.7) this.set("return");
        break;
      case "return":
        this.lion = between({ x: 1060, y: 521 }, { x: 1220, y: 330 }, t / 3.5);
        this.hero =
          t < 2.5
            ? between({ x: 924, y: 485 }, { x: 450, y: 498 }, t / 2.5)
            : between({ x: 450, y: 498 }, { x: 225, y: 498 }, (t - 2.5) / 1.8);
        if (t >= 4.3)
          this.lamb = between(
            { x: this.hero.x + 18, y: this.hero.y - 72 },
            sheep.penSpot(this.lambIndex),
            (t - 4.3) / 0.7,
          );
        if (t >= 5) {
          Object.assign(
            sheep.sheep[this.lambIndex],
            sheep.penSpot(this.lambIndex),
            { saved: true, caught: false, carried: false },
          );
          this.set("done");
        }
        break;
    }
    if (
      this.rescued &&
      this.stage !== "rush" &&
      !(this.stage === "return" && this.time >= 4.3) &&
      this.stage !== "done"
    )
      this.lamb = {
        x: this.hero.x + (this.stage === "return" ? 18 : -18),
        y: this.hero.y - 72,
      };
    sheep.david = { ...this.hero };
  }
  snapshot() {
    return {
      stage: this.stage,
      time: this.time,
      lambIndex: this.lambIndex,
      misses: this.misses,
      checkpoint: this.checkpoint,
      inWindow: this.inWindow,
      window: this.window,
      duration: this.duration,
      camera: this.camera,
      hero: { ...this.hero },
      lion: { ...this.lion },
      lamb: { ...this.lamb },
      rescued: this.rescued,
    };
  }
}
