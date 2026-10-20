import type { Ctx, Pose } from "./art";
import { visualLibrary } from "./visual-assets";
import { wornGear, helmetLayer } from "./costume";
import { foodBasket } from "./food";
import { clamp, lerp, type Point } from "./model";
import { CharacterMesh } from "./character-mesh";
import { skinPoint, solveChain, type Chain } from "./character-skin";
export { default as heroRigUrl } from "./assets/david-rig.png";

// All materials, anatomy and lighting come from ONE 1024×1536 illustration.
// Neck, face, shoulders, vest and tunic form one continuous painted surface.
const ORIGIN = { x: 530, y: 1418 },
  UNIT = 180 / 1354;
const point = (x: number, y: number): Point => ({ x, y });
const local = (p: Point): Point => ({
  x: (p.x - ORIGIN.x) * UNIT,
  y: (p.y - ORIGIN.y) * UNIT,
});
const chains: Chain[] = [
  { root: point(335, 586), joint: point(263, 707), end: point(197, 837) },
  { root: point(684, 594), joint: point(755, 711), end: point(831, 829) },
  { root: point(435, 976), joint: point(410, 1132), end: point(390, 1293) },
  { root: point(604, 976), joint: point(614, 1132), end: point(630, 1293) },
];
const outlines = [
  [
    [280, 553],
    [376, 610],
    [282, 753],
    [252, 794],
    [257, 834],
    [240, 879],
    [212, 904],
    [143, 905],
    [133, 839],
    [163, 783],
    [224, 675],
  ],
  [
    [662, 577],
    [711, 566],
    [785, 679],
    [817, 740],
    [880, 812],
    [896, 894],
    [856, 908],
    [807, 870],
    [778, 809],
    [734, 749],
    [678, 661],
  ],
  [
    [375, 1016],
    [491, 1016],
    [477, 1090],
    [435, 1240],
    [434, 1321],
    [465, 1389],
    [452, 1435],
    [282, 1440],
    [287, 1360],
    [341, 1301],
    [346, 1160],
  ],
  [
    [548, 1016],
    [660, 1016],
    [673, 1134],
    [678, 1280],
    [698, 1322],
    [783, 1381],
    [806, 1429],
    [553, 1444],
    [551, 1347],
    [574, 1290],
    [550, 1130],
  ],
];
let art: HTMLImageElement | undefined;
let body: CharacterMesh;
let limbs: CharacterMesh[] = [];
export const heroRigInfo = {
  ready: false,
  source: "david-rig.png",
  width: 1024,
  height: 1536,
  paintedParts: 5,
};
export function configureHero(image: HTMLImageElement) {
  art = image;
  body = new CharacterMesh(image, [
    [287, 44],
    [737, 44],
    [735, 573],
    [673, 633],
    [650, 603],
    [650, 699],
    [725, 1015],
    [319, 1023],
    [374, 710],
    [398, 622],
    [376, 626],
    [280, 574],
    [340, 436],
    [302, 376],
  ]);
  limbs = outlines.map((outline) => new CharacterMesh(image, outline, 40));
  heroRigInfo.ready = true;
}

/** The same painted hand is used above fleece/baskets; no geometric mitten overlays. */
export function drawHeroHand(
  c: Ctx,
  x: number,
  y: number,
  scale = 1,
  side = 1,
) {
  if (!art) return;
  c.save();
  c.translate(x, y);
  c.rotate(side * 0.18);
  c.scale(side < 0 ? -1 : 1, 1);
  c.drawImage(
    art,
    785,
    776,
    100,
    119,
    -6.2 * scale,
    -5.8 * scale,
    12.4 * scale,
    14.8 * scale,
  );
  c.restore();
}

