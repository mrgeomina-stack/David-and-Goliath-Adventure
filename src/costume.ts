import { visualLibrary } from "./visual-assets";
import type { Gear } from "./model";

/** Attach authored uniform-scale pieces to the existing articulated local body. */
export function wornGear(c: CanvasRenderingContext2D, item: Gear) {
  const layouts = {
    tunic: [0, -91, 68, 76],
    mail: [0, -91, 73, 72],
    sword: [4, -68, 77, 68],
  } as const;
  if (item === "helmet") return false;
  const [x, y, w, h] = layouts[item];
  const id = "props_armor_" + item,
    asset = visualLibrary.asset(id);
  if (!asset) return false;
  c.save();
  if (item !== "sword") {
    const scale = Math.min(w / asset.width, h / asset.height);
    const left = x - (asset.width * scale) / 2,
      top = y - (asset.height * scale) / 2;
    c.beginPath();
    c.rect(x - w, y - h, w * 2, h * 2);
    // Worn neck openings reveal David's real painted shirt, not the prop's dark cavity.
    const hole =
      item === "mail"
        ? [
            [151, 32],
            [190, 29],
            [242, 40],
            [272, 57],
            [289, 78],
            [271, 89],
            [236, 87],
            [193, 71],
            [161, 51],
          ]
        : [
            [167, 26],
            [207, 23],
            [259, 38],
            [291, 59],
            [292, 80],
            [266, 82],
            [220, 64],
            [181, 43],
          ];
    c.moveTo(left + hole[0][0] * scale, top + hole[0][1] * scale);
    for (const [hx, hy] of hole.slice(1))
      c.lineTo(left + hx * scale, top + hy * scale);
    c.closePath();
    c.clip("evenodd");
  }
  const drawn = visualLibrary.drawCentered(c, id, x, y, w, h);
  c.restore();
  return drawn;
}

/** Separate shell and cheek/rim layers keep the face visible through dark interior art. */
export function helmetLayer(
  c: CanvasRenderingContext2D,
  slip: number,
  front: boolean,
) {
  const image = visualLibrary.image("props_armor_helmet");
  if (!image) return false;
  const scale = 62 / 340,
    top = -158 + slip - (388 * scale) / 2,
    left = -31;
  c.save();
  if (front) {
    const hole = [
      [100, 205],
      [123, 187],
      [177, 176],
      [218, 188],
      [248, 204],
      [287, 187],
      [287, 388],
      [120, 388],
    ];
    c.beginPath();
    c.rect(left - 1, top - 1, 64, 388 * scale + 2);
    c.moveTo(left + hole[0][0] * scale, top + hole[0][1] * scale);
    for (const [x, y] of hole.slice(1))
      c.lineTo(left + x * scale, top + y * scale);
    c.closePath();
    c.clip("evenodd");
  }
  visualLibrary.drawCentered(c, "props_armor_helmet", 0, -158 + slip, 62, 71);
  c.restore();
  return true;
}
