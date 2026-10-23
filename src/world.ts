import { LionEncounter } from "./lion-encounter";
import { drawLionActors, drawLionPrompt } from "./lion-encounter-view";
import { TITLE_DAVID, titleFlockAt } from "./title-flock";
import { ActivityTimer, ACTIVITY_SECONDS } from "./activity-timer";
import Phaser from "phaser";
import {
  MazeModel,
  ArmorModel,
  SheepModel,
  SHOT,
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
import { receivingBrother } from "./npcs";
import { foodBasket, deliveryAt } from "./food";
import { configureHero, heroRigUrl, drawHeroHand } from "./hero";
import { visualLibrary, visualRoles } from "./visual-assets";
import { bindCanvasGestures } from "./touch";
import { Effects, depth, cinematicFrame } from "./effects";
import landscapeUrl from "./assets/countryside.png";
import heroUrl from "./assets/david-hero.png";
import meadowUrl from "./assets/meadow.png";
import tentUrl from "../visual-assets-v1/backgrounds/level03_saul_tent_1920x1080.png";
import brookUrl from "../visual-assets-v1/backgrounds/level04_brook_1920x1080.png";
import valleyUrl from "../visual-assets-v1/backgrounds/level05_battlefield_1920x1080.png";
import animalsUrl from "./assets/animals-atlas.png";
import propsUrl from "./assets/props-atlas.png";
import castUrl from "./assets/cast-atlas.png";
import { configurePainted, pebble } from "./painted";
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
  facing: -1 | 1 = 1;
  activityTimer = new ActivityTimer();
  timedOut = false;
  get activityRemaining() {
    return this.mission === "sheep" && this.phase !== "encounter"
      ? this.sheep.remaining
      : this.activityTimer.remaining;
  }
  private fingerGesture = false;
  private effects = new Effects();
  private lastDust = 0;
  phase: Phase = "title";
  mission: Mission = "maze";
  maze = new MazeModel();
  armor = new ArmorModel();
  sheep = new SheepModel();
  lionEncounter = new LionEncounter();
  private gamepadDown = false;
  private padDir: Point = { x: 0, y: 0 };
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
  renderedProjectile: Point | null = null;
  private texture!: Phaser.Textures.CanvasTexture;
  private c!: CanvasRenderingContext2D;
  constructor(public hooks: Hooks) {
    super("Adventure");
  }
  preload() {
    visualLibrary.preload(this.load);
    this.load.image("david-cohesive-rig", heroRigUrl);
    this.load.image("painted-landscape", landscapeUrl);
    this.load.image("painted-david", heroUrl);
    for (const [key, url] of Object.entries({
      meadow: meadowUrl,
      tent: tentUrl,
      brook: brookUrl,
      valley: valleyUrl,
      animals: animalsUrl,
      props: propsUrl,
      cast: castUrl,
    }))
      this.load.image(key, url);
  }
  create() {
    visualLibrary.configure(this.textures);
    configureHero(
      this.textures
        .get("david-cohesive-rig")
        .getSourceImage() as HTMLImageElement,
    );
    this.landscape = this.textures
      .get("painted-landscape")
      .getSourceImage() as HTMLImageElement;
    this.hero = this.textures
      .get("painted-david")
      .getSourceImage() as HTMLImageElement;
    configurePainted(
      this.textures.get("animals").getSourceImage() as HTMLImageElement,
      this.textures.get("props").getSourceImage() as HTMLImageElement,
      this.textures.get("cast").getSourceImage() as HTMLImageElement,
      this.hero,
    );
    this.texture = this.textures.createCanvas("painted-world", 1280, 720)!;
    this.c = this.texture.context;
    this.add.image(0, 0, "painted-world").setOrigin(0);
    this.input.keyboard!.addCapture(["UP", "DOWN", "LEFT", "RIGHT", "SPACE"]);
    this.input.keyboard!.on("keydown", (e: KeyboardEvent) => {
      if (e.repeat || this.paused) return;
      this.held.add(e.code);
      const taps: Record<string, Point> = {
        ArrowLeft: { x: -1, y: 0 },
        KeyA: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        KeyD: { x: 1, y: 0 },
        ArrowUp: { x: 0, y: -1 },
        KeyW: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        KeyS: { x: 0, y: 1 },
      };
      if (
        taps[e.code]?.x &&
        !this.failed &&
        (this.phase === "play" || this.phase === "encounter")
      )
        this.facing = taps[e.code].x < 0 ? -1 : 1;
      if (
        taps[e.code] &&
        this.phase === "play" &&
        this.mission === "maze" &&
        !this.failed &&
        this.moveWait <= 0
      )
        this.stepMaze(taps[e.code]);
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
    bindCanvasGestures(this.game.canvas, {
      down: (p, touch) => {
        this.fingerGesture = touch;
        this.pointerDown(p);
      },
      move: (p) => {
        if (this.drag) this.drag.p = p;
      },
      up: (p) => this.pointerUp(p),
      cancel: () => {
        this.drag = null;
        this.selected = null;
      },
      swipe: (dir) => {
        if (this.mission !== "maze" || this.phase !== "play" || this.paused)
          return false;
        this.pressDirection(dir);
        this.stepDir = { x: 0, y: 0 };
        return true;
      },
    });
    this.ready = true;
    this.hooks.changed();
  }
  start(mission: Mission = "sheep", practice = false) {
    this.clearInput();
    this.hooks.sound.stopSamples();
    this.mission = mission;
    this.practice = practice;
    this.phase = "play";
    this.failed = false;
    this.timedOut = false;
    this.facing = 1;
    this.activityTimer = new ActivityTimer(this.free ? null : ACTIVITY_SECONDS);
    this.effects.particles = [];
    this.successTime = 0;
    this.deliveryCheered = false;
    this.hintTime = 0;
    this.tutorialTime = 2.5;
    this.moveWait = 0;
    this.run++;
    this.maze = new MazeModel(this.seed + this.run * 41);
    this.armor = new ArmorModel();
    this.sheep = new SheepModel(this.run, this.free ? null : ACTIVITY_SECONDS);
    this.lionEncounter = new LionEncounter(this.easy);
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
    this.hooks.sound.pause(value);
    this.clearInput();
    this.hooks.changed();
  }
  /** A brief touch/click must register even if pointerup precedes the next frame. */
  pressDirection(dir: Point) {
    if (this.paused || this.failed) return;
    if (dir.x) this.facing = dir.x < 0 ? -1 : 1;
    this.stepDir = dir;
    this.tutorialTime = 0;
    if (this.phase === "play" && this.mission === "maze" && this.moveWait <= 0)
      this.stepMaze(dir);
  }
  private stepMaze(dir: Point) {
    if (dir.x) this.facing = dir.x < 0 ? -1 : 1;
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
    if (this.phase === "encounter") {
      if (
        down &&
        !this.paused &&
        !this.failed &&
        this.heard &&
        this.encounterX < 290
      ) {
        this.start("armor", this.practice);
      }
      return;
    }
    if (this.paused || this.failed || this.phase !== "play") return;
    this.tutorialTime = 0;
    if (this.mission === "sheep" && this.lionEncounter.active) {
      if (down) {
        const result = this.lionEncounter.press();
        if (result) {
          this.hooks.sound.play(
            result === "miss" ? "wall" : result === "hit" ? "win" : "call",
          );
          this.clearInput();
          this.hooks.changed();
        }
      }
      return;
    }
    if (this.mission === "sling") {
      if (down) this.sling.hold();
      else {
        if (this.sling.release()) this.hooks.sound.play("launch");
      }
    }
    if (!down) return;
    if (this.mission === "sheep") {
      const picked = this.sheep.pickup();
      this.hooks.sound.play(picked ? "sheep" : "wall");
      if (picked)
        this.effects.burst(
          this.sheep.david.x,
          this.sheep.david.y - 35,
          "spark",
          9,
        );
    }
    if (this.mission === "brook") this.scoop();
  }
  pointerDown(p: Point) {
    if (this.paused || this.failed || this.phase !== "play") return;
    this.tutorialTime = 0;
    if (this.mission === "sheep" && this.lionEncounter.active) {
      this.action(true);
      return;
    }
    if (this.mission === "brook") {
      let target = p;
      if (this.fingerGesture) {
        const radius = Math.max(
          50,
          22 / (this.game.canvas.getBoundingClientRect().width / 1280),
        );
        const nearest = this.brook.stones
          .filter((s) => !s.collected)
          .sort((a, b) => distance(a, p) - distance(b, p))[0];
        if (nearest && distance(nearest, p) < radius) target = nearest;
      }
      this.scoop(target);
    }
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
    let target = p;
    if (this.fingerGesture) {
      const zone = gearZones[item],
        scale = this.game.canvas.getBoundingClientRect().width / 1280;
      const margin = Math.max(0, (44 / scale - Math.min(zone.w, zone.h)) / 2);
      if (
        p.x >= zone.x - margin &&
        p.x <= zone.x + zone.w + margin &&
        p.y >= zone.y - margin &&
        p.y <= zone.y + zone.h + margin
      )
        target = {
          x: clamp(p.x, zone.x, zone.x + zone.w),
          y: clamp(p.y, zone.y, zone.y + zone.h),
        };
    }
    const success = this.armor.drop(item, target);
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
    if (ok && this.brook.last)
      this.effects.burst(this.brook.last.x, this.brook.last.y, "water", 18);
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
    this.effects.burst(
      this.mission === "sling" ? 1000 : 640,
      this.mission === "sling" ? 259 : 350,
      "spark",
      26,
    );
    this.phase = "success";
    this.successTime = 0;
    this.deliveryCheered = false;
    this.clearInput();
    if (this.mission !== "maze" && this.mission !== "sling")
      this.hooks.sound.play("complete");
    this.hooks.changed();
  }
  continue() {
    if (this.phase === "encounter" && this.heard && this.encounterX < 290) {
      this.start("armor", this.practice);
      return;
    }
    if (this.phase !== "success" || this.successTime < this.payoffDuration)
      return;
    if (this.mission === "maze" && !this.practice) {
      this.hooks.sound.stopSamples();
      this.phase = "encounter";
      this.activityTimer = new ActivityTimer(
        this.free ? null : ACTIVITY_SECONDS,
      );
      this.facing = 1;
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
      this.hooks.sound.stopSamples();
      this.phase = "title";
      this.hooks.changed();
      return;
    }
    this.start(ORDER[ORDER.indexOf(this.mission) + 1]);
  }
  retry() {
    if (this.phase === "encounter") {
      this.failed = false;
      this.timedOut = false;
      this.encounterX = 210;
      this.heard = false;
      this.heardTime = 0;
      this.facing = 1;
      this.activityTimer = new ActivityTimer(
        this.free ? null : ACTIVITY_SECONDS,
      );
      this.clearInput();
      this.hooks.changed();
    } else this.start(this.mission, this.practice);
  }
  get payoffDuration() {
    return this.mission === "maze" ? 4 : this.mission === "sling" ? 3 : 2.5;
  }
  get dir() {
    let x = this.stepDir.x || (this.mission === "sheep" ? this.padDir.x : 0),
      y = this.stepDir.y || (this.mission === "sheep" ? this.padDir.y : 0);
    if (this.held.has("ArrowLeft") || this.held.has("KeyA")) x = -1;
    if (this.held.has("ArrowRight") || this.held.has("KeyD")) x = 1;
    if (this.held.has("ArrowUp") || this.held.has("KeyW")) y = -1;
    if (this.held.has("ArrowDown") || this.held.has("KeyS")) y = 1;
    const l = Math.hypot(x, y);
    return l ? { x: x / l, y: y / l } : { x: 0, y: 0 };
  }
  update(_time: number, delta: number) {
    // Standard Gamepad mapping: left stick/D-pad move, south button (A/Cross) acts.
    // Edge detection prevents a held button from clearing both timing challenges.
    if (this.mission === "sheep" && this.phase === "play") {
      let pad: Gamepad | null | undefined;
      try {
        pad = navigator.getGamepads?.().find((p) => p?.connected);
      } catch {
        /* Keyboard/touch remain available if the host disallows gamepads. */
      }
      const button = !!pad?.buttons[0]?.pressed;
      this.padDir = {
        x: pad?.buttons[14]?.pressed
          ? -1
          : pad?.buttons[15]?.pressed
            ? 1
            : Math.abs(pad?.axes[0] || 0) > 0.25
              ? pad!.axes[0]
              : 0,
        y: pad?.buttons[12]?.pressed
          ? -1
          : pad?.buttons[13]?.pressed
            ? 1
            : Math.abs(pad?.axes[1] || 0) > 0.25
              ? pad!.axes[1]
              : 0,
      };
      if (button && !this.gamepadDown) this.action(true);
      this.gamepadDown = button;
    } else {
      this.padDir = { x: 0, y: 0 };
      this.gamepadDown = false;
    }
    const dt = Math.min(delta / 1000, 0.05);
    if (!this.paused) {
      this.clock += dt;
      this.effects.update(dt);
      if (
        this.clock - this.lastDust > 0.22 &&
        (this.dir.x || this.dir.y) &&
        this.phase === "play" &&
        this.mission === "sheep"
      ) {
        this.lastDust = this.clock;
        this.effects.burst(this.sheep.david.x, this.sheep.david.y, "dust", 3);
      }
      this.hintTime = Math.max(0, this.hintTime - dt);
      this.wrongTime = Math.max(0, this.wrongTime - dt);
      this.bumpTime = Math.max(0, this.bumpTime - dt);
      if (this.gearTween) {
        this.gearTween.remaining -= dt;
        if (this.gearTween.remaining <= 0) this.gearTween = null;
      }
      const tutorialWasShowing = this.tutorialTime > 0;
      this.tutorialTime = Math.max(0, this.tutorialTime - dt);
      if (
        (this.phase === "play" || this.phase === "encounter") &&
        !this.failed
      ) {
        if (this.dir.x) this.facing = this.dir.x < 0 ? -1 : 1;
        const committed =
          this.phase !== "encounter" &&
          ((this.mission === "armor" && this.armor.fallTime >= 0) ||
            (this.mission === "brook" && this.brook.complete));
        const before = this.activityRemaining;
        if (this.mission !== "sheep" || this.phase === "encounter")
          this.activityTimer.tick(dt, !tutorialWasShowing && !committed);
        const after = this.activityRemaining;
        for (const threshold of [20, 10, 5])
          if (
            before !== null &&
            after !== null &&
            before > threshold &&
            after <= threshold
          )
            this.hooks.sound.tone(330, 0.15, 0, "triangle");
      }
      if (this.phase === "success") {
        const previous = this.successTime;
        this.successTime += dt;
        // The supplied final ground-contact frame starts at ~1.0s (see drawSling).
        // Crossing once in simulation time keeps landing silent on misses and frozen on pause.
        if (this.mission === "sling" && previous < 1 && this.successTime >= 1)
          this.hooks.sound.play("impact");
        if (
          (this.mission === "maze" || this.mission === "sling") &&
          !this.deliveryCheered &&
          this.successTime >= (this.mission === "maze" ? 2.55 : 1.65)
        ) {
          this.deliveryCheered = true;
          this.hooks.sound.play("complete");
        }
      }
      if (this.phase === "encounter" && !this.failed) {
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
          if (before < 2.8 && this.armor.fallTime >= 2.8) {
            this.effects.burst(620, 589, "dust", 20);
            this.hooks.sound.play("armorCrash");
          }
          if (this.armor.complete) this.finish();
        }
        if (this.mission === "sheep") {
          if (this.lionEncounter.active) {
            const before = this.lionEncounter.stage;
            const previousTime = this.lionEncounter.time;
            this.lionEncounter.update(dt, this.sheep);
            if (
              this.lionEncounter.timing &&
              previousTime < this.lionEncounter.window.start &&
              this.lionEncounter.time >= this.lionEncounter.window.start
            )
              this.hooks.sound.tone(660, 0.15, 0, "triangle");
            if (
              before === "rush" &&
              previousTime < 0.95 &&
              this.lionEncounter.time >= 0.95
            )
              this.hooks.sound.play("sheep");
            if (
              before === "guard" &&
              previousTime < 0.5 &&
              this.lionEncounter.time >= 0.5
            ) {
              this.hooks.sound.play("staff");
              this.effects.burst(963, 435, "spark", 12);
            }
            if (before !== this.lionEncounter.stage) {
              if (["seize", "defend"].includes(this.lionEncounter.stage))
                this.hooks.sound.play("roar");
              this.hooks.changed();
            }
            if (this.lionEncounter.stage === "done") this.finish();
          } else {
            const count = this.sheep.count;
            const beforeTime = this.sheep.remaining;
            this.sheep.update(this.tutorialTime > 0 ? 0 : dt, dir);
            for (const threshold of [20, 10, 5])
              if (
                beforeTime !== null &&
                beforeTime > threshold &&
                this.sheep.remaining !== null &&
                this.sheep.remaining <= threshold
              )
                this.hooks.sound.tone(330, 0.15, 0, "triangle");
            if (this.sheep.count > count) {
              this.effects.burst(230, 460, "spark", 20);
              this.hooks.sound.play("win");
              this.hooks.changed();
            }
            if (
              this.sheep.count === 4 &&
              this.lionEncounter.start(this.sheep)
            ) {
              this.clearInput();
              this.hooks.changed();
            } else if (this.sheep.complete) this.finish();
            else if (this.sheep.caughtIndex !== null) {
              this.failed = true;
              this.clearInput();
              this.hooks.changed();
            }
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
          const close =
            this.sling.state === "flying" &&
            distance(this.sling.stone, SHOT.target) < 150;
          this.sling.update(dt * (close ? 0.65 : 1));
          if (this.sling.state === "hit") this.finish();
          else if (before !== this.sling.state) this.hooks.changed();
        }
      }
    }
    // Finish committed animations and shots released before zero; all other input expires.
    if (
      !this.paused &&
      !this.failed &&
      (this.phase === "play" || this.phase === "encounter") &&
      this.activityRemaining === 0 &&
      (this.mission !== "sheep" || this.phase === "encounter")
    ) {
      const committed =
        this.phase !== "encounter" &&
        ((this.mission === "armor" && this.armor.fallTime >= 0) ||
          (this.mission === "brook" && this.brook.complete) ||
          (this.mission === "sling" && this.sling.state === "flying"));
      if (!committed) {
        this.failed = true;
        this.timedOut = true;
        this.clearInput();
        this.hooks.changed();
      }
    }
    this.hooks.sound.lion(
      dt,
      this.mission === "sheep" &&
        !this.lionEncounter.active &&
        this.phase === "play" &&
        !this.paused &&
        !this.failed &&
        this.tutorialTime <= 0,
    );
    this.hooks.sound.tick(
      this.mission,
      this.paused || this.failed,
      !!(this.dir.x || this.dir.y),
      dt,
    );
    this.render();
  }
  say(en: string, ar: string) {
    return this.lang === "ar" ? ar : en;
  }
  render() {
    const c = this.c;
    if (!c) return;
    c.clearRect(0, 0, 1280, 720);
    A.setArtTime(this.clock);
    c.save();
    const cinematic =
      this.mission === "sheep" && this.phase === "play"
        ? this.lionEncounter.camera
        : 0;
    if (cinematic > 0) {
      c.translate(760, 445);
      c.scale(1 + cinematic * 0.12, 1 + cinematic * 0.12);
      c.translate(-760, -445);
    }
    const painted =
      this.phase === "title" ||
      (this.mission === "maze" &&
        this.phase !== "encounter" &&
        this.phase !== "victory");
    if (!painted) {
      const key =
        this.phase === "encounter" || this.mission === "sling"
          ? "valley"
          : this.phase === "victory"
            ? "meadow"
            : this.mission === "armor"
              ? "tent"
              : this.mission === "brook"
                ? "brook"
                : "meadow";
      cover(
        c,
        visualLibrary.image(
          visualRoles.levels[
            key === "valley" ? 4 : key === "tent" ? 2 : key === "brook" ? 3 : 0
          ].background,
        ) || (this.textures.get(key).getSourceImage() as HTMLImageElement),
        -5 + Math.sin(this.clock * 0.17) * 2,
        -3,
        1290,
        726,
      );
      depth(c, this.clock, this.mission);
      motes(c, this.clock, 12);
    }
    if (this.phase === "title") this.drawTitle(c);
    else if (this.phase === "victory") this.drawVictory(c);
    else if (this.phase === "encounter") this.drawEncounter(c);
    else if (this.mission === "maze") this.drawMaze(c);
    else if (this.mission === "armor") this.drawArmor(c);
    else if (this.mission === "sheep") this.drawSheep(c);
    else if (this.mission === "brook") this.drawBrook(c);
    else this.drawSling(c);
    if (this.phase !== "title") depth(c, this.clock, this.mission, true);
    this.effects.draw(c);
    c.restore();
    if (this.mission === "sheep" && this.lionEncounter.active)
      drawLionPrompt(c, this.lionEncounter, this.lang);
    if (this.phase === "success") cinematicFrame(c, this.successTime);
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
    cover(
      c,
      visualLibrary.image("background_01_shepherd_hills") || this.landscape,
      0,
      0,
      1280,
      720,
    );
    const light = c.createLinearGradient(0, 0, 860, 0);
    light.addColorStop(0, "#fff5dbf0");
    light.addColorStop(0.6, "#fff4dfe6");
    light.addColorStop(1, "#fff4df00");
    c.fillStyle = light;
    c.fillRect(0, 88, 920, 632);
    // Every actor shares a ground-depth order: sheep can cross David's feet
    // from behind to in front. This cover animation never touches rescue state.
    let davidDrawn = false;
    const david = () => {
      A.person(c, TITLE_DAVID.x, TITLE_DAVID.y, TITLE_DAVID.scale, {
        facing: TITLE_DAVID.facing,
      });
      visualLibrary.drawFeet(c, "props_staff", 860, TITLE_DAVID.y, 387, true);
      davidDrawn = true;
    };
    for (const sheep of titleFlockAt(this.clock)) {
      if (!davidDrawn && sheep.y >= TITLE_DAVID.y) david();
      const frame = sheep.walking
        ? visualLibrary.animationFrame("sheep_walk", sheep.gaitTime)
        : "animals_sheep_idle_01";
      A.shadow(c, sheep.x, sheep.y, sheep.height * 0.38);
      c.save();
      c.translate(sheep.x, sheep.y);
      c.scale(sheep.turnScale, 1);
      visualLibrary.drawFeet(
        c,
        frame || "animals_sheep_idle_01",
        0,
        -sheep.bob,
        sheep.height,
        sheep.facing === -1,
      );
      c.restore();
    }
    if (!davidDrawn) david();
    motes(c, this.clock, 24);
    A.gameCard(c, 1052, 175, 163, 39, "#edbd55");
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
      this.mazePainting = mazeBackdrop(
        this.maze.maze,
        visualLibrary.image(visualRoles.levels[1].background) || this.landscape,
      );
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
          food: true,
          facing: this.facing,
          walk: this.maze.moveTime < 0.16 ? Math.sin(this.clock * 25) : 0,
        },
      );
    }
    for (let i = 0; i < 3; i++)
      A.person(c, 960 + i * 68, 506 + (i % 2) * 22, 0.8, {
        mature: true,
        actor: [
          "npcs_brother_01_welcome",
          "npcs_brother_02_idle",
          "npcs_brother_03_idle",
        ][i],
        beard: i !== 1,
        look: -0.5,
        tunic: ["#bd7952", "#618e82", "#e0c185"][i],
        headcloth: ["#756b52", "#9f6544", "#557a72"][i],
        arm: 0.5 + Math.sin(this.clock * 2 + i) * 0.2,
      });
    A.gameCard(c, 865, 580, 326, 35);
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
    cover(
      c,
      visualLibrary.image(visualRoles.levels[1].background) || this.landscape,
      px,
      py,
      pw,
      ph,
    );
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
    const delivery = deliveryAt(t),
      basket = delivery.basket;
    const gripY = basket.y + delivery.gripOffset;
    A.person(c, delivery.davidX, 542, 1.2, {
      walk: delivery.walk,
      arm: 0,
      hands: delivery.davidHolding
        ? {
            left: {
              x: (basket.x - 34 - delivery.davidX) / 1.2,
              y: (gripY - 542) / 1.2,
            },
            right: {
              x: (basket.x + 34 - delivery.davidX) / 1.2,
              y: (gripY - 542) / 1.2,
            },
          }
        : {
            left: { x: -32, y: -115 + Math.sin(t * 6) * 3 },
            right: { x: 30, y: -43 },
          },
    });
    const receiving = t >= 1.3;
    for (let i = 0; i < 3; i++) {
      if (i === 0 && receiving && receivingBrother(c, 649, 542, 183 * 1.35))
        continue;
      A.person(c, 649 + i * 108, 542, 1.35, {
        mature: true,
        actor: [
          "npcs_brother_01_welcome",
          "npcs_brother_02_idle",
          "npcs_brother_03_idle",
        ][i],
        beard: i !== 1,
        look: -0.7,
        tunic: ["#c99c68", "#709c8d", "#dfc795"][i],
        headcloth: ["#927451", "#b67551", "#5a7d77"][i],
        arm: t > 1 ? 1 : 0.2,
      });
    }
    // The existing receiver's left hand is at (575,398). Align the basket's
    // handle to it; adding arms over the old welcome sprite would duplicate limbs.
    foodBasket(c, basket.x, basket.y, 1.2);
    if (receiving) receivingBrother(c, 649, 542, 183 * 1.35, true);
    if (delivery.davidHolding) {
      for (const side of [-1, 1])
        drawHeroHand(c, basket.x + side * 34, gripY, 0.85, side);
    }
    if (t > 2.6) A.burst(c, t - 2.5, 650, 351);
    motes(c, this.clock, 12);
    c.restore();
    c.strokeStyle = "#faedce";
    c.lineWidth = 2;
    c.beginPath();
    c.roundRect(px, py, pw, ph, 26);
    c.stroke();
    A.gameCard(c, 440, 196, 400, 50, "#edbd55");
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
    for (const item of GEAR) {
      const p = trays[item];
      A.gameCard(c, p.x - 104, p.y - 82, 208, 173, "#a58acb");
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
      A.gameCard(c, 446, 104, 390, 58, "#a58acb");
      if (this.lang !== "ar")
        A.text(c, "This armor isn’t right for me!", 640, 127, 22, "#76533b");
      if (this.lang !== "en")
        A.text(c, "الدرع ده مش مناسب ليا!", 640, 151, 23, "#76533b");
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
    A.round(c, 128, 410, 200, 158, 15, "#a4ac6645");
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
        A.gradient(c, ax, ay - 13, 0, 9, ["#a67740", "#e0bf81", "#9c6d3c"]),
        8,
      );
      A.line(
        c,
        [
          [ax, ay - 26],
          [bx, by - 26],
        ],
        A.gradient(c, ax, ay - 30, 0, 9, ["#eacf98", "#bb8d52", "#906437"]),
        8,
      );
      if (ay === by && visualLibrary.image("props_fence")) {
        const count = Math.ceil(Math.abs(bx - ax) / 50);
        for (let i = 0; i < count; i++)
          visualLibrary.drawCentered(
            c,
            "props_fence",
            lerp(ax, bx, (i + 0.5) / count),
            ay - 17,
            Math.abs(bx - ax) / count + 2,
            39,
          );
      }
      const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 45);
      for (let i = 0; i <= n; i++) {
        const x = lerp(ax, bx, i / n),
          y = lerp(ay, by, i / n);
        A.round(
          c,
          x - 5,
          y - 37,
          10,
          47,
          3,
          A.gradient(c, x - 5, y - 37, 10, 0, [
            "#91683f",
            "#d3ac73",
            "#a77c48",
          ]),
        );
        A.line(
          c,
          [
            [x - 2, y - 25],
            [x - 1, y + 6],
          ],
          "#77572d55",
          0.8,
        );
        A.ellipse(c, x + 1, y - 12, 1.8, 3, "#7a552e88");
        A.round(c, x - 5, y - 37, 10, 8, 3, "#f4d49a");
      }
    };
    fence(128, 410, 328, 410);
    fence(128, 410, 128, 568);
    fence(128, 568, 328, 568);
    fence(328, 410, 328, 458);
    fence(328, 538, 328, 568);
    // A shut side panel dresses the solid left fence; the right entry stays open.
    visualLibrary.drawFeet(c, "props_pen_gate", 128, 524, 47);
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
      if (s.carried || s.caught) continue;
      A.sheep(
        c,
        s.x,
        s.y,
        1,
        this.phase === "success"
          ? Math.sin(this.clock * 6)
          : s.carried
            ? Math.sin(this.clock * 9)
            : Math.sin(this.clock * 2) * 0.1,
        s.carried,
        Math.round(s.phase / 3),
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
    if (this.lionEncounter.started) {
      drawLionActors(c, this.lionEncounter, this.clock);
    } else {
      A.lion(
        c,
        this.sheep.lion.x,
        this.sheep.lion.y,
        1.1,
        this.clock,
        this.sheep.hunting,
      );
      A.person(c, this.sheep.david.x, this.sheep.david.y, 1, {
        facing: this.facing,
        walk: this.dir.x || this.dir.y ? Math.sin(this.clock * 14) : 0,
        arm: this.phase === "success" ? 1 : 0,
        carry: this.sheep.carried ? this.sheep.liftProgress : undefined,
        sit: this.sheep.carried ? (1 - this.sheep.liftProgress) * 0.7 : 0,
      });
      const heldSheep = this.sheep.carried;
      if (heldSheep) {
        const d = this.sheep.david,
          f = this.sheep.liftProgress;
        const eased = f * f * (3 - 2 * f),
          drop = this.sheep.placing;
        const target = { x: d.x, y: d.y - 66 };
        const pen = this.sheep.penSpot(this.sheep.carriedIndex!);
        const sx = drop
          ? lerp(target.x, pen.x, drop)
          : lerp(this.sheep.pickupFrom.x, target.x, eased);
        const sy = drop
          ? lerp(target.y, pen.y, drop)
          : lerp(this.sheep.pickupFrom.y, target.y, eased) -
            Math.sin(f * Math.PI) * 12;
        A.sheep(
          c,
          sx,
          sy,
          0.83,
          Math.sin(this.clock * 6) * (f < 1 ? 0.65 : 0.08),
          true,
          this.sheep.carriedIndex!,
        );
        // Painted hands from the same character material visibly support the fleece.
        for (const side of [-1, 1])
          drawHeroHand(
            c,
            d.x + side * 30,
            d.y - lerp(44, 74, f),
            1,
            side * this.facing,
          );
      }
    }
    if (this.sheep.caughtIndex !== null && !this.lionEncounter.started) {
      A.sheep(c, this.sheep.lion.x - 35, this.sheep.lion.y + 6, 0.85, 0);
      A.text(
        c,
        this.say("The lion reached a sheep!", "الأسد وصل لخروف!"),
        this.sheep.lion.x - 40,
        this.sheep.lion.y - 128,
        19,
        "#fff5dd",
      );
    }
    if (this.hintTime > 0) A.text(c, "←", 386, 500, 38, "#fff6bb");
    if (this.phase === "success") {
      A.burst(c, this.successTime, 350, 355);
    }
  }

  drawBrook(c: A.Ctx) {
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
      const index = this.brook.stones.indexOf(s);
      pebble(c, s.smooth ? index % 5 : 5 + (index % 3), s.x, s.y);
      A.ellipse(c, s.x, s.y + 19, 42, 9, "#c1f8ec28");
    }
    const ringY = this.brook.ringY;
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
      if (i < this.brook.count) pebble(c, i, x, 200, 28, 23);
      else A.ellipse(c, x, 200, 14, 11, "#315e6144");
    }
    const pickup = this.brook.cooldown > 0 ? 1 - this.brook.cooldown / 0.4 : 0;
    const stow = clamp((pickup - 0.65) / 0.35, 0, 1);
    A.person(c, 1112, 586, 0.8, {
      bag: true,
      sit: 0.95,
      arm: 0,
      action: "kneel",
      hands: {
        left: { x: lerp(-50, 34, stow), y: lerp(-42, -80, stow) },
        right: { x: 30, y: -72 },
      },
    });
    if (this.brook.last && this.brook.cooldown > 0) {
      const f = 1 - this.brook.cooldown / 0.4,
        s = this.brook.last;
      const reach = clamp(f / 0.65, 0, 1),
        store = clamp((f - 0.65) / 0.35, 0, 1);
      const x = store > 0 ? lerp(1072, 1139, store) : lerp(s.x, 1072, reach);
      const y =
        store > 0
          ? lerp(588, 558, store) - Math.sin(store * Math.PI) * 10
          : lerp(s.y, 588, reach) - Math.sin(reach * Math.PI) * 70;
      c.save();
      c.globalAlpha = 1 - f;
      c.strokeStyle = "#e7fff0";
      c.lineWidth = 2;
      for (let ring = 0; ring < 2; ring++) {
        c.beginPath();
        c.ellipse(
          s.x,
          s.y,
          15 + f * 55 + ring * 12,
          5 + f * 15 + ring * 4,
          0,
          0,
          Math.PI * 2,
        );
        c.stroke();
      }
      c.restore();
      pebble(
        c,
        this.brook.stones.indexOf(s) % 5,
        x,
        y,
        lerp(64, 24, f),
        lerp(48, 18, f),
      );
    }
    if (this.phase === "success") A.burst(c, this.successTime, 800, 350);
  }

  drawSling(c: A.Ctx) {
    this.renderedProjectile = null;
    const follow =
      this.sling.state === "ready" ? 0 : clamp(this.sling.time / 0.25, 0, 1);
    const hand = { x: lerp(174, 215, follow), y: lerp(512, 485, follow) };
    A.person(c, 130, 597, 1.05, {
      bag: true,
      action: "throw",
      arm: 0,
      hands: {
        right: { x: (hand.x - 130) / 1.05, y: (hand.y - 597) / 1.05 },
        left: { x: -26, y: -64 + follow * 12 },
      },
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
      const pivot = hand,
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
          [hand.x, hand.y],
          [
            lerp(SHOT.origin.x, hand.x - 7, follow),
            lerp(SHOT.origin.y, hand.y + 30, follow),
          ],
        ],
        "#795435",
        2,
      );
      A.line(
        c,
        [
          [hand.x, hand.y],
          [hand.x + 15, hand.y + 30],
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
      this.renderedProjectile = { ...p };
      A.shadow(c, p.x, 600, 6);
      pebble(c, 0, p.x, p.y, 16, 13);
    }
    A.gameCard(c, 58, 216, 255, 82, "#edbd55");
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
    A.person(c, 310, 536, 0.65, { mature: true, actor: "npcs_soldier" });
    A.tent(c, 175, 493, 1.25, "#d7af67");
    A.person(c, 145, 543, 1.15, {
      character: "saul",
      tunic: "#bf8149",
      headcloth: "#a07646",
    });
    A.text(c, this.say("SAUL’S TENT", "خيمة شاول"), 167, 573, 19, "#3b584a");
    A.giant(c, 1030, 588, this.clock, 0, !this.heard);
    A.person(c, this.encounterX, 590, 1, {
      bag: true,
      facing: this.facing,
      walk: this.dir.x ? Math.sin(this.clock * 13) : 0,
    });
    A.gameCard(c, 390, 272, 370, 103);
    A.text(
      c,
      this.heard
        ? this.say("God helps me be brave!", "الله يساعدني أكون شجاعًا!")
        : this.say("The soldiers need courage.", "الجنود يحتاجون إلى الشجاعة."),
      575,
      307,
      24,
      "#5d624a",
    );
    A.text(
      c,
      this.heard
        ? this.say("← Tell Saul: I will help!", "قل لشاول: سأساعد! ←")
        : this.say(
            "Go hear Goliath’s challenge →",
            "امش يمينًا واسمع تحدي جليات",
          ),
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
    visualLibrary.drawCentered(c, "medal", 640, 260, 96, 120);
    A.person(c, 230, 560, 1.65, { bag: true, arm: 1 });
    for (let i = 0; i < 3; i++)
      A.person(c, 995 + i * 86, 550, 0.9, {
        arm: 1,
        mature: true,
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
