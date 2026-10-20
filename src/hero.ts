import type { Ctx, Pose } from "./art";
import { painted } from "./painted";
import { visualLibrary } from "./visual-assets";
import { wornGear, helmetLayer } from "./costume";
import { foodBasket } from "./food";
import { lerp } from "./model";
const oval = (
  c: Ctx,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string | CanvasGradient,
) => {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = color;
  c.fill();
};
const blend = (
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  colors: string[],
) => {
  const g = c.createLinearGradient(x, y, x + w, y + h);
  colors.forEach((v, i) => g.addColorStop(i / (colors.length - 1), v));
  return g;
};
function limb(c: Ctx, points: number[][], width: number) {
  const xs = points.map((p) => p[0]),
    min = Math.min(...xs) - width / 2,
    max = Math.max(...xs) + width / 2;
  c.beginPath();
  c.moveTo(...(points[0] as [number, number]));
  c.quadraticCurveTo(
    ...([...points[1], ...points[2]] as [number, number, number, number]),
  );
  c.lineCap = "round";
  c.lineJoin = "round";
  c.lineWidth = width + 1.2;
  c.strokeStyle = "#9a623d";
  c.stroke();
  c.lineWidth = width;
  c.strokeStyle = blend(c, min, 0, max - min, 0, [
    "#b67c4c",
    "#efbd87",
    "#db9c67",
    "#ac7047",
  ]);
  c.stroke();
}
/** Poseable illustrated rig: feet remain the gameplay anchor in every animation. */
export function drawHero(
  c: Ctx,
  x: number,
  y: number,
  scale: number,
  p: Pose,
  time: number,
) {
  if (!painted) return;
  const accepted = visualLibrary.image("david_idle");
  const kneeling = p.action === "kneel";
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  oval(c, 0, 2, 33, 6, "#263e332b");
  c.rotate((p.tilt || 0) + (p.strain || 0) * Math.sin(time * 12) * 0.007);
  const stride = p.walk || 0,
    sit = p.sit || 0,
    carry = p.carry ?? (p.food ? 1 : undefined);
  c.translate(0, -Math.abs(stride) * 2);
  const bob = Math.sin(time * 2 + x * 0.02) * 0.6;
  // Bent knees and alternating feet, with padded soles, toes and crossing sandal straps.
  for (const side of [-1, 1]) {
    const foot = kneeling
      ? side < 0
        ? -42
        : 36
      : side * 16 + side * stride * 16 + side * sit * 25;
    const hip = side * 13,
      knee = side * 15 + side * stride * 9 + side * sit * 19;
    limb(
      c,
      [
        [hip, -52 + sit * 24],
        [
          kneeling ? (side < 0 ? -21 : 20) : knee,
          kneeling ? (side < 0 ? -3 : -26) : -26 + sit * 15,
        ],
        [foot, -8],
      ],
      13,
    );
    oval(
      c,
      foot,
      -4,
      14,
      5,
      blend(c, foot - 14, -8, 28, 8, ["#6c492e", "#b7804d", "#64452c"]),
    );
    oval(c, foot - 1, -7, 11, 4, "#dcaa74");
    for (let toe = 0; toe < 4; toe++)
      oval(c, foot - 7 + toe * 3, -6, 1.3, 1.7, "#eabf89");
    c.strokeStyle = "#775332";
    c.lineWidth = 2.6;
    for (const dir of [-1, 1]) {
      c.beginPath();
      c.moveTo(foot - dir * 8, -11);
      c.lineTo(foot + dir * 6, -4);
      c.stroke();
    }
    c.strokeStyle = "#c99d62";
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(foot - 11, -3);
    c.quadraticCurveTo(foot, 0, foot + 11, -3);
    c.stroke();
  }
  c.save();
  c.translate(0, sit * 18 + bob + (kneeling ? 26 : 0));
  c.save();
  if (kneeling) {
    c.beginPath();
    c.rect(-100, -220, 200, 160);
    c.clip();
  }
  // The same embroidered linen material as the approved cover; a curved, shaded silhouette.
  c.beginPath();
  c.moveTo(-12, -103);
  c.quadraticCurveTo(-28, -105, -34, -86);
  c.lineTo(-25, -77);
  c.lineTo(-24, -65);
  c.quadraticCurveTo(-26, -49, -32, -41);
  c.quadraticCurveTo(0, -34, 32, -41);
  c.quadraticCurveTo(26, -49, 24, -65);
  c.lineTo(25, -77);
  c.lineTo(34, -86);
  c.quadraticCurveTo(28, -105, 12, -103);
  c.closePath();
  c.fillStyle = blend(c, -34, -103, 68, 66, ["#fff7df", "#e7d1aa", "#b08d5d"]);
  c.fill();
  c.save();
  c.clip();
  c.globalAlpha = 0.88;
  if (!accepted)
    c.drawImage(painted.hero, 350, 820, 230, 180, -35, -106, 70, 74);
  c.globalAlpha = 0.3;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.moveTo(-20 + i * 10, -84);
    c.quadraticCurveTo(-15 + i * 8, -63, -23 + i * 12, -39);
    c.lineWidth = 2.4;
    c.strokeStyle = i % 2 ? "#fff4d7" : "#a28359";
    c.stroke();
  }
  c.restore();
  c.lineWidth = 1.5;
  c.strokeStyle = "#537f82";
  c.beginPath();
  c.moveTo(-12, -103);
  c.lineTo(0, -88);
  c.lineTo(12, -103);
  c.stroke();
  c.strokeStyle = "#b69b6c";
  c.beginPath();
  c.moveTo(-28, -43);
  c.quadraticCurveTo(0, -38, 28, -43);
  c.stroke();
  for (let i = 0; i < 13; i++) {
    c.fillStyle = i % 2 ? "#a78156" : "#668985";
    c.fillRect(-26 + i * 4, -45, 1.7, 3);
  }
  if (accepted) {
    for (const side of [-1, 1]) {
      c.save();
      c.scale(side, 1);
      c.beginPath();
      c.moveTo(12, -103);
      c.quadraticCurveTo(25, -105, 30, -93);
      c.lineTo(24, -72);
      c.lineTo(31, -42);
      c.lineTo(14, -40);
      c.lineTo(16, -75);
      c.closePath();
      c.fillStyle = blend(c, 12, -90, 20, 0, ["#547f82", "#315c63", "#789c95"]);
      c.fill();
      c.strokeStyle = "#d7b776";
      c.lineWidth = 0.9;
      c.stroke();
      c.restore();
    }
  }
  c.fillStyle = blend(c, -25, -66, 50, 8, ["#9e5834", "#c98c59", "#8c4e30"]);
  c.beginPath();
  c.roundRect(-25, -66, 50, 8, 3);
  c.fill();
  c.fillStyle = "#dec28a";
  c.fillRect(5, -65, 8, 6);
  c.restore();
  if (kneeling) {
    c.strokeStyle = "#d7c096";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-25, -60);
    c.quadraticCurveTo(0, -56, 25, -60);
    c.stroke();
  }
  const arm = p.arm || 0,
    wave = p.hands ? 0 : p.wave || arm > 0.8 ? Math.sin(time * 7) * 0.13 : 0;
  for (const side of [-1, 1]) {
    const hand = side < 0 ? p.hands?.left : p.hands?.right;
    const handX =
      hand?.x ??
      (carry !== undefined
        ? side * lerp(37, 30, carry)
        : side * (36 + (p.strain || 0) * 9) + side * stride * 4);
    const handY =
      hand?.y ??
      (carry !== undefined
        ? lerp(-43, -74, carry)
        : -53 -
          (p.action === "throw" && side < 0 ? 0 : arm) * 40 +
          side * stride * 4);
    c.save();
    c.translate(side * 26, -89);
    c.rotate(side * wave);
    c.translate(-side * 26, 89);
    limb(
      c,
      [
        [side * 26, -89],
        [side * 38, -72 - arm * 15],
        [handX, handY],
      ],
      11,
    );
    oval(
      c,
      handX,
      handY,
      6,
      7,
      blend(c, handX - 6, handY - 7, 12, 14, ["#f0c494", "#d69b65", "#aa7048"]),
    );
    for (let finger = 0; finger < 3; finger++) {
      c.strokeStyle = "#a96e4755";
      c.lineWidth = 0.65;
      c.beginPath();
      c.moveTo(handX - 2 + finger * 2, handY + 1);
      c.lineTo(handX - 2 + finger * 2, handY + 5);
      c.stroke();
    }
    c.restore();
  }
  if (p.food) {
    foodBasket(c, 0, -62, 1);
    for (const side of [-1, 1]) oval(c, side * 30, -74, 5, 5, "#dfad7c");
  }
  if (p.bag) {
    c.strokeStyle = "#a78050";
    c.lineWidth = 3.5;
    c.beginPath();
    c.moveTo(-18, -99);
    c.lineTo(34, -44);
    c.stroke();
    if (
      visualLibrary.drawCentered(c, "props_pouch", 34 + stride * 2, -42, 32, 38)
    ) {
      // Strap above and leather pouch below stay on the articulated torso.
    } else {
      c.save();
      c.translate(34 + stride * 2, -42);
      c.rotate(stride * 0.045);
      c.beginPath();
      c.roundRect(-15, -17, 30, 40, 10);
      c.fillStyle = blend(c, -15, -17, 30, 40, [
        "#e0bf84",
        "#b78c52",
        "#896333",
      ]);
      c.fill();
      for (let row = 0; row < 8; row++) {
        c.strokeStyle = row % 2 ? "#edd5a0" : "#876435";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(-13, -12 + row * 4);
        c.quadraticCurveTo(0, -8 + row * 4, 13, -12 + row * 4);
        c.stroke();
      }
      for (let col = 0; col < 8; col++) {
        c.strokeStyle = "#70533255";
        c.lineWidth = 0.7;
        c.beginPath();
        c.moveTo(-12 + col * 3.4, -15);
        c.lineTo(-11 + col * 3.2, 19);
        c.stroke();
      }
      oval(c, 0, -17, 15, 4, "#e5c999");
      oval(c, 0, -18, 12, 2.7, "#78532b");
      if (p.bagOpen) {
        c.save();
        c.translate(-14, -18);
        c.rotate(-p.bagOpen * 1.1);
        oval(c, 14, 0, 14, 3.5, "#ddbf86");
        c.restore();
      }
      if (!p.bagOpen) {
        oval(c, 0, -22, 9, 7, "#d9a056");
        c.strokeStyle = "#fce0a5";
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(-3, -26);
        c.lineTo(0, -20);
        c.stroke();
      }
      c.restore();
    }
  }
  if (p.gear?.has("tunic") && !wornGear(c, "tunic"))
    painted.props.draw(c, 0, -34, -104, 68, 68, false);
  if (p.gear?.has("mail") && !wornGear(c, "mail"))
    painted.props.draw(c, 1, -38, -104, 76, 70, false);
  if (p.gear?.has("sword") && !wornGear(c, "sword"))
    painted.props.draw(c, 3, -32, -68, 78, 66, false);
  // Portrait head tilts independently; eyelids and brows give readable reactions.
  c.save();
  c.translate(0, -104);
  c.rotate((p.strain || 0) * 0.055 + stride * 0.018);
  c.translate(0, 104);
  const helmet = p.gear?.has("helmet"),
    slip = p.helmetSlip || 0;
  const newHelmet = helmet && helmetLayer(c, slip, false);
  c.save();
  if (newHelmet) {
    c.beginPath();
    c.ellipse(6, -137 + slip * 0.25, 25, 29, 0, 0, Math.PI * 2);
    c.clip();
  }
  if (accepted) {
    oval(c, 2, -106, 8, 12, "#dba571");
    c.drawImage(accepted, 180, 64, 143, 151, -32, -170, 64.35, 67.95);
  } else c.drawImage(painted.hero, 270, 12, 360, 345, -35, -172, 70, 79);
  c.restore();
  const blink = (time + x * 0.003) % 4.9 > 4.77;
  if (blink || (p.strain || 0) > 0.65) {
    for (const [ex, ey] of accepted
      ? [
          [6, -137],
          [20, -140],
        ]
      : [
          [-1, -132],
          [14, -129],
        ]) {
      oval(
        c,
        ex,
        ey,
        4.8,
        3.2,
        blend(c, ex - 5, ey - 3, 10, 6, ["#e9ae75", "#df9c60"]),
      );
      c.strokeStyle = "#70442e";
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(ex - 4, ey);
      c.quadraticCurveTo(ex, ey + 2, ex + 4, ey);
      c.stroke();
    }
  }
  if (newHelmet) helmetLayer(c, slip, true);
  else if (helmet) painted.props.draw(c, 2, -36, -182 + slip, 72, 65, false);
  c.restore();
  c.restore();
  c.restore();
}
