/** Static scenery is baked once per maze. Moving actors/effects stay separate. */
import * as A from "./art";
import { rng, type Maze } from "./model";
export const MAZE = { x: 215, y: 192, size: 59 };

export function cover(
  c: A.Ctx,
  image: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const source = image as HTMLImageElement;
  const iw = source.naturalWidth || source.width,
    ih = source.naturalHeight || source.height;
  const scale = Math.max(w / iw, h / ih),
    sw = w / scale,
    sh = h / scale;
  c.drawImage(image, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}
export function motes(c: A.Ctx, time: number, count = 15) {
  for (let i = 0; i < count; i++) {
    const x = 70 + ((i * 197 + Math.sin(time * 0.23 + i) * 25) % 1140);
    const y =
      190 +
      ((i * 83 - time * (4 + (i % 4)) + Math.sin(time * 0.4 + i) * 8 + 7000) %
        390);
    c.globalAlpha = 0.15 + Math.sin(time * 0.7 + i) ** 2 * 0.3;
    A.ellipse(c, x, y, 1.4 + (i % 2), 1.4 + (i % 2), "#fff7cd");
  }
  c.globalAlpha = 1;
}

function stoneWall(
  c: A.Ctx,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  seed: number,
) {
  const r = rng(seed),
    horizontal = ay === by,
    n = 3;
  A.line(
    c,
    [
      [ax + 2, ay + 7],
      [bx + 2, by + 7],
    ],
    "#293d2940",
    20,
  );
  A.line(
    c,
    [
      [ax, ay + 3],
      [bx, by + 3],
    ],
    "#7b8064",
    16,
  );
  for (let i = 0; i < n; i++) {
    const t = i / n,
      x = ax + (bx - ax) * t,
      y = ay + (by - ay) * t;
    const len = Math.hypot(bx - ax, by - ay) / n;
    const base = ["#adae91", "#c3baa0", "#b8b497"][Math.floor(r() * 3)];
    A.round(
      c,
      x - (horizontal ? 1 : 7),
      y - (horizontal ? 7 : 1),
      horizontal ? len + 1 : 14,
      horizontal ? 14 : len + 1,
      4,
      base,
      "#777e62",
    );
    A.line(
      c,
      horizontal
        ? [
            [x + 2, y - 5],
            [x + len - 3, y - 5],
          ]
        : [
            [x - 5, y + 2],
            [x - 5, y + len - 3],
          ],
      "#e3d5b2",
      2,
    );
    A.ellipse(
      c,
      x + (horizontal ? len * 0.6 : 1),
      y + (horizontal ? 1 : len * 0.6),
      2,
      1,
      "#8b957263",
    );
  }
  // Moss grows along the wall caps; it never conceals a corridor opening.
  if (r() > 0.45) {
    const x = (ax + bx) / 2,
      y = (ay + by) / 2;
    A.ellipse(c, x, y - 4, 8, 4, "#6f8a4e");
    A.ellipse(c, x - 5, y - 6, 5, 3, "#9bb271");
  }
}

export function mazeBackdrop(
  maze: Maze,
  image: CanvasImageSource,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const c = canvas.getContext("2d")!;
  cover(c, image, 0, 0, 1280, 720);
  // The board has quiet, legible paths; detail is concentrated on walls and edges.
  c.fillStyle = "#1c493b28";
  c.fillRect(0, 88, 1280, 540);
  const veil = c.createLinearGradient(0, 88, 0, 220);
  veil.addColorStop(0, "#f6ebceef");
  veil.addColorStop(1, "#f6ebce00");
  c.fillStyle = veil;
  c.fillRect(0, 88, 1280, 160);
  const { x, y, size: s } = MAZE;
  c.save();
  c.shadowColor = "#233f3870";
  c.shadowBlur = 22;
  c.shadowOffsetY = 13;
  A.round(c, x - 19, y - 18, s * 9 + 38, s * 7 + 38, 19, "#596e43");
  c.restore();
  A.round(c, x - 13, y - 15, s * 9 + 26, s * 7 + 28, 15, "#e1d0a6", "#e7d9b3");
  const soil = c.createLinearGradient(x, y, x + s * 9, y + s * 7);
  soil.addColorStop(0, "#eedcb6");
  soil.addColorStop(0.55, "#e7cda1");
  soil.addColorStop(1, "#dbc190");
  A.round(c, x - 3, y - 3, s * 9 + 6, s * 7 + 6, 10, soil);
  const random = rng(64);
  for (let i = 0; i < 950; i++) {
    const px = x + random() * s * 9,
      py = y + random() * s * 7;
    A.ellipse(
      c,
      px,
      py,
      random() * 1.8 + 0.3,
      0.5,
      random() > 0.5 ? "#fff0cc70" : "#9a875927",
    );
  }
  for (let i = 0; i < 63; i++) {
    const px = x + (i % 9) * s,
      py = y + Math.floor(i / 9) * s;
    if (i % 9 === 0) stoneWall(c, px, py, px, py + s, 400 + i);
    if (i < 9) stoneWall(c, px, py, px + s, py, 500 + i);
    if (!maze.edges[i].includes(i + 1) || i % 9 === 8)
      stoneWall(c, px + s, py, px + s, py + s, i * 13 + 1);
    if (!maze.edges[i].includes(i + 9))
      stoneWall(c, px, py + s, px + s, py + s, i * 13 + 2);
  }
  // Destination dressing remains outside the maze's traversable rectangle.
  A.bush(c, 1138, 586, 1.25);
  A.bush(c, 94, 578, 1.15);
  for (let i = 0; i < 9; i++)
    A.flower(
      c,
      797 + i * 47,
      603 + Math.sin(i * 4) * 8,
      i % 2 ? "#ead9ad" : "#efe4c1",
      0.8,
    );
  // A small camp table, clay vessels, and a basket establish a lived-in setting.
  A.round(c, 927, 546, 191, 14, 5, "#977144", "#d4b382");
  for (const a of [945, 1100])
    A.line(
      c,
      [
        [a, 558],
        [a, 581],
      ],
      "#795c3d",
      6,
    );
  A.ellipse(c, 1127, 534, 17, 24, "#b8754d", "#79563c");
  A.ellipse(c, 1127, 512, 10, 4, "#654735");
  A.round(c, 880, 548, 37, 31, 8, "#b49158", "#775f3d");
  for (let i = 0; i < 4; i++)
    A.line(
      c,
      [
        [883, 554 + i * 6],
        [914, 554 + i * 6],
      ],
      "#d4b97e",
      2,
    );
  A.bread(c, 977, 543, 0.6);
  A.bread(c, 1059, 543, 0.7);
  return canvas;
}
