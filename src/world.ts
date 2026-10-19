import Phaser from "phaser";
import {
  MazeModel,
  ArmorModel,
  SheepModel,
  BrookModel,
  SlingModel,
  ORDER,
  GEAR,
  anchors,
  gearZones,
  trays,
  path,
  rng,
  clamp,
  lerp,
  distance,
  type Mission,
  type Point,
  type Gear,
} from "./model";
import * as A from "./art";
import landscapeUrl from "./assets/countryside.png";
import heroUrl from "./assets/david-hero.png";
import { MAZE, cover, motes, mazeBackdrop } from "./scenery";
export { MAZE } from "./scenery";
import { missionHints, type Language } from "./strings";
import type { Sound } from "./audio";
export type Phase = "title" | "play" | "success" | "encounter" | "victory";
export interface Hooks {
  changed: () => void;
  toast: (s: string) => void;
  sound: Sound;
}
export class World extends Phaser.Scene {
  ready = false;
  phase: Phase = "title";
  mission: Mission = "maze";
  maze = new MazeModel();
  armor = new ArmorModel();
  sheep = new SheepModel();
  brook = new BrookModel();
  sling = new SlingModel();
  lang: Language = "both";
  failed = false;
  paused = false;
  easy = true;
  free = false;
  clock = 0;
  successTime = 0;
  tutorialTime = 0;
  hintTime = 0;
  moveWait = 0;
  seed = 17;
  run = 0;
  stepDir: Point = { x: 0, y: 0 };
  held = new Set<string>();
  bumpTime = 0;
  bumpDir: Point = { x: 0, y: 0 };
  gearTween: {
    item: Gear;
    from: Point;
    to: Point;
    remaining: number;
    success: boolean;
  } | null = null;
  private debug =
    import.meta.env.DEV && new URL(location.href).searchParams.has("debug");
  drag: { item: Gear; p: Point } | null = null;
  selected: Gear | null = null;
  wrong: Gear | null = null;
  wrongTime = 0;
  encounterX = 210;
  heard = false;
  heardTime = 0;
  practice = false;
  private landscape!: HTMLImageElement;
  private hero!: HTMLImageElement;
  private mazePainting: HTMLCanvasElement | null = null;
  private mazePaintingSeed = -1;
  private deliveryCheered = false;
  private texture!: Phaser.Textures.CanvasTexture;
  private c!: CanvasRenderingContext2D;
  constructor(public hooks: Hooks) {
    super("Adventure");
  }
  preload() {
    this.load.image("painted-landscape", landscapeUrl);
    this.load.image("painted-david", heroUrl);
  }
  create() {
    this.landscape = this.textures
      .get("painted-landscape")
      .getSourceImage() as HTMLImageElement;
    this.hero = this.textures
      .get("painted-david")
      .getSourceImage() as HTMLImageElement;
    this.texture = this.textures.createCanvas("painted-world", 1280, 720)!;
    this.c = this.texture.context;
    this.add.image(0, 0, "painted-world").setOrigin(0);
    this.input.keyboard!.addCapture(["UP", "DOWN", "LEFT", "RIGHT", "SPACE"]);
    this.input.keyboard!.on("keydown", (e: KeyboardEvent) => {
      if (e.repeat || this.paused) return;
      this.held.add(e.code);
      if (e.code === "Space") this.action(true);
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(e.code)
      )
        this.tutorialTime = 0;
    });
    this.input.keyboard!.on("keyup", (e: KeyboardEvent) => {
      this.held.delete(e.code);
      if (e.code === "Space") this.action(false);
    });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) =>
      this.pointerDown({ x: p.x, y: p.y }),
    );
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (this.drag) this.drag.p = { x: p.x, y: p.y };
    });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) =>
      this.pointerUp({ x: p.x, y: p.y }),
    );
    this.ready = true;
    this.hooks.changed();
  }
  start(mission: Mission = "sheep", practice = false) {
    this.clearInput();
    this.mission = mission;
    this.practice = practice;
    this.phase = "play";
    this.failed = false;
    this.successTime = 0;
    this.deliveryCheered = false;
    this.hintTime = 0;
    this.tutorialTime = 2.5;
    this.moveWait = 0;
    this.run++;
    this.maze = new MazeModel(this.seed + this.run * 41);
    this.armor = new ArmorModel();
    this.sheep = new SheepModel(this.run);
    this.brook = new BrookModel(this.run);
    this.sling = new SlingModel();
    this.paused = false;
    this.hooks.changed();
  }
  clearInput() {
    this.held.clear();
    this.stepDir = { x: 0, y: 0 };
    this.drag = null;
    this.gearTween = null;
    this.selected = null;
    this.sling.cancel();
  }
  setPaused(value: boolean) {
    this.paused = value;
    this.clearInput();
    this.hooks.changed();
  }
  /** A brief touch/click must register even if pointerup precedes the next frame. */
  pressDirection(dir: Point) {
    if (this.paused || this.failed) return;
    this.stepDir = dir;
    this.tutorialTime = 0;
    if (this.phase === "play" && this.mission === "maze" && this.moveWait <= 0)
      this.stepMaze(dir);
  }
  private stepMaze(dir: Point) {
    const moved = this.maze.move(
      Math.abs(dir.x) >= Math.abs(dir.y) ? Math.sign(dir.x) : 0,
      Math.abs(dir.y) > Math.abs(dir.x) ? Math.sign(dir.y) : 0,
    );
    this.moveWait = moved ? 0.18 : 0.22;
    if (!moved) {
      this.hooks.sound.play("wall");
      this.bumpTime = 0.18;
      this.bumpDir = dir;
    }
  }
  action(down: boolean) {
    if (this.paused || this.phase !== "play") return;
    this.tutorialTime = 0;
    if (this.mission === "sling") {
      if (down) this.sling.hold();
      else {
        if (this.sling.release()) this.hooks.sound.play("launch");
      }
    }
    if (!down) return;
    if (this.mission === "sheep") {
      this.hooks.sound.play(this.sheep.call() ? "call" : "wall");
    }
    if (this.mission === "brook") this.scoop();
  }
  pointerDown(p: Point) {
    if (this.paused || this.phase !== "play") return;
    this.tutorialTime = 0;
    if (this.mission === "brook") this.scoop(p);
    if (this.mission === "armor") {
      if (this.selected) {
        this.drop(this.selected, p);
        this.selected = null;
        return;
      }
      const item = GEAR.find(
        (i) => !this.armor.equipped.has(i) && distance(p, trays[i]) < 83,
      );
      if (item) {
        this.drag = { item, p };
        this.selected = item;
      }
    }
  }
  pointerUp(p: Point) {
    if (!this.drag) return;
    const d = this.drag;
    if (distance(p, trays[d.item]) > 20) {
      this.drop(d.item, p);
      this.selected = null;
    }
    this.drag = null;
  }
  drop(item: Gear, p: Point) {
    const success = this.armor.drop(item, p);
    this.gearTween = {
      item,
      from: { ...p },
      to: success ? anchors[item] : trays[item],
      remaining: 0.2,
      success,
    };
    if (success) {
      this.hooks.sound.play("metal");
      this.hooks.changed();
    } else {
      this.wrong = item;
      this.wrongTime = 0.5;
      this.hooks.sound.play("wall");
    }
  }
  scoop(p?: Point) {
    const ok = this.brook.scoop(p);
    this.hooks.sound.play(ok ? "plop" : "wall");
    this.hooks.changed();
  }
  hint() {
    this.hintTime = 3.5;
    const [ar, en] = missionHints[this.mission];
    this.hooks.toast(this.lang === "both" ? `${ar} / ${en}` : this.say(en, ar));
  }

  finish() {
    if (this.phase !== "play") return;
    this.phase = "success";
    this.successTime = 0;
    this.deliveryCheered = false;
    this.clearInput();
    if (this.mission !== "maze") this.hooks.sound.play("win");
    this.hooks.changed();
  }
  continue() {
    if (this.phase === "encounter" && this.heard) {
      this.start("armor", this.practice);
      return;
    }
    if (this.phase !== "success" || this.successTime < this.payoffDuration)
      return;
    if (this.mission === "maze" && !this.practice) {
      this.phase = "encounter";
      this.encounterX = 210;
      this.heard = false;
      this.heardTime = 0;
      this.clearInput();
      this.hooks.changed();
      return;
    }
    if (this.mission === "sling") {
      this.phase = "victory";
      this.hooks.changed();
      return;
    }
    if (this.practice) {
      this.phase = "title";
      this.hooks.changed();
      return;
    }
    this.start(ORDER[ORDER.indexOf(this.mission) + 1]);
  }
  get payoffDuration() {
    return this.mission === "maze" ? 4 : this.mission === "sling" ? 3 : 2.5;
  }
  get dir() {
    let x = this.stepDir.x,
      y = this.stepDir.y;
    if (this.held.has("ArrowLeft") || this.held.has("KeyA")) x = -1;
    if (this.held.has("ArrowRight") || this.held.has("KeyD")) x = 1;
    if (this.held.has("ArrowUp") || this.held.has("KeyW")) y = -1;
    if (this.held.has("ArrowDown") || this.held.has("KeyS")) y = 1;
    const l = Math.hypot(x, y);
    return l ? { x: x / l, y: y / l } : { x: 0, y: 0 };
  }
  update(_time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.05);
    if (!this.paused) {
      this.clock += dt;
      this.hintTime = Math.max(0, this.hintTime - dt);
      this.wrongTime = Math.max(0, this.wrongTime - dt);
      this.bumpTime = Math.max(0, this.bumpTime - dt);
      if (this.gearTween) {
        this.gearTween.remaining -= dt;
        if (this.gearTween.remaining <= 0) this.gearTween = null;
      }
      this.tutorialTime = Math.max(0, this.tutorialTime - dt);
      if (this.phase === "success") {
        this.successTime += dt;
        if (
          this.mission === "maze" &&
          !this.deliveryCheered &&
          this.successTime >= 2.55
        ) {
          this.deliveryCheered = true;
          this.hooks.sound.play("win");
        }
      }
      if (this.phase === "encounter") {
        this.encounterX = clamp(
          this.encounterX + this.dir.x * 210 * dt,
          150,
          730,
        );
        if (this.encounterX > 660 && !this.heard) {
          this.heard = true;
          this.heardTime = 0;
          this.hooks.sound.play("metal");
          this.hooks.changed();
        }
        if (this.heard) {
          this.heardTime += dt;
          if (this.encounterX < 270 && this.heardTime > 1) this.start("armor");
        }
      }
      if (this.phase === "play" && !this.failed) {
        const dir = this.dir;
        if (this.mission === "maze") {
          this.maze.update(dt);
          this.moveWait -= dt;
          if (this.moveWait <= 0 && (dir.x || dir.y)) {
            this.stepMaze(dir);
          }
          if (this.maze.complete) this.finish();
        }
        if (this.mission === "armor") {
          const before = this.armor.fallTime;
          this.armor.update(dt);
          if (before < 2.8 && this.armor.fallTime >= 2.8)
            this.hooks.sound.play("wall");
          if (this.armor.complete) this.finish();
        }
        if (this.mission === "sheep") {
          const count = this.sheep.count;
          this.sheep.update(dt, dir);
          if (this.sheep.count > count) {
            this.hooks.sound.play("win");
            this.hooks.changed();
          }
          if (this.sheep.complete) this.finish();
          else if (this.sheep.time > 100 && !this.free) {
            this.failed = true;
            this.clearInput();
            this.hooks.changed();
          }
        }
        if (this.mission === "brook") {
          this.brook.update(dt, this.easy);
          if (this.brook.complete && this.brook.cooldown === 0) this.finish();
        }
        if (this.mission === "sling") {
          if (
            this.sling.charging &&
            Math.floor(this.clock * 8) !== Math.floor((this.clock - dt) * 8)
          )
            this.hooks.sound.tone(
              100 + this.sling.charge * 150,
              0.08,
              0,
              "triangle",
            );
          const before = this.sling.state;
          this.sling.update(dt);
          if (this.sling.state === "hit") this.finish();
          else if (before !== this.sling.state) this.hooks.changed();
        }
      }
    }
    this.render();
  }
  say(en: string, ar: string) {
    return this.lang === "ar" ? ar : en;
  }
  render() {
    const c = this.c;
    if (!c) return;
    A.setArtTime(this.clock);
    const painted =
      this.phase === "title" ||
      (this.mission === "maze" &&
        this.phase !== "encounter" &&
        this.phase !== "victory");
    if (!painted)
      A.background(
        c,
        this.clock,
        this.mission === "sling" ? "valley" : "field",
      );
    if (this.phase === "title") this.drawTitle(c);
    else if (this.phase === "victory") this.drawVictory(c);
    else if (this.phase === "encounter") this.drawEncounter(c);
    else if (this.mission === "maze") this.drawMaze(c);
    else if (this.mission === "armor") this.drawArmor(c);
    else if (this.mission === "sheep") this.drawSheep(c);
    else if (this.mission === "brook") this.drawBrook(c);
    else this.drawSling(c);
    A.vignette(c);
    if (this.debug) {
      c.strokeStyle = "#ff55bb";
      c.lineWidth = 2;
      for (const z of Object.values(gearZones))
        c.strokeRect(z.x, z.y, z.w, z.h);
      c.beginPath();
      c.arc(1000, 259, 43, 0, Math.PI * 2);
      c.stroke();
      A.text(c, `${this.phase} / ${this.mission}`, 1070, 220, 18, "#ff55bb");
    }
    this.texture.refresh();
  }
  drawTitle(c: A.Ctx) {
    cover(c, this.landscape, 0, 0, 1280, 720);
    const light = c.createLinearGradient(0, 0, 860, 0);
    light.addColorStop(0, "#fff5dbf0");
    light.addColorStop(0.6, "#fff4dfe6");
    light.addColorStop(1, "#fff4df00");
    c.fillStyle = light;
    c.fillRect(0, 88, 920, 632);
    // The finished cover illustration is independent of the articulated in-game rig.
    // Their palette, headband, curls, linen tunic and woven food bag share one design.
    A.shadow(c, 934, 662, 99);
    const breathe = Math.sin(this.clock * 1.8) * 1.8;
    c.drawImage(this.hero, 762, 141 - breathe, 371, 557 + breathe);
    A.sheep(c, 1132, 652, 1.12, Math.sin(this.clock * 2) * 0.08);
    A.sheep(c, 708, 675, 0.82, Math.sin(this.clock * 1.7) * 0.07);
    motes(c, this.clock, 24);
    A.round(c, 1052, 175, 163, 39, 19, "#fff6dfa8", "#f1e0b1");
    A.text(
      c,
      this.say("1 SAMUEL · 17", "١ صموئيل · ١٧"),
      1134,
      195,
      14,
      "#47634f",
    );
    // A restrained brass compass motif belongs to the adventure's identity.
    c.save();
    c.translate(1192, 553);
    c.rotate(-0.1);
    c.strokeStyle = "#fff2bc8c";
    c.lineWidth = 1;
    c.beginPath();
    c.arc(0, 0, 28, 0, Math.PI * 2);
    c.stroke();
    A.star(c, 0, 0, 20, "#ffefbf99", Math.PI / 2);
    c.restore();
  }
  drawMaze(c: A.Ctx) {
    const { x, y, size: s } = MAZE;
    if (this.mazePaintingSeed !== this.maze.maze.seed) {
      this.mazePainting = mazeBackdrop(this.maze.maze, this.landscape);
      this.mazePaintingSeed = this.maze.maze.seed;
    }
    if (this.mazePainting) c.drawImage(this.mazePainting, 0, 0);
    // Start and goal are readable; no route is revealed unless a one-step hint is requested.
    A.ellipse(c, x + s / 2, y + s / 2, 19, 18, "#a9b27c80");
    A.line(
      c,
      [
        [x + 17, y + 31],
        [x + 26, y + 26],
        [x + 25, y + 35],
      ],
      "#fdf1cc",
      2.5,
    );
    A.ellipse(c, x + 8.5 * s, y + 6.5 * s, 23, 21, "#ecc36b");
    const flagX = x + 8.5 * s,
      flagY = y + 6.5 * s;
    A.line(
      c,
      [
        [flagX - 6, flagY + 17],
        [flagX - 6, flagY - 21],
      ],
      "#765b36",
      3,
    );
    A.poly(
      c,
      [
        [flagX - 5, flagY - 21],
        [flagX + 16, flagY - 17 + Math.sin(this.clock * 3) * 2],
        [flagX + 13, flagY - 6],
        [flagX - 5, flagY - 9],
      ],
      "#a56839",
      "#d9b46f",
    );
    if (this.hintTime > 0) {
      const next = path(this.maze.maze, this.maze.cell)[1];
      if (next !== undefined) {
        c.globalAlpha = 0.35 + Math.sin(this.clock * 7) * 0.2;
        A.ellipse(
          c,
          x + ((next % 9) + 0.5) * s,
          y + (Math.floor(next / 9) + 0.5) * s,
          21,
          21,
          "#fff5b0",
        );
        c.globalAlpha = 1;
      }
    }
    if (this.phase === "play") {
      const pos = this.maze.position;
      A.person(
        c,
        x +
          (pos.x + 0.5) * s +
          Math.sin(this.bumpTime * 20) * 4 * this.bumpDir.x,
        y +
          (pos.y + 0.5) * s +
          23 +
          Math.sin(this.bumpTime * 20) * 4 * this.bumpDir.y,
        0.35,
        {
          bag: true,
          walk: this.maze.moveTime < 0.16 ? Math.sin(this.clock * 25) : 0,
        },
      );
    }
    for (let i = 0; i < 3; i++)
      A.person(c, 960 + i * 68, 506 + (i % 2) * 22, 0.8, {
        mature: true,
        beard: i !== 1,
        look: -0.5,
        tunic: ["#bd7952", "#618e82", "#e0c185"][i],
        headcloth: ["#756b52", "#9f6544", "#557a72"][i],
        arm: 0.5 + Math.sin(this.clock * 2 + i) * 0.2,
      });
    A.round(c, 865, 580, 326, 35, 12, "#f9ebcbeb", "#ccb98b");
    A.text(
      c,
      this.say("THE ISRAELITE CAMP", "معسكر إسرائيل"),
      1031,
      598,
      13,
      "#7b714a",
    );
    A.line(
      c,
      [
        [96, 456],
        [96, 510],
      ],
      "#7d6540",
      8,
    );
    A.round(
      c,
      43,
      403,
      108,
      56,
      9,
      A.gradient(c, 43, 403, 0, 56, ["#ecd4a2", "#c79e65"]),
      "#a2804b",
    );
    A.text(c, this.say("START", "البداية"), 96, 422, 16, "#5b6140");
    A.text(c, "→", 96, 446, 24, "#7c623b");
    if (this.maze.moveTime < 0.16) {
      const p = this.maze.position;
      for (let i = 0; i < 4; i++) {
        c.globalAlpha = 0.16;
        A.ellipse(
          c,
          x + (p.x + 0.5) * s - 8 - i * 3,
          y + (p.y + 0.5) * s + 22,
          2 + i,
          1.5,
          "#927744",
        );
      }
      c.globalAlpha = 1;
    }
    motes(c, this.clock, 9);
    if (this.phase === "success") this.drawHandover(c);
  }
  drawHandover(c: A.Ctx) {
    const t = this.successTime;
    c.fillStyle = "#153d42a3";
    c.fillRect(0, 88, 1280, 539);
    const px = 218,
      py = 177,
      pw = 844,
      ph = 407;
    c.save();
    c.shadowColor = "#173b3e66";
    c.shadowBlur = 36;
    c.shadowOffsetY = 12;
    A.round(c, px, py, pw, ph, 26, "#f6e2b4");
    c.restore();
    c.save();
    c.beginPath();
    c.roundRect(px, py, pw, ph, 26);
    c.clip();
    cover(c, this.landscape, px, py, pw, ph);
    const haze = c.createLinearGradient(0, py, 0, py + ph);
    haze.addColorStop(0, "#fff0c68a");
    haze.addColorStop(0.7, "#ffe7b733");
    haze.addColorStop(1, "#b88f5870");
    c.fillStyle = haze;
    c.fillRect(px, py, pw, ph);
    // Camera settles into the handover only after maze navigation has completed.
    const zoom = 1 + clamp((t - 0.6) / 3, 0, 1) * 0.035;
    c.translate(640, 475);
    c.scale(zoom, zoom);
    c.translate(-640, -475);
    A.ellipse(c, 666, 535, 350, 47, "#d3b07580");
    A.person(c, lerp(387, 485, t / 0.8), 542, 1.2, {
      bag: true,
      bagOpen: t > 0.8 && t < 2.6 ? 1 : 0,
      walk: t < 0.8 ? Math.sin(t * 20) : 0,
      arm: t > 0.8 ? clamp((t - 0.8) * 2, 0, 1) : 0,
    });
    for (let i = 0; i < 3; i++)
      A.person(c, 649 + i * 108, 542, 1.35, {
        mature: true,
        beard: i !== 1,
        look: -0.7,
        tunic: ["#c99c68", "#709c8d", "#dfc795"][i],
        headcloth: ["#927451", "#b67551", "#5a7d77"][i],
        arm: t > 1 ? 1 : 0.2,
      });
    if (t > 0.8) {
      // First lift the loaf out of the bag, then pass it into the brother's hand.
      const lift = clamp((t - 0.8) / 0.5, 0, 1),
        pass = clamp((t - 1.3) / 1, 0, 1);
      const fx = lift < 1 ? lerp(527, 549, lift) : lerp(549, 599, pass);
      const fy =
        lift < 1
          ? lerp(485, 427, lift) - Math.sin(lift * Math.PI) * 12
          : lerp(427, 412, pass) - Math.sin(pass * Math.PI) * 26;
      A.bread(c, fx, fy, 1.15);
    }
    if (t > 2.3) {
      const f = clamp((t - 2.3) / 0.45, 0, 1);
      for (let i = 1; i < 3; i++)
        A.bread(
          c,
          lerp(599, 599 + i * 108, f),
          412 - Math.sin(f * Math.PI) * 22,
          0.9,
        );
    }
    if (t > 2.6) A.burst(c, t - 2.5, 650, 351);
    motes(c, this.clock, 12);
    c.restore();
    c.strokeStyle = "#faedce";
    c.lineWidth = 2;
    c.beginPath();
    c.roundRect(px, py, pw, ph, 26);
    c.stroke();
    A.round(c, 440, 196, 400, 50, 22, "#fff4d7e0");
    A.text(
      c,
      t < 1.3
        ? this.say(
            "A little kindness, carried from home",
            "خير ومحبة… من البيت",
          )
        : this.say("Welcome, David!", "أهلًا يا داود!"),
      640,
      221,
      23,
      "#52644c",
    );
    // Three small chapter dots communicate the scene's progress without a countdown.
    for (let i = 0; i < 3; i++)
      A.ellipse(
        c,
        622 + i * 18,
        565,
        3.5,
        3.5,
        t > i * 1.2 ? "#fff6dc" : "#d6c293",
      );
  }
  drawArmor(c: A.Ctx) {
    const t = this.armor.fallTime;
    // Layered royal field tent: no medieval setting or invented religious symbols.
    const g = c.createLinearGradient(0, 88, 0, 630);
    g.addColorStop(0, "#b77847");
    g.addColorStop(1, "#e3b779");
    c.fillStyle = g;
    c.fillRect(0, 88, 1280, 542);
    A.poly(
      c,
      [
        [0, 88],
        [472, 88],
        [310, 510],
        [0, 555],
      ],
      "#945a3b",
    );
    A.poly(
      c,
      [
        [1280, 88],
        [838, 88],
        [974, 510],
        [1280, 555],
      ],
      "#945a3b",
    );
    A.poly(
      c,
      [
        [343, 88],
        [415, 88],
        [336, 510],
        [268, 520],
      ],
      "#dba45f",
    );
    A.poly(
      c,
      [
        [927, 88],
        [869, 88],
        [948, 510],
        [1010, 520],
      ],
      "#dba45f",
    );
    A.poly(
      c,
      [
        [500, 163],
        [780, 163],
        [893, 515],
        [393, 515],
      ],
      "#edcd8b",
    );
    A.poly(
      c,
      [
        [580, 175],
        [700, 175],
        [768, 514],
        [512, 514],
      ],
      "#6d8d78",
    );
    A.line(
      c,
      [
        [640, 155],
        [640, 495],
      ],
      "#b99763",
      5,
    );
    A.ellipse(c, 650, 583, 407, 52, "#ac6d43");
    A.ellipse(c, 650, 583, 360, 37, "#c99057");
    for (let i = 0; i < 12; i++)
      A.star(c, 340 + i * 55, 583, 8, "#e7ba76", Math.PI / 2);
    for (const item of GEAR) {
      const p = trays[item];
      A.round(c, p.x - 104, p.y - 82, 208, 173, 23, "#f6dfae", "#e9c58c");
      if (this.hintTime > 0 && !this.armor.equipped.has(item)) {
        A.ellipse(
          c,
          anchors[item].x,
          anchors[item].y,
          45 + Math.sin(this.clock * 5) * 5,
          30,
          "#fff2ad66",
        );
      }
      if (
        !this.armor.equipped.has(item) &&
        this.drag?.item !== item &&
        this.gearTween?.item !== item
      ) {
        const wiggle =
          this.wrong === item && this.wrongTime > 0
            ? Math.sin(this.wrongTime * 50) * 10
            : Math.sin(this.clock * 1.4 + GEAR.indexOf(item)) * 2;
        A.gear(c, item, p.x + wiggle, p.y, 0.87);
      }
      A.text(
        c,
        {
          tunic: this.say("TUNIC", "قميص شاول"),
          mail: this.say("COAT OF MAIL", "درع"),
          helmet: this.say("HELMET", "خوذة"),
          sword: this.say("SWORD & BELT", "سيف وحزام"),
        }[item],
        p.x,
        p.y + 74,
        17,
        "#6f5b3b",
      );
      if (this.armor.equipped.has(item))
        A.text(c, "✓", p.x + 76, p.y - 54, 25, "#416e55");
    }
    let x = 650,
      y = 590,
      tilt = 0,
      sit = 0,
      walk = 0,
      strain = this.armor.equipped.size * 0.14;
    if (t >= 0 && t < 0.7) {
      walk = Math.sin(t * 12) * 0.4;
    } else if (t >= 0.7 && t < 1.7) {
      x += Math.sin(t * 35) * 4;
      tilt = Math.sin(t * 16) * 0.04;
      strain = 0.8;
    } else if (t >= 1.7 && t < 2.8) {
      const f = (t - 1.7) / 1.1;
      x -= f * 40;
      y += f * 6;
      tilt = -f * 0.5;
      sit = f;
      strain = 1;
    } else if (t >= 2.8 && t < 3.6) {
      x -= 40;
      tilt = -0.5 + Math.sin(t * 15) * 0.04;
      sit = 1;
      strain = 0.8;
    } else if (t >= 3.6 && t < 5) {
      const f = (t - 3.6) / 1.4;
      x = 610;
      tilt = lerp(-0.5, 0, f);
      sit = 1 - f * 0.4;
      strain = 0.3;
    } else if (t >= 5) {
      const f = clamp((t - 5) / 1.5, 0, 1);
      x = lerp(610, 690, f);
      sit = (1 - f) * 0.6;
      walk = Math.sin(t * 12) * 0.5;
      strain = 0;
    }
    const dressed = t < 4 ? new Set(this.armor.equipped) : new Set<Gear>();
    if (this.gearTween?.success) dressed.delete(this.gearTween.item);
    A.person(c, x, y, 2.4, {
      gear: dressed,
      strain,
      sit,
      tilt,
      walk,
      helmetSlip: t >= 2.8 && t < 4 ? 14 : 0,
    });
    if (t >= 4 && t < 5.7) {
      const f = clamp((t - 4) / 1.2, 0, 1);
      for (const item of this.armor.equipped) {
        const a = anchors[item],
          b = trays[item];
        A.gear(
          c,
          item,
          lerp(a.x, b.x, f),
          lerp(a.y, b.y, f) - Math.sin(f * Math.PI) * 70,
          0.75,
        );
      }
    }
    if (t >= 2.8) {
      A.round(c, 403, 170, 474, 70, 17, "#fff2d9f0");
      if (this.lang !== "ar")
        A.text(c, "This armor isn’t right for me!", 640, 194, 22, "#76533b");
      if (this.lang !== "en")
        A.text(c, "الدرع ده مش مناسب ليا!", 640, 223, 23, "#76533b");
    }
    if (this.gearTween) {
      const g = this.gearTween,
        f = 1 - g.remaining / 0.2;
      A.gear(
        c,
        g.item,
        lerp(g.from.x, g.to.x, f),
        lerp(g.from.y, g.to.y, f),
        lerp(0.95, g.success ? (g.item === "helmet" ? 1.65 : 1.3) : 0.87, f),
      );
    }
    if (this.drag)
      A.gear(c, this.drag.item, this.drag.p.x, this.drag.p.y, 0.95);
    if (this.phase === "success") A.burst(c, this.successTime, 650, 300);
  }

  drawSheep(c: A.Ctx) {
    A.tree(c, 119, 366, 0.9);
    A.tree(c, 1105, 299, 0.7);
    A.poly(
      c,
      [
        [310, 720],
        [536, 720],
        [470, 539],
        [725, 365],
        [665, 355],
        [381, 490],
      ],
      "#dcc58b80",
    );
    A.round(c, 128, 410, 200, 158, 15, "#a0b56b");
    for (let i = 0; i < 7; i++)
      A.line(
        c,
        [
          [140 + i * 25, 431],
          [140 + i * 25, 550],
        ],
        "#b7c47b",
        2,
      );
    const fence = (ax: number, ay: number, bx: number, by: number) => {
      A.line(
        c,
        [
          [ax, ay + 5],
          [bx, by + 5],
        ],
        "#6b774838",
        14,
      );
      A.line(
        c,
        [
          [ax, ay - 10],
          [bx, by - 10],
        ],
        "#e0bf81",
        8,
      );
      A.line(
        c,
        [
          [ax, ay - 26],
          [bx, by - 26],
        ],
        "#f5d89a",
        8,
      );
      const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 45);
      for (let i = 0; i <= n; i++) {
        const x = lerp(ax, bx, i / n),
          y = lerp(ay, by, i / n);
        A.round(c, x - 5, y - 37, 10, 47, 3, "#b99561");
        A.round(c, x - 5, y - 37, 10, 8, 3, "#f4d49a");
      }
    };
    fence(128, 410, 328, 410);
    fence(128, 410, 128, 568);
    fence(128, 568, 328, 568);
    fence(328, 410, 328, 458);
    fence(328, 538, 328, 568);
    A.round(c, 157, 346, 143, 43, 10, "#fff1d2");
    A.text(
      c,
      this.say("HOME, SWEET HOME", "رجعنا للحظيرة"),
      228,
      368,
      12,
      "#56714d",
    );
    for (const s of this.sheep.sheep) {
      A.sheep(
        c,
        s.x,
        s.y,
        1,
        this.phase === "success"
          ? Math.sin(this.clock * 6)
          : s.following
            ? Math.sin(this.clock * 9)
            : Math.sin(this.clock * 2) * 0.1,
        s.following,
      );
      if (this.hintTime > 0 && !s.saved) {
        c.strokeStyle = "#fff6b6";
        c.lineWidth = 3;
        c.beginPath();
        c.arc(s.x, s.y - 20, 43, 0, Math.PI * 2);
        c.stroke();
      }
      if (s.startled > 0) A.text(c, "!", s.x, s.y - 70, 25, "#fff4c6");
    }
    A.lion(c, this.sheep.lion.x, this.sheep.lion.y, 1.1, this.clock * 3);
    A.person(c, this.sheep.david.x, this.sheep.david.y, 1, {
      walk: this.dir.x || this.dir.y ? Math.sin(this.clock * 14) : 0,
      arm: this.phase === "success" ? 1 : this.held.has("Space") ? 0.7 : 0,
    });
    if (this.hintTime > 0) A.text(c, "←", 386, 500, 38, "#fff6bb");
    if (this.phase === "success") {
      if (this.successTime > 1)
        A.person(c, 355, 409, 0.7, { tunic: "#a87c52", headcloth: "#857647" });
      A.burst(c, this.successTime, 350, 355);
    }
  }

  drawBrook(c: A.Ctx) {
    A.tree(c, 1175, 400, 0.85);
    A.bush(c, 101, 537, 1.4);
    A.bush(c, 1144, 560, 1.4);
    c.beginPath();
    c.moveTo(45, 256);
    c.bezierCurveTo(325, 200, 827, 225, 1180, 251);
    c.bezierCurveTo(1250, 365, 1223, 485, 1157, 566);
    c.bezierCurveTo(857, 612, 409, 592, 92, 570);
    c.bezierCurveTo(147, 463, 11, 358, 45, 256);
    c.closePath();
    c.fillStyle = "#d7d5a5";
    c.fill();
    c.strokeStyle = "#ede0ad";
    c.lineWidth = 22;
    c.stroke();
    const g = c.createLinearGradient(0, 250, 0, 580);
    g.addColorStop(0, "#4eaaad");
    g.addColorStop(0.5, "#65b9b8");
    g.addColorStop(1, "#8fc9ba");
    c.fillStyle = g;
    c.fill();
    for (let i = 0; i < 25; i++) {
      const x = 70 + ((i * 109 + this.clock * 22) % 1120),
        y = 275 + ((i * 79) % 280);
      A.line(
        c,
        [
          [x, y],
          [x + 18, y + Math.sin(this.clock + i) * 2],
          [x + 39, y],
        ],
        "#e4f0ce50",
        2,
      );
    }
    for (const s of this.brook.stones) {
      if (s.collected) continue;
      A.shadow(c, s.x, s.y + 13, 38);
      if (s.smooth) {
        A.ellipse(c, s.x, s.y, 35, 25, "#abb7a2", "#78968d");
        A.ellipse(c, s.x - 7, s.y - 8, 20, 10, "#d0d2b1");
        A.line(
          c,
          [
            [s.x - 13, s.y - 10],
            [s.x + 2, s.y - 14],
          ],
          "#ece7bd",
          3,
        );
      } else {
        A.poly(
          c,
          [
            [s.x - 36, s.y + 8],
            [s.x - 24, s.y - 20],
            [s.x - 7, s.y - 13],
            [s.x + 3, s.y - 32],
            [s.x + 23, s.y - 12],
            [s.x + 38, s.y + 17],
            [s.x + 10, s.y + 23],
          ],
          "#748f8b",
          "#567b78",
        );
        A.line(
          c,
          [
            [s.x - 8, s.y - 11],
            [s.x + 2, s.y + 12],
            [s.x + 22, s.y - 8],
          ],
          "#99aea0",
          3,
        );
      }
    }
    const ringY = 335 + this.brook.row * 145;
    c.strokeStyle = this.brook.errorTime ? "#d17b51" : "#fff4be";
    c.lineWidth = 5;
    c.beginPath();
    c.ellipse(this.brook.ring, ringY, 48, 38, 0, 0, Math.PI * 2);
    c.stroke();
    A.line(
      c,
      [
        [this.brook.ring - 9, ringY],
        [this.brook.ring + 9, ringY],
      ],
      "#fff4be",
      3,
    );
    A.line(
      c,
      [
        [this.brook.ring, ringY - 9],
        [this.brook.ring, ringY + 9],
      ],
      "#fff4be",
      3,
    );
    for (let i = 0; i < 5; i++) {
      const x = 945 + i * 43;
      A.ellipse(
        c,
        x,
        200,
        14,
        11,
        i < this.brook.count ? "#f4e6ae" : "#577e6b44",
      );
    }
    A.person(c, 1112, 586, 0.8, { bag: true, sit: 0.8, arm: 0.6 });
    if (this.brook.last && this.brook.cooldown > 0) {
      const f = 1 - this.brook.cooldown / 0.4,
        s = this.brook.last;
      const x = lerp(s.x, 1141, f),
        y = lerp(s.y, 550, f) - Math.sin(f * Math.PI) * 100;
      A.ellipse(c, x, y, lerp(30, 12, f), lerp(23, 9, f), "#e3dfb7");
    }
    if (this.phase === "success") A.burst(c, this.successTime, 800, 350);
  }

  drawSling(c: A.Ctx) {
    A.poly(
      c,
      [
        [0, 598],
        [240, 565],
        [520, 596],
        [750, 583],
        [1020, 603],
        [1280, 560],
        [1280, 720],
        [0, 720],
      ],
      "#be9d63",
    );
    for (let i = 0; i < 5; i++) {
      A.tent(c, 488 + i * 115, 378 + (i % 2) * 10, 0.25);
      A.person(c, 573 + i * 60, 416, 0.36, {
        tunic: i % 2 ? "#bd8956" : "#718c78",
        arm: this.phase === "success" ? 1 : 0,
      });
    }
    A.bush(c, 735, 600, 1.3);
    A.bush(c, 1190, 573, 1.4);
    A.person(c, 130, 597, 1.05, {
      bag: true,
      arm: this.sling.charging ? 0.7 : 0.2,
    });
    const t = this.phase === "success" ? this.successTime : 0;
    A.giant(
      c,
      1000 - 140 * clamp((t - 0.25) / 1.6, 0, 1),
      590,
      this.clock,
      t > 0.25 ? clamp((t - 0.25) / 1.6, 0, 1) : 0,
    );
    // Forehead center (1000,259) corresponds to the visible upper face, not the whole giant.
    if (this.hintTime > 0) {
      c.strokeStyle = "#fff3bd";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(1000, 259, 43, 0, Math.PI * 2);
      c.stroke();
    }
    if (this.sling.state === "ready") {
      const pivot = { x: 174, y: 512 },
        a = this.sling.charging
          ? this.clock * (8 + this.sling.charge * 13)
          : -1;
      const pouch = {
        x: pivot.x + Math.cos(a) * 39,
        y: pivot.y + Math.sin(a) * 39,
      };
      A.line(
        c,
        [
          [pivot.x - 3, pivot.y],
          [pouch.x, pouch.y],
          [pivot.x + 3, pivot.y + 4],
        ],
        "#795435",
        2.5,
      );
      A.ellipse(c, pouch.x, pouch.y, 9, 5, "#aa7848");
      A.ellipse(c, pouch.x, pouch.y, 5, 4, "#d4d2b2");
    } else {
      A.line(
        c,
        [
          [173, 510],
          [213, 483],
          [205, 470],
        ],
        "#795435",
        2,
      );
      A.line(
        c,
        [
          [173, 510],
          [188, 540],
        ],
        "#795435",
        2,
      );
    }
    for (let i = 0; i < this.sling.trail.length; i += 2) {
      const p = this.sling.trail[i];
      A.ellipse(c, p.x, p.y, 2.5, 2.5, "#fff1c08a");
    }
    if (this.sling.state === "flying" || this.sling.state === "hit") {
      const p = { ...this.sling.stone };
      if (this.phase === "success" && t > 0.5)
        p.y = Math.min(594, p.y + 450 * (t - 0.5) ** 2);
      A.shadow(c, p.x, 600, 6);
      A.ellipse(c, p.x, p.y, 7, 6, "#f0e4b8", "#8b8462");
    }
    A.round(c, 58, 216, 255, 82, 19, "#fff2d9e8");
    A.text(
      c,
      this.say("YOUR SLING POWER", "قوة الرمية"),
      185,
      238,
      15,
      "#5c715b",
    );
    A.round(c, 80, 258, 210, 18, 9, "#d2d8b7");
    A.round(
      c,
      80,
      258,
      Math.max(12, (210 * this.sling.charge) / 1.8),
      18,
      9,
      "#d7a34d",
    );
    if (this.sling.state === "ready") {
      A.text(
        c,
        this.sling.charging
          ? this.say("Release when you’re ready!", "سيب لما تكون جاهز!")
          : this.say("Hold to whirl the sling", "دوس عشان تلف المقلاع"),
        185,
        317,
        18,
        "#3d5c4b",
      );
    }
    if (this.phase === "success") {
      if (t < 1) A.star(c, 1000, 259, 25, "#fff2b5", t);
      if (t > 1)
        for (let i = 0; i < 12; i++)
          A.ellipse(
            c,
            1040 + i * 14,
            580 - Math.sin(i) * 20,
            25 + t * 5,
            13,
            "#e5c89190",
          );
      A.burst(c, t, 900, 360);
    }
  }

  drawEncounter(c: A.Ctx) {
    A.tent(c, 175, 493, 1.25, "#d7af67");
    A.person(c, 145, 543, 1.15, { tunic: "#bf8149", headcloth: "#a07646" });
    A.text(c, this.say("SAUL’S TENT", "خيمة شاول"), 167, 573, 19, "#3b584a");
    A.giant(c, 1030, 588, this.clock);
    A.person(c, this.encounterX, 590, 1, {
      bag: true,
      walk: this.dir.x ? Math.sin(this.clock * 13) : 0,
    });
    A.round(c, 390, 272, 370, 103, 20, "#fff2d7f0");
    A.text(
      c,
      this.heard
        ? this.say("David chooses courage.", "داود اختار الشجاعة.")
        : this.say("Who will face the giant?", "مين هيواجه العملاق؟"),
      575,
      307,
      24,
      "#5d624a",
    );
    A.text(
      c,
      this.heard
        ? this.say("← Go and speak to Saul", "اتكلم مع شاول ←")
        : this.say("Walk closer to listen →", "قرّب واسمع ←"),
      575,
      346,
      20,
      "#6d7450",
    );
    if (!this.heard) {
      A.ellipse(
        c,
        704,
        587,
        29 + Math.sin(this.clock * 4) * 4,
        12,
        "#fff0ad99",
      );
    } else A.text(c, "←", 310, 490, 44, "#fff2cc");
  }

  drawVictory(c: A.Ctx) {
    A.tree(c, 90, 560, 0.9);
    A.tent(c, 1105, 489, 1);
    A.person(c, 230, 560, 1.65, { bag: true, arm: 1 });
    for (let i = 0; i < 3; i++)
      A.person(c, 995 + i * 86, 550, 0.9, {
        arm: 1,
        tunic: ["#cc9b62", "#729786", "#dbbc7e"][i],
      });
    A.sheep(c, 110, 592, 0.9, Math.sin(this.clock * 4));
    A.sheep(c, 303, 608, 0.65, Math.sin(this.clock * 4 + 2));
    A.burst(c, this.clock, 640, 280);
    A.text(
      c,
      this.say(
        "A LITTLE COURAGE. A LOT OF FAITH.",
        "شجاعة صغيرة… وإيمان كبير.",
      ),
      640,
      198,
      18,
      "#4a6f57",
    );
    A.text(
      c,
      this.say("The battle is the Lord’s!", "لِلرَّبِّ الْحَرْبُ!"),
      640,
      252,
      43,
      "#2d5550",
    );
    A.text(
      c,
      this.say("1 Samuel 17:47", "١ صموئيل ١٧:٤٧"),
      640,
      298,
      22,
      "#6f744a",
    );
  }
}
