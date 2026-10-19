import { clamp, lerp, rng, type Point, type Gear } from "./model";
export type Ctx = CanvasRenderingContext2D;
const palette = { ink: "#253d43", grass: "#81ac59", gold: "#efbd57" };
export function ellipse(
  c: Ctx,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
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
  fill: string,
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
export function line(c: Ctx, points: number[][], color: string, width = 3) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.stroke();
}
export function poly(
  c: Ctx,
  points: number[][],
  fill: string,
  stroke?: string,
) {
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
  walk?: number;
  arm?: number;
  strain?: number;
  sit?: number;
  tilt?: number;
  bag?: boolean;
  gear?: Set<Gear>;
  wave?: boolean;
  skin?: string;
  tunic?: string;
  headcloth?: string;
  helmetSlip?: number;
  happy?: boolean;
};
export function person(c: Ctx, x: number, y: number, s = 1, p: Pose = {}) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  shadow(c, 0, 1, 34);
  c.rotate(p.tilt || 0);
  const walk = p.walk || 0,
    sit = p.sit || 0,
    skin = p.skin || "#ce945e",
    cloth = p.tunic || "#f6e4b4";
  // Articulated legs bend independently during a stumble and seated recovery.
  const hipY = -53 + sit * 25;
  line(
    c,
    [
      [-14, hipY],
      [-15 - walk * 12 - sit * 14, -26 + sit * 12],
      [-17 - walk * 20 - sit * 25, -7],
    ],
    skin,
    15,
  );
  line(
    c,
    [
      [13, hipY],
      [15 + walk * 12 + sit * 25, -26 + sit * 20],
      [18 + walk * 20 + sit * 33, -7],
    ],
    skin,
    15,
  );
  ellipse(c, -17 - walk * 20 - sit * 25, -5, 14, 6, "#71503a");
  ellipse(c, 18 + walk * 20 + sit * 33, -5, 14, 6, "#71503a");
  c.save();
  c.translate(0, sit * 17);
  poly(
    c,
    [
      [-22, -99],
      [19, -99],
      [30, -45],
      [-30, -45],
    ],
    cloth,
    "#b79566",
  );
  poly(
    c,
    [
      [-20, -97],
      [-10, -97],
      [-17, -47],
      [-28, -47],
    ],
    "#ffefd0",
  );
  round(c, -26, -65, 52, 9, 3, "#a85f43");
  round(c, 0, -64, 12, 7, 2, "#eac47a");
  const arm = p.arm || 0;
  const strain = p.strain || 0;
  line(
    c,
    [
      [-22, -91],
      [-36 - strain * 8, -72 - arm * 18],
      [-37 - strain * 11, -51 - arm * 40],
    ],
    skin,
    12,
  );
  line(
    c,
    [
      [23, -91],
      [36 + strain * 10, -75 - arm * 10],
      [37 + arm * 16 + strain * 10, -55 - arm * 41],
    ],
    skin,
    12,
  );
  if (p.bag) {
    line(
      c,
      [
        [-19, -99],
        [28, -49],
      ],
      "#a46e42",
      6,
    );
    round(c, 19, -61, 32, 39, 9, "#bd8a4e", "#92613b");
    for (let j = 0; j < 4; j++)
      line(
        c,
        [
          [22, -54 + j * 7],
          [47, -54 + j * 7],
        ],
        "#dfb16a",
        2,
      );
    ellipse(c, 35, -62, 16, 5, "#e1b978");
  }
  const gear = p.gear;
  if (gear?.has("tunic")) round(c, -25, -99, 50, 53, 8, "#a64d3a", "#793e31");
  if (gear?.has("mail")) {
    poly(
      c,
      [
        [-29, -99],
        [29, -99],
        [35, -51],
        [-35, -51],
      ],
      "#8b9d99",
      "#45595a",
    );
    for (let a = 0; a < 6; a++)
      for (let b = 0; b < 6; b++)
        line(
          c,
          [
            [-25 + b * 10, -93 + a * 7],
            [-21 + b * 10, -89 + a * 7],
            [-17 + b * 10, -93 + a * 7],
          ],
          a % 2 ? "#b6c1ad" : "#617779",
          1.7,
        );
  }
  if (gear?.has("sword")) {
    line(
      c,
      [
        [-32, -57],
        [36, -57],
      ],
      "#7b5139",
      6,
    );
    c.save();
    c.translate(27, -57);
    c.rotate(-0.3);
    round(c, -5, 0, 10, 49, 3, "#78664a", "#d5ba74");
    line(
      c,
      [
        [-12, -3],
        [12, -3],
      ],
      "#d6af54",
      5,
    );
    line(
      c,
      [
        [0, -3],
        [0, -19],
      ],
      "#a96c3d",
      7,
    );
    c.restore();
  }
  round(c, -9, -111, 18, 18, 4, skin);
  // Hair, warm facial shading, expressive eyes and brows.
  ellipse(c, 0, -128, 31, 36, "#533b30");
  ellipse(c, -29, -125, 6, 9, skin);
  ellipse(c, 29, -125, 6, 9, skin);
  ellipse(c, 0, -126, 26, 31, skin);
  ellipse(c, -7, -132, 18, 24, "#e4ad75");
  poly(
    c,
    [
      [-28, -139],
      [-19, -160],
      [5, -164],
      [26, -147],
      [26, -139],
      [7, -148],
      [-7, -140],
      [-14, -145],
    ],
    "#4d382d",
  );
  const hc = p.headcloth || "#337b89";
  poly(
    c,
    [
      [-28, -148],
      [-26, -160],
      [10, -166],
      [29, -151],
      [29, -144],
      [8, -151],
      [-11, -148],
    ],
    hc,
  );
  poly(
    c,
    [
      [23, -149],
      [35, -140],
      [38, -108],
      [27, -115],
    ],
    hc,
  );
  line(
    c,
    [
      [-24, -155],
      [9, -159],
      [23, -151],
    ],
    "#8ac2bb",
    3,
  );
  const eyeY = -127 + strain * 2;
  ellipse(c, -10, eyeY, 3, 4, "#2e3937");
  ellipse(c, 10, eyeY, 3, 4, "#2e3937");
  ellipse(c, -11, eyeY - 1, 1, 1, "#fff");
  ellipse(c, 9, eyeY - 1, 1, 1, "#fff");
  line(
    c,
    [
      [-15, -138 - strain * 2],
      [-6, -138 + strain * 3],
    ],
    "#5b3f30",
    2.8,
  );
  line(
    c,
    [
      [6, -138 + strain * 3],
      [15, -138 - strain * 2],
    ],
    "#5b3f30",
    2.8,
  );
  ellipse(c, -17, -116, 6, 3, "#dc8c64");
  ellipse(c, 17, -116, 6, 3, "#dc8c64");
  if (strain > 0.4) {
    ellipse(c, 0, -111, 6, 4, "#714436");
  } else {
    c.beginPath();
    c.arc(0, -116, 8, 0.15, Math.PI - 0.15);
    c.strokeStyle = "#854c3b";
    c.lineWidth = 2.5;
    c.stroke();
  }
  if (gear?.has("helmet")) {
    c.save();
    c.translate(0, p.helmetSlip || 0);
    poly(
      c,
      [
        [-33, -133],
        [-32, -153],
        [-20, -175],
        [0, -181],
        [23, -169],
        [34, -147],
        [33, -132],
        [23, -140],
        [-23, -140],
      ],
      "#b88746",
      "#785b34",
    );
    ellipse(c, -9, -161, 14, 12, "#d8b56d");
    round(c, -34, -144, 68, 10, 4, "#d6b069", "#806039");
    poly(
      c,
      [
        [-33, -137],
        [-28, -111],
        [-19, -118],
        [-21, -138],
      ],
      "#b28c4f",
    );
    poly(
      c,
      [
        [21, -138],
        [19, -118],
        [28, -111],
        [33, -137],
      ],
      "#b28c4f",
    );
    c.restore();
  }
  c.restore();
  c.restore();
}
export function bread(c: Ctx, x: number, y: number, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  ellipse(c, 0, 2, 22, 12, "#a56835");
  ellipse(c, 0, -2, 22, 13, "#e8ac59", "#af713b");
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
) {
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
export function lion(c: Ctx, x: number, y: number, s = 1, time = 0) {
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
export function giant(c: Ctx, x: number, y: number, time: number, fall = 0) {
  c.save();
  c.translate(x, y);
  shadow(c, 0, 0, 93);
  c.rotate(clamp(fall, 0, 1) * 1.34);
  const s = 2.4;
  person(c, 0, 0, s, {
    tunic: "#697b68",
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
