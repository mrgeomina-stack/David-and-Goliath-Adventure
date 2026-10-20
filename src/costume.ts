import { visualLibrary } from "./visual-assets";
import type { Gear } from "./model";

/** Attach authored uniform-scale pieces to the existing articulated local body. */
export function wornGear(c: CanvasRenderingContext2D, item: Gear) {
  const layouts = {
    tunic: [0, -80, 68, 76],
    mail: [0, -79, 73, 72],
    sword: [4, -51, 77, 68],
  } as const;
  if (item === "helmet") return false;
  const [x, y, w, h] = layouts[item];
  return visualLibrary.drawCentered(c, "props_armor_" + item, x, y, w, h);
}

/** Separate shell and cheek/rim layers keep the face visible through dark interior art. */
export function helmetLayer(
  c: CanvasRenderingContext2D,
  slip: number,
  front: boolean,
) {
  const image = visualLibrary.image("props_armor_helmet");
  if (!image) return false;
  const scale = 75 / 340,
    top = -147 + slip - (388 * scale) / 2,
    left = -37.5;
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
    c.rect(left - 1, top - 1, 77, 388 * scale + 2);
    c.moveTo(left + hole[0][0] * scale, top + hole[0][1] * scale);
    for (const [x, y] of hole.slice(1))
      c.lineTo(left + x * scale, top + y * scale);
    c.closePath();
    c.clip("evenodd");
  }
  visualLibrary.drawCentered(c, "props_armor_helmet", 0, -147 + slip, 75, 86);
  c.restore();
  return true;
}
