export function fittedScale(width: number, height: number) {
  return Math.max(0.1, Math.min(width / 1280, height / 720));
}
export function compactLayout(width: number, height: number) {
  return width < 1280 || height < 720;
}
export function ensureCanvasSupport() {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (
      x: number,
      y: number,
      w: number,
      h: number,
      radii: number | DOMPointInit | Iterable<number | DOMPointInit> = 0,
    ) {
      const raw =
        typeof radii === "number"
          ? radii
          : Array.isArray(radii)
            ? Number(radii[0] || 0)
            : 0;
      const r = Math.max(0, Math.min(raw, Math.abs(w) / 2, Math.abs(h) / 2));
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }
}
