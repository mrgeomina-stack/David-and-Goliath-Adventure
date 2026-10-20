import type { Ctx } from "./art";
import { painted } from "./painted";
export type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  kind: "dust" | "spark" | "water";
};
export class Effects {
  particles: Mote[] = [];
  burst(x: number, y: number, kind: Mote["kind"] = "spark", count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399,
        force = 25 + (i % 5) * 16,
        life = 0.45 + (i % 4) * 0.13;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * force,
        vy: -30 + Math.sin(angle) * force,
        life,
        max: life,
        color:
          kind === "water"
            ? "#c9f6ed"
            : kind === "dust"
              ? "#e7c991"
              : ["#ffd674", "#fff7c1", "#a7d9bc"][i % 3],
        size: kind === "dust" ? 4 + (i % 4) : 2 + (i % 3),
        kind,
      });
    }
    if (this.particles.length > 160)
      this.particles.splice(0, this.particles.length - 160);
  }
  update(dt: number) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.kind === "water" ? 200 : 90) * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }
  draw(c: Ctx) {
    c.save();
    for (const p of this.particles) {
      c.globalAlpha = p.life / p.max;
      c.fillStyle = p.color;
      c.beginPath();
      if (p.kind === "spark") {
        const r = p.size;
        c.moveTo(p.x - r, p.y);
        c.lineTo(p.x, p.y - r * 1.7);
        c.lineTo(p.x + r, p.y);
        c.lineTo(p.x, p.y + r * 1.7);
        c.closePath();
      } else
        c.ellipse(
          p.x,
          p.y,
          p.size,
          p.kind === "water" ? p.size * 1.6 : p.size,
          0,
          0,
          Math.PI * 2,
        );
      c.fill();
    }
    c.restore();
  }
}
/** Scenic movement never changes gameplay geometry or obscures the maze. */
export function depth(c: Ctx, time: number, mode: string, front = false) {
  c.save();
  if (!front) {
    if (mode !== "armor") {
      c.globalAlpha = 0.07;
      c.fillStyle = "#fff5d9";
      for (let i = 0; i < 3; i++) {
        const x = ((time * 3 + i * 480) % 1600) - 180;
        c.beginPath();
        c.ellipse(x, 155 + i * 14, 100, 12, 0, 0, Math.PI * 2);
        c.fill();
      }
    }
    const g = c.createRadialGradient(1050, 180, 2, 1050, 180, 440);
    g.addColorStop(
      0,
      `rgba(255,224,155,${0.045 + Math.sin(time * 0.4) * 0.015})`,
    );
    g.addColorStop(1, "#ffe7b900");
    c.fillStyle = g;
    c.fillRect(550, 90, 730, 540);
  } else if (mode !== "armor" && painted) {
    for (const [x, y, s] of [
      [22, 625, 0.5],
      [1249, 629, 0.55],
    ]) {
      c.save();
      c.translate(x, y);
      c.rotate(Math.sin(time * 1.2 + x) * 0.025);
      painted.animals.draw(c, 10, -90 * s, -70 * s, 180 * s, 85 * s);
      c.restore();
    }
  }
  c.restore();
}
export function cinematicFrame(c: Ctx, t: number, color = "#1d4846") {
  c.save();
  c.globalAlpha = Math.min(1, t * 3) * Math.max(0, 1 - t / 3.5) * 0.65;
  c.fillStyle = color;
  c.fillRect(0, 88, 1280, 13);
  c.fillRect(0, 614, 1280, 13);
  c.restore();
}
