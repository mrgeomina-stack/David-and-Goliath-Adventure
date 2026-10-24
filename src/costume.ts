import { visualLibrary } from "./visual-assets";
import type { Gear, Point } from "./model";
import { CharacterMesh } from "./character-mesh";

// Worn artwork has its own body fit; tray sprites keep their original proportions.
const fits = {
  tunic: { x: -29, y: -138, w: 58, h: 89 },
  mail: { x: -30, y: -137, w: 60, h: 79 },
  sword: { x: -29, y: -110, w: 62, h: 83 },
} as const;
const openings = {
  tunic: [
    [
      [175, 32],
      [207, 31],
      [252, 45],
      [281, 63],
      [282, 72],
      [265, 73],
      [224, 56],
      [188, 39],
    ],
    [
      [52, 107],
      [69, 122],
      [83, 153],
      [87, 190],
      [81, 221],
      [66, 238],
      [51, 217],
      [39, 178],
      [36, 138],
    ],
  ],
  mail: [
    [
      [149, 24],
      [176, 23],
      [225, 27],
      [268, 40],
      [290, 58],
      [289, 77],
      [276, 87],
      [246, 84],
      [209, 70],
      [176, 50],
      [155, 33],
    ],
    [
      [27, 88],
      [49, 88],
      [70, 114],
      [91, 155],
      [101, 196],
      [95, 222],
      [77, 238],
      [60, 240],
      [43, 210],
      [30, 169],
      [24, 122],
    ],
  ],
};
const worn = new Map<Gear, CharacterMesh>();

/** Remove the empty prop cavities once, then skin the clothing to David's torso. */
export function wornGear(
  c: CanvasRenderingContext2D,
  item: Gear,
  pose: (point: Point) => Point,
  deformed = false,
) {
  if (item === "helmet") return false;
  const image = visualLibrary.image("props_armor_" + item);
  if (!image) return false;
  let mesh = worn.get(item);
  if (!mesh) {
    mesh = new CharacterMesh(
      image,
      [
        [0, 0],
        [image.width, 0],
        [image.width, image.height],
        [0, image.height],
      ],
      32,
    );
    if (item !== "sword") {
      const mask = mesh.canvas.getContext("2d")!;
      mask.save();
      mask.globalCompositeOperation = "destination-out";
      for (const hole of openings[item]) {
        mask.beginPath();
        hole.forEach(([x, y], i) =>
          i ? mask.lineTo(x, y) : mask.moveTo(x, y),
        );
        mask.closePath();
        mask.fill();
      }
      mask.restore();
    }
    worn.set(item, mesh);
  }
  const fit = fits[item];
  if (!deformed) {
    // A single cached draw during normal play keeps touch devices responsive.
    const origin = pose({ x: fit.x, y: fit.y });
    c.drawImage(mesh.canvas, origin.x, origin.y, fit.w, fit.h);
    return true;
  }
  mesh.draw(c, (p) =>
    pose({
      x: fit.x + (p.x / image.width) * fit.w,
      y: fit.y + (p.y / image.height) * fit.h,
    }),
  );
  return true;
}

/** Fit the shell around the actual head, leaving David visible inside the opening. */
export function helmetLayer(
  c: CanvasRenderingContext2D,
  slip: number,
  front: boolean,
) {
  const image = visualLibrary.image("props_armor_helmet");
  if (!image) return false;
  const width = 55,
    height = (width * image.height) / image.width;
  const left = -width / 2,
    top = -155 + slip - height / 2;
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
    c.rect(left - 1, top - 1, width + 2, height + 2);
    hole.forEach(([x, y], i) => {
      const px = left + (x / image.width) * width,
        py = top + (y / image.height) * height;
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    });
    c.closePath();
    c.clip("evenodd");
  }
  c.drawImage(image, left, top, width, height);
  c.restore();
  return true;
}
