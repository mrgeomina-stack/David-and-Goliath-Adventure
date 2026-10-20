import type { Point } from "./model";

type Triangle = [Point, Point, Point];
/** Cached alpha-isolated art. Mesh deformation moves painted pixels, not flat replacement limbs. */
export class CharacterMesh {
  readonly canvas: HTMLCanvasElement;
  readonly triangles: Triangle[] = [];
  readonly left: number;
  readonly top: number;
  constructor(image: HTMLImageElement, outline: number[][], step = 48) {
    this.left = Math.floor(Math.min(...outline.map((p) => p[0])));
    this.top = Math.floor(Math.min(...outline.map((p) => p[1])));
    const width = Math.ceil(Math.max(...outline.map((p) => p[0]))) - this.left;
    const height = Math.ceil(Math.max(...outline.map((p) => p[1]))) - this.top;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    const c = this.canvas.getContext("2d", { willReadFrequently: true })!;
    c.translate(-this.left, -this.top);
    c.beginPath();
    outline.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.clip();
    c.drawImage(image, 0, 0);
    const rgba = c.getImageData(0, 0, width, height).data;
    for (let y = 0; y < height; y += step)
      for (let x = 0; x < width; x += step) {
        const right = Math.min(x + step, width),
          bottom = Math.min(y + step, height);
        let visible = false;
        for (let py = y; py < bottom && !visible; py++)
          for (let px = x; px < right; px++) {
            if (rgba[(py * width + px) * 4 + 3] > 12) {
              visible = true;
              break;
            }
          }
        if (!visible) continue;
        const a = { x: x + this.left, y: y + this.top },
          b = { x: right + this.left, y: y + this.top };
        const d = { x: x + this.left, y: bottom + this.top },
          e = { x: right + this.left, y: bottom + this.top };
        this.triangles.push([a, b, e], [a, e, d]);
      }
  }
  drawFlat(c: CanvasRenderingContext2D, origin: Point, scale: number) {
    c.drawImage(
      this.canvas,
      (this.left - origin.x) * scale,
      (this.top - origin.y) * scale,
      this.canvas.width * scale,
      this.canvas.height * scale,
    );
  }
  draw(
    c: CanvasRenderingContext2D,
    transform: (point: Point) => Point,
    frontOnly?: (point: Point) => boolean,
  ) {
    // Shared transformed vertices prevent cracks between adjacent triangles.
    const vertices = new Map<Point, Point>();
    const at = (p: Point) => {
      let v = vertices.get(p);
      if (!v) {
        v = transform(p);
        vertices.set(p, v);
      }
      return v;
    };
    for (const triangle of this.triangles) {
      if (
        frontOnly &&
        !frontOnly({
          x: triangle.reduce((s, p) => s + p.x, 0) / 3,
          y: triangle.reduce((s, p) => s + p.y, 0) / 3,
        })
      )
        continue;
      const [a, b, d] = triangle,
        [u, v, w] = triangle.map(at);
      const sx = b.x - a.x,
        sy = b.y - a.y,
        tx = d.x - a.x,
        ty = d.y - a.y,
        determinant = sx * ty - tx * sy;
      if (!determinant) continue;
      const ma = ((v.x - u.x) * ty - (w.x - u.x) * sy) / determinant;
      const mc = ((w.x - u.x) * sx - (v.x - u.x) * tx) / determinant;
      const mb = ((v.y - u.y) * ty - (w.y - u.y) * sy) / determinant;
      const md = ((w.y - u.y) * sx - (v.y - u.y) * tx) / determinant;
      const center = { x: (u.x + v.x + w.x) / 3, y: (u.y + v.y + w.y) / 3 };
      c.save();
      c.beginPath();
      for (const [i, p] of [u, v, w].entries()) {
        const dx = p.x - center.x,
          dy = p.y - center.y,
          len = Math.hypot(dx, dy) || 1;
        const x = p.x + (dx / len) * 0.22,
          y = p.y + (dy / len) * 0.22;
        if (i) c.lineTo(x, y);
        else c.moveTo(x, y);
      }
      c.closePath();
      c.clip();
      c.transform(
        ma,
        mb,
        mc,
        md,
        u.x - ma * a.x - mc * a.y,
        u.y - mb * a.x - md * a.y,
      );
      c.drawImage(this.canvas, this.left, this.top);
      c.restore();
    }
  }
}
