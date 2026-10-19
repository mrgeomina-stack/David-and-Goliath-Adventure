import type { Ctx } from "./art";

type Frame = { x: number; y: number; w: number; h: number };
/** Alpha-trim each atlas cell once; source illustrations remain intact. */
export class Atlas {
  frames: Frame[] = [];
  private surfaces: HTMLCanvasElement[] = [];
  bake() {
    this.surfaces = this.frames.map((f) => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 512 / Math.max(f.w, f.h));
      canvas.width = Math.ceil(f.w * scale);
      canvas.height = Math.ceil(f.h * scale);
      canvas
        .getContext("2d")!
        .drawImage(
          this.image,
          f.x,
          f.y,
          f.w,
          f.h,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      return canvas;
    });
  }
  constructor(
    public image: HTMLImageElement,
    cols: number,
    rows: number,
  ) {
    const surface = document.createElement("canvas");
    surface.width = image.width;
    surface.height = image.height;
    const c = surface.getContext("2d", { willReadFrequently: true })!;
    c.drawImage(image, 0, 0);
    const pixels = c.getImageData(0, 0, image.width, image.height).data;
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) {
        const left = Math.floor((col * image.width) / cols),
          right = Math.floor(((col + 1) * image.width) / cols);
        const top = Math.floor((row * image.height) / rows),
          bottom = Math.floor(((row + 1) * image.height) / rows);
        let x0 = right,
          y0 = bottom,
          x1 = left,
          y1 = top;
        for (let y = top; y < bottom; y++)
          for (let x = left; x < right; x++)
            if (pixels[(y * image.width + x) * 4 + 3] > 180) {
              x0 = Math.min(x0, x);
              x1 = Math.max(x1, x);
              y0 = Math.min(y0, y);
              y1 = Math.max(y1, y);
            }
        this.frames.push({
          x: x0,
          y: y0,
          w: Math.max(1, x1 - x0 + 1),
          h: Math.max(1, y1 - y0 + 1),
        });
      }
  }
  draw(
    c: Ctx,
    index: number,
    x: number,
    y: number,
    w: number,
    h: number,
    fit = true,
  ) {
    const f = this.frames[index];
    if (fit) {
      const scale = Math.min(w / f.w, h / f.h);
      const dw = f.w * scale,
        dh = f.h * scale;
      x += (w - dw) / 2;
      y += (h - dh) / 2;
      w = dw;
      h = dh;
    }
    const source = this.surfaces[index];
    if (source) c.drawImage(source, x, y, w, h);
    else c.drawImage(this.image, f.x, f.y, f.w, f.h, x, y, w, h);
  }
}
export let painted:
  | { animals: Atlas; props: Atlas; cast: Atlas; hero: HTMLImageElement }
  | undefined;
export function configurePainted(
  animals: HTMLImageElement,
  props: HTMLImageElement,
  cast: HTMLImageElement,
  hero: HTMLImageElement,
) {
  painted = {
    animals: new Atlas(animals, 4, 3),
    props: new Atlas(props, 4, 3),
    cast: new Atlas(cast, 3, 2),
    hero,
  };
  painted.animals.frames = [
    { x: 15, y: 45, w: 475, h: 300 },
    { x: 500, y: 35, w: 340, h: 300 },
    { x: 895, y: 25, w: 180, h: 325 },
    { x: 1200, y: 5, w: 225, h: 345 },
    { x: 20, y: 385, w: 480, h: 315 },
    { x: 505, y: 345, w: 365, h: 420 },
    { x: 900, y: 375, w: 210, h: 345 },
    { x: 1190, y: 365, w: 235, h: 355 },
    { x: 25, y: 725, w: 350, h: 350 },
    { x: 405, y: 805, w: 300, h: 240 },
    { x: 725, y: 765, w: 445, h: 300 },
    { x: 1180, y: 730, w: 260, h: 340 },
  ];
  // Authored rows are optical layouts, not exact mathematical grid boundaries.
  // Explicit cuts keep long garments out of the pebble row.
  painted.props.frames = [
    { x: 15, y: 15, w: 355, h: 405 },
    { x: 380, y: 20, w: 350, h: 400 },
    { x: 765, y: 30, w: 305, h: 380 },
    { x: 1110, y: 5, w: 338, h: 435 },
    { x: 20, y: 455, w: 330, h: 250 },
    { x: 390, y: 455, w: 330, h: 250 },
    { x: 765, y: 455, w: 315, h: 250 },
    { x: 1110, y: 455, w: 330, h: 250 },
    { x: 20, y: 770, w: 335, h: 240 },
    { x: 390, y: 725, w: 335, h: 335 },
    { x: 755, y: 725, w: 330, h: 340 },
    { x: 1110, y: 725, w: 330, h: 345 },
  ];
  painted.animals.bake();
  painted.props.bake();
  painted.cast.bake();
}
export function pebble(
  c: Ctx,
  index: number,
  x: number,
  y: number,
  w = 72,
  h = 54,
) {
  painted?.props.draw(c, 4 + (index % 8), x - w / 2, y - h / 2, w, h);
}