/** One shared textured skeleton for every David activity; feet retain the model anchor. */
export function drawHero(
  c: Ctx,
  x: number,
  y: number,
  scale: number,
  p: Pose,
  time: number,
) {
  if (!art) {
    visualLibrary.drawAt(c, "david_idle", { x, y }, 0.45 * scale);
    return;
  }
  const stride = p.walk || 0,
    sit = p.sit || 0,
    kneel = p.action === "kneel";
  const carry = p.carry ?? (p.food ? 1 : undefined),
    arm = p.arm || 0;
  const bodyY =
    sit * 18 +
    (kneel ? 26 : 0) -
    Math.abs(stride) * 1.4 +
    Math.sin(time * 2.3) * 0.38;
  const compression = kneel ? 0.57 : lerp(1, 0.86, sit);
  const torso = (q: Point): Point => {
    const v = local(q);
    if (v.y > -94) v.y = -94 + (v.y + 94) * compression;
    v.y += bodyY;
    return v;
  };
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";
  c.fillStyle = "#263e3328";
  c.beginPath();
  c.ellipse(0, 2, 32, 5, 0, 0, Math.PI * 2);
  c.fill();
  c.rotate((p.tilt || 0) + (p.strain || 0) * Math.sin(time * 12) * 0.007);
  const poses: Chain[] = [];
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1,
      source = chains[i],
      root = torso(source.root);
    const explicit = i === 0 ? p.hands?.left : p.hands?.right;
    const wave = arm > 0.8 ? Math.sin(time * 6) * 2.3 : 0;
    let end: Point = explicit
      ? { ...explicit }
      : {
          x:
            carry !== undefined
              ? side * lerp(37, 30, carry)
              : side * (31 + (p.strain || 0) * 8) + side * stride * 5,
          y:
            carry !== undefined
              ? lerp(-43, -74, carry)
              : -64 - arm * 39 + side * stride * 7 + wave,
        };
    // Explicit hands are world-relative contracts: body settling must not move a prop grip.
    if (!explicit) end.y += bodyY;
    const upper =
      Math.hypot(
        source.joint.x - source.root.x,
        source.joint.y - source.root.y,
      ) * UNIT;
    const lower =
      Math.hypot(source.end.x - source.joint.x, source.end.y - source.joint.y) *
      UNIT;
    poses.push(solveChain(root, end, upper, lower, -side));
  }
  for (let i = 2; i < 4; i++) {
    const side = i === 2 ? -1 : 1,
      source = chains[i],
      root = torso(source.root);
    const end = local(source.end);
    end.x += side * stride * 12 + side * sit * 15;
    end.y -= Math.max(0, side * stride) * 5;
    if (kneel) {
      end.x = side < 0 ? -35 : 31;
      end.y = -9;
    }
    const joint = local(source.joint);
    joint.x += side * stride * 5 + side * sit * 9;
    joint.y += sit * 12;
    if (kneel) {
      joint.x = side < 0 ? -16 : 20;
      joint.y = side < 0 ? -1 : -28;
    }
    poses.push({ root, joint, end });
  }
  const transforms = chains.map(
    (source, i) => (v: Point) =>
      skinPoint(v, source, poses[i], i < 2 ? 23 : 28),
  );
  limbs[2].draw(c, transforms[2]);
  limbs[3].draw(c, transforms[3]);
  limbs[0].draw(c, transforms[0]);
  limbs[1].draw(c, transforms[1]);
  if (sit < 0.01 && !kneel) {
    c.save();
    c.translate(0, bodyY);
    body.drawFlat(c, ORIGIN, UNIT);
    c.restore();
  } else body.draw(c, torso);
  c.save();
  c.translate(0, bodyY);
  if (p.gear?.has("tunic")) wornGear(c, "tunic");
  if (p.gear?.has("mail")) wornGear(c, "mail");
  if (p.gear?.has("sword")) wornGear(c, "sword");
  c.restore();
  // Forearms stay above clothing while cuff roots remain naturally tucked under sleeves.
  for (let i = 0; i < 2; i++)
    limbs[i].draw(c, transforms[i], (v) => v.y > chains[i].joint.y - 12);
  if (p.food) {
    foodBasket(c, 0, -62, 1);
    drawHeroHand(c, -30, -74, 0.82, -1);
    drawHeroHand(c, 30, -74, 0.82, 1);
  }
  if (p.bag) {
    c.strokeStyle = "#614125";
    c.lineWidth = 3.8;
    c.beginPath();
    c.moveTo(-17, -125 + bodyY);
    c.lineTo(34, -44 + bodyY);
    c.stroke();
    c.strokeStyle = "#b48756";
    c.lineWidth = 2;
    c.stroke();
    visualLibrary.drawCentered(
      c,
      "props_pouch",
      34 + stride * 2,
      -42 + bodyY,
      32,
      38,
    );
  }
  if (p.gear?.has("helmet")) {
    // Opaque shell is never placed behind a separately clipped floating head.
    // Only the authored rim/shell exterior overlays the continuous portrait.
    c.save();
    c.translate(0, bodyY);
    helmetLayer(c, p.helmetSlip || 0, true);
    c.restore();
  }
  c.restore();
}
