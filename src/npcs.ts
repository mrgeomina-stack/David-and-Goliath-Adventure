import { visualLibrary } from "./visual-assets";
const basketHole = [
  [117, 168],
  [165, 156],
  [215, 159],
  [250, 171],
  [268, 188],
  [267, 231],
  [252, 255],
  [181, 261],
  [140, 250],
  [122, 232],
];
const fingers = [
  [
    [128, 225],
    [146, 226],
    [160, 233],
    [177, 234],
    [182, 243],
    [173, 251],
    [156, 246],
    [138, 244],
    [128, 238],
  ],
  [
    [249, 219],
    [260, 219],
    [261, 231],
    [251, 243],
    [242, 247],
    [241, 235],
  ],
];
function polygon(c: CanvasRenderingContext2D, points: number[][]) {
  c.moveTo(points[0][0], points[0][1]);
  for (const p of points.slice(1)) c.lineTo(p[0], p[1]);
  c.closePath();
}
/** Source body/hand isolation prevents the receive pose's baked basket duplicating the moving prop. */
export function receivingBrother(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  frontHands = false,
) {
  const id = "npcs_brother_01_receive",
    a = visualLibrary.asset(id),
    image = visualLibrary.image(id);
  if (!a || !image) return false;
  const scale = height / (a.pivot.y - 8);
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  c.save();
  c.scale(-1, 1);
  c.translate(-a.pivot.x, -a.pivot.y);
  if (!frontHands) {
    // Reconstruct only the small shirt area hidden by the baked prop.
    const cloth = c.createLinearGradient(122, 170, 166, 250);
    cloth.addColorStop(0, "#d2a150");
    cloth.addColorStop(1, "#9b692c");
    c.fillStyle = cloth;
    c.beginPath();
    polygon(c, [
      [122, 171],
      [157, 166],
      [166, 215],
      [158, 252],
      [122, 250],
    ]);
    c.fill();
  }
  c.beginPath();
  if (frontHands) {
    for (const points of fingers) polygon(c, points);
    c.clip();
  } else {
    c.rect(0, 0, a.width, a.height);
    polygon(c, basketHole);
    c.clip("evenodd");
  }
  c.drawImage(image, 0, 0);
  c.restore();
  c.restore();
  return true;
}
