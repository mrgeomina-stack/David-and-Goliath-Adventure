import { clamp, lerp } from "./model";
import { visualLibrary } from "./visual-assets";

/** One continuous object changes hands; the four-second success gate is untouched. */
export function deliveryAt(time: number) {
  const approach = clamp(time / 0.8, 0, 1),
    pass = clamp((time - 0.8) / 1.5, 0, 1);
  const davidX = lerp(387, 485, approach) + 40 * pass;
  return {
    davidX,
    basket: { x: lerp(davidX, 575, pass), y: lerp(467.6, 446, pass) },
    owner: time < 2.05 ? "david" : time < 2.3 ? "shared" : "brother",
    davidHolding: time < 2.3,
    brotherReach: clamp((time - 1.8) / 0.25, 0, 1),
    walk:
      time < 0.8
        ? Math.sin(time * 20)
        : time < 2.3
          ? Math.sin(time * 14) * 0.22
          : 0,
  };
}

/** Canvas basket remains a working fallback until the supplied PNG is present. */
export function foodBasket(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  if (visualLibrary.drawCentered(c, "props_food_basket", 0, 0, 70, 51)) {
    c.restore();
    return;
  }
  c.strokeStyle = "#8e6035";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(-23, -9);
  c.bezierCurveTo(-25, -51, 25, -51, 23, -9);
  c.stroke();
  for (const [bx, by, angle] of [
    [-12, -15, -0.2],
    [8, -17, 0.15],
    [19, -10, 0.35],
  ]) {
    c.save();
    c.translate(bx, by);
    c.rotate(angle);
    c.fillStyle = "#d89c4f";
    c.beginPath();
    c.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#ffdf91";
    c.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(i * 7 - 2, -5);
      c.lineTo(i * 7 + 1, 1);
      c.stroke();
    }
    c.restore();
  }
  const g = c.createLinearGradient(-30, -8, 30, 15);
  g.addColorStop(0, "#ddb67b");
  g.addColorStop(0.5, "#bc8647");
  g.addColorStop(1, "#8b5d2d");
  c.beginPath();
  c.moveTo(-30, -10);
  c.lineTo(30, -10);
  c.lineTo(23, 20);
  c.quadraticCurveTo(0, 26, -23, 20);
  c.closePath();
  c.fillStyle = g;
  c.fill();
  c.save();
  c.clip();
  c.lineWidth = 1.2;
  for (let row = 0; row < 7; row++) {
    c.strokeStyle = row % 2 ? "#f1cf91" : "#94652f";
    c.beginPath();
    c.moveTo(-32, -7 + row * 5);
    c.quadraticCurveTo(0, row * 5, 32, -7 + row * 5);
    c.stroke();
  }
  c.strokeStyle = "#704c2d66";
  for (let col = 0; col < 12; col++) {
    c.beginPath();
    c.moveTo(-30 + col * 5, -10);
    c.lineTo(-23 + col * 4.1, 23);
    c.stroke();
  }
  c.restore();
  c.strokeStyle = "#e8c18a";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(-30, -10);
  c.quadraticCurveTo(0, -5, 30, -10);
  c.stroke();
  c.restore();
}
