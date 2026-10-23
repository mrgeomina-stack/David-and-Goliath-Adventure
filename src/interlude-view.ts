import { CharacterMesh } from "./character-mesh";
import type { StoryInterlude } from "./interlude";
import welcome from "./assets/interludes/jesse-welcome.png";
import handover from "./assets/interludes/jesse-handover.png";
import close from "./assets/interludes/jesse-close.png";
import farewell from "./assets/interludes/jesse-farewell.png";
import actor from "./assets/interludes/goliath-actor.png";
import plate from "./assets/interludes/valley-plate.png";
import laugh from "./assets/interludes/goliath-laugh.png";
import challenge from "./assets/interludes/goliath-challenge.png";
export const interludeAssets = {
  "story-jesse-0": welcome,
  "story-jesse-1": handover,
  "story-jesse-2": close,
  "story-jesse-3": farewell,
  "story-giant": actor,
  "story-valley": plate,
  "story-laugh": laugh,
  "story-challenge": challenge,
};
let giantMesh: CharacterMesh | undefined;
let handoverMesh: CharacterMesh | undefined;
const smooth = (n: number) => {
  const x = Math.max(0, Math.min(1, n));
  return x * x * (3 - 2 * x);
};
function painting(
  c: CanvasRenderingContext2D,
  im: HTMLImageElement,
  zoom: number,
  x = 0,
  y = 0,
) {
  c.save();
  c.translate(640 + x, 405 + y);
  c.scale(zoom, zoom);
  c.drawImage(im, -640, -360, 1280, 720);
  c.restore();
}
function dust(c: CanvasRenderingContext2D, t: number, at: number) {
  const u = t - at;
  if (u < 0 || u > 1.8) return;
  c.save();
  for (let i = 0; i < 24; i++) {
    const dir = i % 2 ? 1 : -1,
      speed = 18 + ((i * 37) % 70);
    const x = (at === 3.6 ? 735 : 575) + dir * speed * u,
      y = 516 - 25 * Math.sin(Math.min(1, u) * Math.PI) + (i % 4) * 5;
    c.globalAlpha = (1 - u / 1.8) * 0.4;
    c.fillStyle = i % 3 ? "#d9aa70" : "#a97a49";
    c.beginPath();
    c.ellipse(x, y, 6 + u * 15, 3 + u * 8, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}
/** Supplied story poses + a single continuous painted mesh; no rasterized text. */
export function drawInterlude(
  c: CanvasRenderingContext2D,
  story: StoryInterlude,
  image: (key: string) => HTMLImageElement,
) {
  const reduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const t = story.time;
  c.save();
  c.fillStyle = "#142e36";
  c.fillRect(0, 0, 1280, 720);
  if (story.id === "jesse") {
    const beat = story.beat,
      local = t - beat * 4;
    if (beat === 1 && !reduced) {
      const im = image("story-jesse-1");
      handoverMesh ??= new CharacterMesh(
        im,
        [
          [0, 0],
          [im.width, 0],
          [im.width, im.height],
          [0, im.height],
        ],
        96,
      );
      c.save();
      c.translate(640, 405);
      c.scale(1.015 + local * 0.004, 1.015 + local * 0.004);
      c.translate(-640, -360);
      handoverMesh.draw(c, (p) => {
        // Move the basket and its supporting hands as one connected painted region.
        const weight = Math.exp(
          -(((p.x - 780) / 350) ** 2) - ((p.y - 565) / 220) ** 2,
        );
        const offer = smooth(local / 4);
        return {
          x: (p.x / im.width) * 1280 + weight * offer * 13,
          y:
            (p.y / im.height) * 720 +
            weight * Math.sin((local * Math.PI) / 4) * 5,
        };
      });
      c.restore();
    } else
      painting(
        c,
        image(`story-jesse-${beat}`),
        reduced ? 1 : 1.015 + Math.min(local, 6) * 0.004,
        reduced ? 0 : Math.sin(local * 0.2) * 4,
        0,
      );
    // Fade through warm shade instead of overlapping different faces/poses.
    const transition =
      beat > 0 && local < 0.35
        ? 1 - smooth(local / 0.35)
        : beat < 3 && local > 3.65
          ? smooth((local - 3.65) / 0.35)
          : 0;
    if (transition > 0) {
      c.fillStyle = `rgba(35,41,35,${transition})`;
      c.fillRect(0, 78, 1280, 642);
    }
    // Sunlit drifting seeds continue across the handover and departure.
    if (!reduced)
      for (let i = 0; i < 16; i++) {
        c.fillStyle = "#fff3b47a";
        c.beginPath();
        c.arc(
          (i * 103 + t * (5 + (i % 4))) % 1280,
          180 + ((i * 41) % 350) + Math.sin(t + i) * 9,
          1.4,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
  } else {
    const shock = [1.8, 3.6].reduce((v, at) => {
      const u = t - at;
      return (
        v + (u >= 0 && u < 0.5 ? Math.sin(u * 65) * Math.exp(-u * 10) * 5 : 0)
      );
    }, 0);
    // Bottom-anchor the valley in the cinematic picture area. The giant's soles
    // and contact shadow must sit on rocky foreground, not on the distant hills.
    c.save();
    c.beginPath();
    c.rect(0, 78, 1280, 500);
    c.clip();
    painting(c, image("story-valley"), 1.02, reduced ? 0 : shock, -194);
    c.restore();
    const im = image("story-giant");
    giantMesh ??= new CharacterMesh(
      im,
      [
        [0, 0],
        [im.width, 0],
        [im.width, im.height],
        [0, im.height],
      ],
      96,
    );
    const liftAt = (at: number) =>
      t > at - 0.6 && t < at ? Math.sin((Math.PI * (t - at + 0.6)) / 0.6) : 0;
    const frontLift = liftAt(1.8),
      rearLift = liftAt(3.6);
    const chuckle =
      t >= 4.5 && t < 7 ? Math.sin(((t - 4.5) * Math.PI * 2) / 0.34) : 0;
    const breathing = Math.sin(t * 2.1);
    c.save();
    c.fillStyle = "#3a25174d";
    c.beginPath();
    c.ellipse(641, 520, 170, 17, 0, 0, Math.PI * 2);
    c.fill();
    giantMesh.draw(c, (p) => {
      const upper = 1 - smooth((p.y - 800) / 600);
      const foreleg =
        smooth((p.y - 850) / 580) * (1 - smooth((p.x - 520) / 180));
      const rearleg = smooth((p.y - 1000) / 400) * smooth((p.x - 620) / 180);
      const sway = reduced
        ? 0
        : breathing * 2 * upper + Math.sin(t * 3 + p.y / 300) * 3 * upper;
      return {
        x: 640 + (p.x - 512) * 0.3 + sway,
        y:
          520 +
          (p.y - 1470) * 0.3 +
          (reduced
            ? 0
            : -frontLift * 42 * foreleg -
              rearLift * 34 * rearleg +
              chuckle * 3.8 * upper +
              breathing * 1.4 * upper),
      };
    });
    c.restore();
    if (!reduced) {
      dust(c, t, 1.8);
      dust(c, t, 3.6);
    }
    // Brief clean closeups use the user's original laughter/challenge poses.
    const shot =
      t >= 7 && t < 10
        ? "story-laugh"
        : t >= 10 && t < 13
          ? "story-challenge"
          : null;
    if (shot) {
      const local = t - (shot === "story-laugh" ? 7 : 10);
      c.save();
      painting(
        c,
        image(shot),
        reduced ? 1 : 1.015 + local * 0.009,
        0,
        reduced ? 0 : chuckle * 2,
      );
      c.restore();
    }
    const cutFade = [7, 10, 13].reduce(
      (v, at) => Math.max(v, 1 - smooth(Math.abs(t - at) / 0.25)),
      0,
    );
    if (cutFade > 0) {
      c.fillStyle = `rgba(18,37,45,${cutFade})`;
      c.fillRect(0, 78, 1280, 642);
    }
  }
  // A warm letterbox and legible lower fade frame the editable DOM captions.
  const fade = c.createLinearGradient(0, 460, 0, 720);
  fade.addColorStop(0, "#0b273800");
  fade.addColorStop(1, "#0b2738cc");
  c.fillStyle = fade;
  c.fillRect(0, 460, 1280, 260);
  c.fillStyle = "#12252dcc";
  c.fillRect(0, 68, 1280, 10);
  const enter = 1 - smooth(t / 0.8);
  if (enter > 0) {
    c.fillStyle = `rgba(18,37,45,${enter})`;
    c.fillRect(0, 68, 1280, 652);
  }
  c.restore();
}
