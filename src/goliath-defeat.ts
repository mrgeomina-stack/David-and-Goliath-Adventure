import { CharacterMesh } from "./character-mesh";
import { rootForAnchor, visualLibrary } from "./visual-assets";
import { SHOT } from "./model";
import type { Ctx } from "./art";
export { default as goliathDefeatAtlasUrl } from "./assets/goliath-defeat/forward-fall-atlas.png";

/** Only the successful sling hit uses this timeline. Activity/shot physics stay authoritative. */
export const GOLIATH_LANDING = 1.62;
export const GOLIATH_DIZZY = { start: 0.26, end: 0.86 } as const;
const smooth = (n: number) => {
  const t = Math.max(0, Math.min(1, n));
  return t * t * (3 - 2 * t);
};
export function goliathDefeatAt(seconds: number) {
  const t = Math.max(0, seconds);
  const dizzy = t >= GOLIATH_DIZZY.start && t < GOLIATH_DIZZY.end;
  const wobble = dizzy ? Math.sin(((t - 0.26) / 0.6) * Math.PI * 6) * 5 : 0;
  const pitch = smooth((t - 0.86) / 0.19);
  const pose =
    t < 1.05
      ? -1
      : t < 1.18
        ? 0
        : t < 1.3
          ? 1
          : t < 1.44
            ? 2
            : t < 1.56
              ? 3
              : t < GOLIATH_LANDING
                ? 4
                : 5;
  const stage =
    t < 0.1
      ? "hit"
      : t < 0.26
        ? "shock"
        : dizzy
          ? "dizzy"
          : t < 1.05
            ? "pitch"
            : pose === 0
              ? "lean"
              : pose === 1
                ? "stumble"
                : pose === 2
                  ? "airborne"
                  : pose === 3
                    ? "descent"
                    : pose === 4
                      ? "near-ground"
                      : "prone";
  return {
    t,
    stage,
    dizzy,
    wobble,
    pitch,
    pose,
    grounded: t >= GOLIATH_LANDING,
  };
}

let atlas: HTMLImageElement | undefined;
let hitMesh: CharacterMesh | undefined;
export function configureGoliathDefeat(image: HTMLImageElement) {
  atlas = image;
}
// Authored crops avoid neighbouring fingers across the atlas's nominal cell edges.
const frames = [
  { rect: [0, 0, 480, 512], pivot: [450, 500], root: [1085, 590] },
  { rect: [480, 0, 495, 512], pivot: [943, 500], root: [1078, 590] },
  { rect: [975, 0, 561, 512], pivot: [1485, 460], root: [1068, 554] },
  { rect: [0, 512, 510, 512], pivot: [480, 895], root: [1060, 584] },
  { rect: [510, 512, 500, 512], pivot: [995, 895], root: [1058, 586] },
  { rect: [1010, 512, 526, 512], pivot: [1516, 895], root: [1058, 590] },
] as const;

export function drawGoliathDefeat(c: Ctx, elapsed: number) {
  const state = goliathDefeatAt(elapsed);
  const idle = visualLibrary.asset("goliath_idle")!;
  const scale =
    (590 - SHOT.target.y) / (idle.pivot.y - idle.anchors!.forehead.y);
  const root = rootForAnchor(idle, SHOT.target, scale, idle.anchors!.forehead);
  c.save();
  c.fillStyle = "#352c2840";
  c.beginPath();
  c.ellipse(
    state.pose < 2 ? 1008 : 886,
    590,
    state.pose < 2 ? 95 : 208,
    13,
    0,
    0,
    Math.PI * 2,
  );
  c.fill();
  if (state.pose < 0) {
    const image = visualLibrary.image("goliath_hit")!;
    hitMesh ??= new CharacterMesh(
      image,
      [
        [0, 0],
        [image.width, 0],
        [image.width, image.height],
        [0, image.height],
      ],
      56,
    );
    hitMesh.draw(c, (p) => {
      const upper = smooth((700 - p.y) / 500);
      return {
        x:
          root.x +
          (p.x - idle.pivot.x) * scale +
          state.wobble * upper -
          state.pitch * 210 * upper,
        y:
          root.y +
          (p.y - idle.pivot.y) * scale +
          state.pitch * 45 * upper +
          (state.dizzy ? Math.sin((elapsed - 0.26) * 17) * 2 * upper : 0),
      };
    });
    if (state.dizzy) {
      for (let i = 0; i < 3; i++) {
        const a = (elapsed - 0.26) * 8 + (i * Math.PI * 2) / 3;
        const x = 1028 + state.wobble + Math.cos(a) * 22,
          y = 218 + Math.sin(a) * 7;
        c.fillStyle = "#ffe7a0";
        c.strokeStyle = "#ab7e36";
        c.lineWidth = 1;
        c.beginPath();
        for (let j = 0; j < 10; j++) {
          const angle = (j * Math.PI) / 5 - Math.PI / 2,
            r = j % 2 ? 2.5 : 5.5;
          const px = x + Math.cos(angle) * r,
            py = y + Math.sin(angle) * r;
          if (j) c.lineTo(px, py);
          else c.moveTo(px, py);
        }
        c.closePath();
        c.fill();
        c.stroke();
      }
    }
  } else if (atlas) {
    const frame = frames[state.pose],
      [sx, sy, sw, sh] = frame.rect;
    const p = 0.82;
    // Continuous downward motion within each airborne/near-ground pose, then a stable prone hold.
    const drop =
      state.pose === 2
        ? smooth((elapsed - 1.3) / 0.14) * 12
        : state.pose === 3
          ? smooth((elapsed - 1.44) / 0.12) * 4
          : 0;
    c.drawImage(
      atlas,
      sx,
      sy,
      sw,
      sh,
      frame.root[0] + (sx - frame.pivot[0]) * p,
      frame.root[1] + (sy - frame.pivot[1]) * p + drop,
      sw * p,
      sh * p,
    );
  }
  const dust = elapsed - GOLIATH_LANDING;
  if (dust >= 0 && dust < 0.65) {
    c.globalAlpha = (1 - dust / 0.65) * 0.35;
    c.fillStyle = "#dfc59a";
    for (let i = 0; i < 9; i++) {
      c.beginPath();
      c.ellipse(
        730 + i * 34 + (i % 2 ? 1 : -1) * dust * 45,
        588 - Math.sin(i) * 3 - dust * 12,
        8 + dust * 25,
        4 + dust * 8,
        0,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
  }
  c.restore();
}
