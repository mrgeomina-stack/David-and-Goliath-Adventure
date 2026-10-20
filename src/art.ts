import { visualLibrary, rootForAnchor, placedAnchor } from "./visual-assets";
import { SHOT } from "./model";
import { drawHero } from "./hero";
import { painted } from "./painted";
import { clamp, lerp, rng, type Point, type Gear } from "./model";
export type Ctx = CanvasRenderingContext2D;
export type Paint = string | CanvasGradient | CanvasPattern;
let artTime = 0;
export function setArtTime(time: number) {
  artTime = time;
}
export function gradient(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  colors: string[],
): CanvasGradient {
  const g = c.createLinearGradient(x, y, x + w, y + h);
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
  return g;
}
const palette = { ink: "#253d43", grass: "#81ac59", gold: "#efbd57" };
export function ellipse(
  c: Ctx,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: Paint,
  stroke?: string,
) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.stroke();
  }
}
export function round(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: Paint,
  stroke?: string,
) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.stroke();
  }
}
export function line(c: Ctx, points: number[][], color: Paint, width = 3) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.stroke();
}
export function poly(c: Ctx, points: number[][], fill: Paint, stroke?: string) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 3;
    c.stroke();
  }
}
export function text(
  c: Ctx,
  s: string,
  x: number,
  y: number,
  size = 22,
  color = "#253d43",
  align: CanvasTextAlign = "center",
) {
  c.font = `700 ${size}px 'Trebuchet MS',Arial,sans-serif`;
  c.textAlign = align;
  c.textBaseline = "middle";
  c.fillStyle = color;
  c.fillText(s, x, y);
}
export function shadow(c: Ctx, x: number, y: number, w: number) {
  ellipse(c, x, y, w, w * 0.19, "#243c2d25");
}
export function cloud(c: Ctx, x: number, y: number, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  ellipse(c, 0, 0, 65, 17, "#fff9dfb0");
  ellipse(c, -24, -13, 28, 20, "#fff9dfb0");
  ellipse(c, 19, -20, 32, 27, "#fff9dfb0");
  c.restore();
}
export function background(c: Ctx, time: number, mode = "field") {
  const sky = c.createLinearGradient(0, 0, 0, 500);
  sky.addColorStop(0, "#81c8d1");
  sky.addColorStop(0.75, "#e9e9b6");
  sky.addColorStop(1, "#f7deb0");
  c.fillStyle = sky;
  c.fillRect(0, 0, 1280, 720);
  const glow = c.createRadialGradient(1055, 145, 5, 1055, 145, 280);
  glow.addColorStop(0, "#fff4bdc0");
  glow.addColorStop(1, "#fff4bd00");
  c.fillStyle = glow;
  c.fillRect(700, 0, 580, 480);
  ellipse(c, 1055, 145, 44, 44, "#fff4c9");
  cloud(c, 200 + Math.sin(time * 0.03) * 10, 156, 0.8);
  cloud(c, 670, 116, 1.1);
  cloud(c, 1160, 211, 0.65);
  poly(
    c,
    [
      [0, 336],
      [160, 205],
      [337, 305],
      [509, 230],
      [740, 332],
      [954, 222],
      [1280, 315],
      [1280, 720],
      [0, 720],
    ],
    "#a9ba83",
  );
  poly(
    c,
    [
      [0, 381],
      [210, 310],
      [412, 366],
      [674, 292],
      [900, 366],
      [1090, 305],
      [1280, 360],
      [1280, 720],
      [0, 720],
    ],
    "#739b71",
  );
  c.beginPath();
  c.moveTo(0, 430);
  c.bezierCurveTo(300, 290, 450, 422, 650, 388);
  c.bezierCurveTo(900, 330, 1060, 390, 1280, 384);
  c.lineTo(1280, 720);
  c.lineTo(0, 720);
  c.closePath();
  const ground = c.createLinearGradient(0, 350, 0, 720);
  ground.addColorStop(0, mode === "valley" ? "#b7ba72" : "#adc677");
  ground.addColorStop(1, mode === "valley" ? "#d9bc7b" : "#709b51");
  c.fillStyle = ground;
  c.fill();
  const r = rng(113);
  for (let i = 0; i < 95; i++) {
    const x = r() * 1280,
      y = 395 + r() * 300;
    line(
      c,
      [
        [x - 4, y + 4],
        [x, y - 4],
        [x + 1, y + 3],
        [x + 5, y - 3],
      ],
      "#557f492f",
      2,
    );
    if (i % 5 === 0) flower(c, x, y, "#fff2b2", 0.7);
  }
}
export function flower(c: Ctx, x: number, y: number, color = "#fff4c6", s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.256;
    ellipse(c, Math.cos(a) * 4, Math.sin(a) * 4, 3.4, 3.4, color);
  }
  ellipse(c, 0, 0, 2.4, 2.4, "#dba646");
  c.restore();
}
export function bush(c: Ctx, x: number, y: number, s = 1) {
  if (visualLibrary.drawFeet(c, "props_maze_wall_shrub", x, y, 46 * s)) return;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  shadow(c, 0, 8, 25);
  ellipse(c, -15, 0, 18, 15, "#447c51");
  ellipse(c, 14, -2, 20, 17, "#447c51");
  ellipse(c, 0, -9, 22, 19, "#5e9657");
  ellipse(c, -5, -17, 13, 8, "#7eae63");
  line(
    c,
    [
      [-15, -3],
      [-8, -8],
    ],
    "#9ebf70",
    2,
  );
  c.restore();
}
export function tree(c: Ctx, x: number, y: number, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  shadow(c, 0, 0, 85);
  poly(
    c,
    [
      [-12, 0],
      [-7, -130],
      [10, -135],
      [16, 0],
    ],
    "#8b704b",
  );
  line(
    c,
    [
      [0, -70],
      [-36, -110],
    ],
    "#8b704b",
    12,
  );
  for (const [a, b, r] of [
    [-55, -142, 55],
    [48, -151, 60],
    [0, -187, 73],
    [-20, -133, 70],
  ]) {
    ellipse(c, a, b, r, r * 0.75, "#3c7650");
    ellipse(c, a - 8, b - 15, r * 0.8, r * 0.56, "#5d9554");
  }
  ellipse(c, -30, -207, 40, 17, "#89b46066");
  c.restore();
}
export function tent(c: Ctx, x: number, y: number, s = 1, color = "#e6bd7b") {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  shadow(c, 0, 2, 99);
  poly(
    c,
    [
      [-100, 0],
      [-50, -112],
      [4, -136],
      [98, -20],
      [90, 0],
    ],
    color,
    "#916943",
  );
  poly(
    c,
    [
      [-100, 0],
      [-50, -112],
      [4, -136],
      [-9, 0],
    ],
    "#f2d394",
  );
  poly(
    c,
    [
      [-8, 0],
      [15, -89],
      [55, 0],
    ],
    "#664e3d",
  );
  line(
    c,
    [
      [4, -136],
      [1, -159],
    ],
    "#745537",
    4,
  );
  poly(
    c,
    [
      [1, -157],
      [47, -147],
      [1, -135],
    ],
    "#376f7b",
  );
  line(
    c,
    [
      [-50, -112],
      [-132, 4],
    ],
    "#b48f58",
    2,
  );
  line(
    c,
    [
      [72, -53],
      [118, 4],
    ],
    "#b48f58",
    2,
  );
  c.restore();
}
export type Pose = {
  action?: "throw" | "kneel";
  carry?: number;
  food?: boolean;
  hands?: { left?: Point; right?: Point };
  character?: "saul" | "brother";
  actor?: string;
  walk?: number;
  arm?: number;
  strain?: number;
  sit?: number;
  tilt?: number;
  bag?: boolean;
  bagOpen?: number;
  gear?: Set<Gear>;
  wave?: boolean;
  skin?: string;
  tunic?: string;
  headcloth?: string;
  helmetSlip?: number;
  happy?: boolean;
  mature?: boolean;
  beard?: boolean;
  look?: number;
};
export function person(c: Ctx, x: number, y: number, s = 1, p: Pose = {}) {
  if (p.mature || p.character || p.actor) {
    let id =
      p.actor ||
      (p.character === "saul"
        ? "npcs_saul"
        : p.beard
          ? "npcs_brother_01_welcome"
          : "npcs_brother_02_idle");
    if ((p.arm || 0) > 0.8) {
      if (id === "npcs_brother_02_idle") id = "npcs_brother_02_cheer";
      if (id === "npcs_brother_03_idle") id = "npcs_brother_03_clap";
    }
    if (visualLibrary.image(id)) {
      shadow(c, x, y, 35 * s);
      c.save();
      c.translate(x, y);
      c.rotate((p.tilt || 0) + Math.sin(artTime * 2 + x) * 0.004);
      visualLibrary.drawFeet(c, id, 0, -Math.abs(p.walk || 0) * 2, 183 * s);
      c.restore();
      return;
    }
  }
  if (painted && (p.mature || p.character)) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    shadow(c, 0, 2, 35);
    c.rotate((p.tilt || 0) + Math.sin(artTime * 2 + x) * 0.006);
    painted.cast.draw(
      c,
      p.character === "saul" ? 5 : p.beard ? 3 : 4,
      -63,
      -183 - Math.abs(p.walk || 0) * 2,
      126,
      183,
    );
    c.restore();
    return;
  }
  if (painted) {
    drawHero(c, x, y, s, p, artTime);
    return;
  }
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  shadow(c, 0, 0, 30);
  ellipse(c, 0, -130, 26, 32, "#dca36e");
  round(c, -25, -100, 50, 60, 10, "#f5dfb3");
  line(
    c,
    [
      [-12, -40],
      [-16, -5],
    ],
    "#bf8656",
    11,
  );
  line(
    c,
    [
      [12, -40],
      [16, -5],
    ],
    "#bf8656",
    11,
  );
  c.restore();
}
export function bread(c: Ctx, x: number, y: number, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  ellipse(c, 0, 2, 22, 12, "#a56835");
  ellipse(
    c,
    0,
    -2,
    22,
    13,
    gradient(c, -20, -13, 36, 25, ["#f8db91", "#d69643", "#a45e2d"]),
    "#af713b",
  );
  for (let i = 0; i < 27; i++) {
    const a = i * 2.4,
      r = 3 + (i % 5) * 3;
    ellipse(
      c,
      Math.cos(a) * r,
      Math.sin(a) * r * 0.5 - 2,
      0.6,
      0.8,
      i % 2 ? "#fff0ba" : "#ba7839",
    );
  }
  for (let i = 0; i < 3; i++)
    line(
      c,
      [
        [-13 + i * 10, -7],
        [-9 + i * 10, 1],
      ],
      "#ffda8c",
      3,
    );
  c.restore();
}
export function sheep(
  c: Ctx,
  x: number,
  y: number,
  s = 1,
  hop = 0,
  following = false,
  variant = 0,
) {
  const idle = "animals_sheep_idle_0" + (1 + (variant % 3));
  const frame =
    !following && Math.abs(hop) > 0.3
      ? visualLibrary.animationFrame("sheep_hop", artTime)
      : null;
  if (visualLibrary.image(idle)) {
    shadow(c, x, y, 30 * s);
    visualLibrary.drawFeet(c, frame || idle, x, y - Math.abs(hop) * 5, 61 * s);
    return;
  }
  if (painted) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    shadow(c, 0, 0, 34);
    c.translate(0, -Math.abs(hop) * 5);
    for (const [lx, frame, phase] of [
      [-23, 3, 1],
      [14, 2, -1],
      [-14, 3, -1],
      [23, 2, 1],
    ]) {
      c.save();
      c.translate(lx, -22);
      c.rotate(hop * 0.22 * phase);
      painted.animals.draw(c, frame, -6, 0, 13, 27, false);
      c.restore();
    }
    painted.animals.draw(c, 0, -40, -59, 76, 48, false);
    c.save();
    c.translate(31, -45);
    c.rotate(Math.sin(artTime * 2 + x) * 0.035);
    painted.animals.draw(c, 1, -9, -21, 42, 40);
    c.restore();
    if (following) {
      ellipse(c, 8, -36, 7, 3, "#3f8b86");
    }
    c.restore();
    return;
  }
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  shadow(c, 0, 0, 28);
  c.translate(0, -Math.abs(hop) * 9);
  for (const a of [-16, 14])
    line(
      c,
      [
        [a, -14],
        [a + hop * 3, -2],
      ],
      "#705c43",
      6,
    );
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI) / 3.5;
    ellipse(
      c,
      Math.cos(a) * 20,
      -24 + Math.sin(a) * 10,
      13,
      13,
      "#f7f0d7",
      "#d5d4ae",
    );
  }
  ellipse(c, 0, -26, 22, 16, "#fff9e5");
  ellipse(c, 24, -29, 12, 16, "#af8c68");
  ellipse(c, 32, -36, 9, 4, "#8e735a");
  ellipse(c, 28, -31, 2.5, 3, "#273d39");
  if (following) ellipse(c, 0, -29, 4, 4, "#64a694");
  c.restore();
}
export function lion(
  c: Ctx,
  x: number,
  y: number,
  s = 1,
  time = 0,
  moving = false,
) {
  const frame = moving
    ? visualLibrary.animationFrame("lion_walk", time)
    : "animals_lion_idle";
  if (frame && visualLibrary.image(frame)) {
    shadow(c, x, y, 55 * s);
    // All source lion frames face right; mirror to face the flock on the left.
    visualLibrary.drawFeet(c, frame, x, y, 96 * s, true);
    return;
  }
  if (painted) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    shadow(c, 0, 0, 57);
    c.save();
    c.translate(40, -40);
    c.rotate(Math.sin(time) * 0.13);
    painted.animals.draw(c, 8, 0, -40, 42, 50, false);
    c.restore();
    for (const [lx, frame, phase] of [
      [-22, 6, 1],
      [29, 7, -1],
      [-32, 6, -1],
      [41, 7, 1],
    ]) {
      c.save();
      c.translate(lx, -37);
      c.rotate(Math.sin(time * 2) * 0.13 * phase);
      painted.animals.draw(c, frame, -10, 0, 20, 40, false);
      c.restore();
    }
    painted.animals.draw(c, 4, -46, -72, 100, 47, false);
    c.save();
    c.translate(-35, -55);
    c.rotate(Math.sin(time * 0.7) * 0.025);
    painted.animals.draw(c, 5, -37, -49, 70, 82);
    c.restore();
    c.restore();
    return;
  }

  c.save();
  c.translate(x, y);
  c.scale(s, s);
  shadow(c, 0, 0, 45);
  line(
    c,
    [
      [25, -26],
      [48, -38],
      [57, -28 + Math.sin(time) * 3],
    ],
    "#c38b3c",
    8,
  );
  ellipse(c, 0, -24, 37, 22, "#c89b4c");
  for (const a of [-22, 20])
    line(
      c,
      [
        [a, -20],
        [a + Math.sin(time) * 3, -1],
      ],
      "#b5843f",
      12,
    );
  ellipse(c, -29, -43, 29, 32, "#996136");
  ellipse(c, -32, -43, 21, 23, "#e1b568");
  ellipse(c, -40, -45, 2.5, 3, "#38453a");
  ellipse(c, -25, -45, 2.5, 3, "#38453a");
  ellipse(c, -33, -34, 7, 4, "#674e33");
  c.restore();
}
export function gear(c: Ctx, item: Gear, x: number, y: number, s = 1) {
  if (
    visualLibrary.drawCentered(c, "props_armor_" + item, x, y, 128 * s, 132 * s)
  )
    return;
  if (painted) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    shadow(c, 0, 58, 38);
    painted.props.draw(
      c,
      ["tunic", "mail", "helmet", "sword"].indexOf(item),
      -64,
      -69,
      128,
      132,
    );
    c.restore();
    return;
  }

  c.save();
  c.translate(x, y);
  c.scale(s, s);
  shadow(c, 0, 58, 38);
  if (item === "helmet") {
    poly(
      c,
      [
        [-42, 19],
        [-39, -12],
        [-20, -43],
        [12, -48],
        [38, -18],
        [42, 19],
      ],
      "#b68845",
      "#765a35",
    );
    ellipse(c, -12, -20, 17, 13, "#e5bc70");
    round(c, -44, 7, 88, 15, 5, "#ddb775", "#765a35");
    poly(
      c,
      [
        [-43, 20],
        [-37, 54],
        [-23, 44],
        [-25, 20],
      ],
      "#bc914f",
    );
    poly(
      c,
      [
        [25, 20],
        [23, 44],
        [37, 54],
        [43, 20],
      ],
      "#bc914f",
    );
  } else if (item === "sword") {
    c.rotate(0.25);
    round(c, -8, -24, 16, 84, 4, "#7d6950", "#bea170");
    line(
      c,
      [
        [-23, -29],
        [23, -29],
      ],
      "#d7b670",
      8,
    );
    line(
      c,
      [
        [0, -29],
        [0, -60],
      ],
      "#a36339",
      12,
    );
    line(
      c,
      [
        [-32, -8],
        [32, -8],
      ],
      "#9e633c",
      8,
    );
  } else {
    poly(
      c,
      [
        [-26, -55],
        [-53, -32],
        [-38, -9],
        [-26, -18],
        [-31, 53],
        [31, 53],
        [26, -18],
        [38, -9],
        [53, -32],
        [26, -55],
        [12, -46],
        [-12, -46],
      ],
      item === "tunic" ? "#ae5941" : "#879b96",
      item === "tunic" ? "#743c30" : "#4d6769",
    );
    if (item === "mail")
      for (let a = 0; a < 9; a++)
        for (let b = 0; b < 6; b++)
          line(
            c,
            [
              [-25 + b * 10, -36 + a * 9],
              [-21 + b * 10, -31 + a * 9],
              [-17 + b * 10, -36 + a * 9],
            ],
            "#bbccc1",
            2,
          );
    else
      line(
        c,
        [
          [0, -43],
          [0, 45],
        ],
        "#e5a96b",
        3,
      );
  }
  c.restore();
}
export function star(
  c: Ctx,
  x: number,
  y: number,
  r: number,
  color = "#ffe4a1",
  angle = 0,
) {
  if (visualLibrary.image("success_star")) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    visualLibrary.drawCentered(c, "success_star", 0, 0, r * 2, r * 2);
    c.restore();
    return;
  }
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = angle + (i * Math.PI) / 5;
    pts.push([
      x + Math.cos(a) * (i % 2 ? r * 0.45 : r),
      y + Math.sin(a) * (i % 2 ? r * 0.45 : r),
    ]);
  }
  poly(c, pts, color);
}
export function burst(c: Ctx, time: number, x = 640, y = 350) {
  for (let i = 0; i < 24; i++) {
    const a = i * 2.4,
      life = (time * 0.45 + i * 0.12) % 1;
    const d = 45 + life * 220;
    c.globalAlpha = 1 - life;
    star(
      c,
      x + Math.cos(a) * d,
      y + Math.sin(a) * d * 0.65,
      5 + (i % 3) * 3,
      ["#ffe5a4", "#fff8d9", "#b4d5a0"][i % 3],
      time + i,
    );
  }
  c.globalAlpha = 1;
}
export let giantForehead: Point | null = null;
export function giant(
  c: Ctx,
  x: number,
  y: number,
  time: number,
  fall = 0,
  taunt = false,
) {
  const idle = visualLibrary.asset("goliath_idle");
  if (idle && visualLibrary.image(idle.id)) {
    const scale =
      (590 - SHOT.target.y) / (idle.pivot.y - idle.anchors!.forehead.y);
    const root = rootForAnchor(
      idle,
      { x, y: y - 331 },
      scale,
      idle.anchors!.forehead,
    );
    giantForehead =
      fall === 0 && !taunt
        ? placedAnchor(idle, root, scale, idle.anchors!.forehead)
        : null;
    const frame =
      fall > 0
        ? visualLibrary.animationFrame("goliath_defeat", fall * 2.02)
        : taunt
          ? "goliath_taunt"
          : idle.id;
    shadow(c, root.x, y, 95);
    visualLibrary.drawAt(c, frame || idle.id, root, scale);
    return;
  }
  if (painted) {
    c.save();
    c.translate(x, y);
    shadow(c, 0, 0, 95);
    c.scale(1, 1 + Math.sin(time * 0.9) * 0.003);
    // A separate broad adult warrior, anchored to the actual forehead target.
    // In the standing frame, forehead lies 10% down the 370px character.
    if (fall < 0.28) {
      c.rotate(fall * 0.25);
      painted.cast.draw(c, fall > 0.04 ? 1 : 0, -105, -370, 240, 370, false);
    } else {
      const f = clamp((fall - 0.28) / 0.72, 0, 1);
      c.rotate((1 - f) * 0.12);
      painted.cast.draw(c, 2, -110, -265 + f * 30, 325, 265, false);
    }
    c.restore();
    return;
  }

  c.save();
  c.translate(x, y);
  shadow(c, 0, 0, 93);
  c.rotate(clamp(fall, 0, 1) * 1.34);
  const s = 2.4;
  person(c, 0, 0, s, {
    tunic: "#697b68",
    mature: true,
    beard: true,
    headcloth: "#8d6343",
    strain: fall > 0.2 ? 0.6 : 0,
    arm: Math.sin(time) * 0.08,
  }); // forehead is rendered at y -336 + 9 = -327
  c.save();
  c.scale(s, s);
  round(c, -33, -103, 66, 43, 8, "#916b3d", "#5f5437");
  for (let i = 0; i < 3; i++) ellipse(c, -21 + i * 21, -84, 4, 4, "#d5b67e");
  line(
    c,
    [
      [46, -40],
      [46, -172],
    ],
    "#795a35",
    5,
  );
  poly(
    c,
    [
      [46, -191],
      [38, -170],
      [54, -170],
    ],
    "#bfc2a4",
  );
  ellipse(c, -39, -66, 24, 36, "#a78043", "#e0bd79");
  ellipse(c, -39, -66, 14, 23, "#98713d", "#dbc182");
  c.restore();
  c.restore();
}
export function vignette(c: Ctx) {
  const g = c.createRadialGradient(640, 350, 220, 640, 350, 770);
  g.addColorStop(0, "#173d3200");
  g.addColorStop(1, "#173d322b");
  c.fillStyle = g;
  c.fillRect(0, 0, 1280, 720);
}
