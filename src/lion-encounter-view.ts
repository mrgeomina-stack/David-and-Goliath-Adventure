import * as A from "./art";
import { drawHeroHand } from "./hero";
import { visualLibrary } from "./visual-assets";
import { clamp, lerp } from "./model";
import type { LionEncounter, LionStage } from "./lion-encounter";
import type { Language } from "./strings";
export const lionLines: Record<LionStage, [string, string]> = {
  idle: ["Protect the flock", "احمِ الخراف"],
  wander: ["One lamb is wandering away!", "خروف صغير ابتعد عن الحظيرة!"],
  seize: [
    "The lion has the lamb. David will help!",
    "الأسد أمسك بالخروف. داود هيساعده!",
  ],
  focus: ["Get ready to rescue the lamb!", "استعد لإنقاذ الخروف!"],
  rescue: [
    "Press SPACE / A / Tap in the green to rescue!",
    "اضغط مسافة أو A أو المس في الأخضر لإنقاذ الخروف!",
  ],
  rush: [
    "David rushes in and lifts the lamb to safety!",
    "داود يجري وينقذ الخروف ويحمله بأمان!",
  ],
  defend: [
    "The lion turns! Press in the green to defend!",
    "الأسد يلتفت! اضغط في الأخضر للدفاع!",
  ],
  guard: ["A brave, careful staff defense!", "دفاع شجاع وحذر بالعصا!"],
  defeated: [
    "The lion is defeated. The lamb is safe!",
    "الأسد انهزم والخروف بخير!",
  ],
  return: [
    "The LORD helped David protect his flock. · 1 Samuel 17:34–37",
    "الرب ساعد داود يحمي خرافه. · ١ صموئيل ١٧:٣٤–٣٧",
  ],
  retry: [
    "That was close! SPACE / A / Tap to try this part again.",
    "محاولة شجاعة! اضغط مسافة أو A أو المس لتجرب هذا الجزء مجددًا.",
  ],
  done: ["All five sheep are safe!", "الخراف الخمسة بأمان!"],
};
export function drawLionActors(c: A.Ctx, b: LionEncounter, clock: number) {
  const t = b.time,
    fallen = ["defeated", "return", "done"].includes(b.stage);
  c.save();
  if (b.stage === "wander") c.globalAlpha = 0;
  if (b.stage === "seize") c.globalAlpha = clamp(t / 0.6, 0, 1);
  if (fallen) {
    const settle = b.stage === "defeated" ? clamp(t / 0.75, 0, 1) : 1;
    c.translate(b.lion.x, b.lion.y);
    c.rotate(-Math.sin(settle * Math.PI) * 0.15);
    c.globalAlpha =
      b.stage === "return"
        ? 1 - clamp((t - 2.3) / 1.2, 0, 1)
        : b.stage === "done"
          ? 0
          : 1;
    visualLibrary.drawFeet(c, "animals_lion_retreat", 0, 0, 129);
  } else {
    if (b.stage === "defend") {
      c.translate(b.lion.x, b.lion.y);
      c.rotate(-Math.sin(clamp(t / 0.8, 0, 1) * Math.PI) * 0.09);
      c.translate(-b.lion.x, -b.lion.y);
    }
    A.lion(
      c,
      b.lion.x,
      b.lion.y,
      1.35,
      clock,
      ["seize", "guard"].includes(b.stage),
    );
  }
  c.restore();
  A.bush(c, 1170, 346, 2.2);
  A.bush(c, 1235, 357, 1.8);
  if (fallen && b.stage !== "done" && !(b.stage === "return" && t > 2.3)) {
    for (let i = 0; i < 3; i++)
      A.star(
        c,
        b.lion.x - 35 + Math.cos(clock * 2 + i * 2.1) * 25,
        b.lion.y - 115 + Math.sin(clock * 2 + i * 2.1) * 8,
        6,
        "#ffe58b",
        clock,
      );
  }
  const carrying =
    b.rescued &&
    (b.stage !== "rush" || t > 0.75) &&
    b.stage !== "done" &&
    !(b.stage === "return" && t >= 5);
  const moving = ["focus", "rush", "return"].includes(b.stage);
  const guarding = b.stage === "guard";
  const carry = carrying
    ? b.stage === "return"
      ? 1 - clamp((t - 4.3) / 0.7, 0, 1)
      : b.stage === "rush"
        ? clamp((t - 0.75) / 0.6, 0, 1)
        : 1
    : undefined;
  A.person(c, b.hero.x, b.hero.y, 1, {
    facing: b.stage === "return" ? -1 : 1,
    walk: moving ? Math.sin(clock * 11) : 0,
    carry,
    tilt: guarding ? -Math.sin(Math.PI * clamp(t / 1.3, 0, 1)) * 0.1 : 0,
    hands: carrying
      ? { left: { x: -22, y: -66 }, right: { x: 46, y: -77 } }
      : undefined,
    arm: b.stage === "done" ? 1 : 0,
  });
  // Staff pivots about David's gripping hand; it never detaches or intersects the lamb.
  if (b.stage !== "done") {
    c.save();
    c.translate(b.hero.x, b.hero.y);
    c.scale(b.stage === "return" ? -1 : 1, 1);
    c.translate(46, -77);
    c.rotate(
      guarding ? -Math.sin(Math.PI * clamp(t / 1.3, 0, 1)) * 0.95 : 0.06,
    );
    visualLibrary.drawFeet(c, "props_staff", 0, 78, 195, true);
    c.restore();
    if (guarding && t > 0.35 && t < 0.8) {
      A.star(c, 953, 415, 17, "#ffedb6", clock);
    }
  }
  if (b.stage !== "done") {
    if (b.stage === "wander") {
      A.shadow(c, b.lamb.x, b.lamb.y, 27);
      visualLibrary.drawFeet(
        c,
        visualLibrary.animationFrame("sheep_walk", clock) ||
          "animals_sheep_idle_01",
        b.lamb.x,
        b.lamb.y - Math.abs(Math.sin(clock * 10)),
        61,
      );
    } else
      A.sheep(
        c,
        b.lamb.x,
        b.lamb.y,
        b.stage === "seize" ? lerp(1, 0.85, t / 1.8) : 0.85,
        moving ? Math.sin(clock * 8) * 0.14 : 0,
        false,
        0,
      );
    if (carrying)
      drawHeroHand(
        c,
        b.hero.x + (b.stage === "return" ? 22 : -22),
        b.hero.y - 66,
        1.15,
        b.stage === "return" ? -1 : 1,
      );
  }
}
export function drawLionPrompt(c: A.Ctx, b: LionEncounter, lang: Language) {
  const line = lionLines[b.stage];
  A.gameCard(
    c,
    140,
    168,
    1000,
    74,
    b.stage === "retry" ? "#df8862" : "#e9bf58",
  );
  if (lang !== "ar")
    A.text(c, line[0], 640, lang === "both" ? 192 : 207, 19, "#235e63");
  if (lang !== "en")
    A.text(c, line[1], 640, lang === "both" ? 222 : 207, 19, "#235e63");
  if (!b.timing && b.stage !== "retry") return;
  A.gameCard(
    c,
    285,
    511,
    710,
    101,
    b.stage === "retry" ? "#df8862" : "#73b8ce",
  );
  if (b.stage === "retry") {
    A.text(
      c,
      lang === "ar"
        ? "الخراف الآمنة تظل في الحظيرة · حاول بلا حدود"
        : lang === "en"
          ? "Safe sheep stay safe · Unlimited tries"
          : "الخراف الآمنة بخير · Unlimited tries",
      640,
      555,
      19,
      "#235e63",
    );
    A.text(c, "SPACE  /  A  /  TAP", 640, 588, 21, "#b45d35");
    return;
  }
  const x = 333,
    w = 614,
    y = 557;
  A.round(c, x, y, w, 22, 11, "#d0b281");
  A.round(
    c,
    x + (w * b.window.start) / b.duration,
    y,
    (w * (b.window.end - b.window.start)) / b.duration,
    22,
    11,
    "#45af70",
  );
  A.text(
    c,
    b.inWindow
      ? lang === "ar"
        ? "اضغط الآن!"
        : lang === "en"
          ? "GO NOW!"
          : "اضغط الآن! · GO NOW!"
      : lang === "ar"
        ? "استعد… انتظر الأخضر"
        : lang === "en"
          ? "Get ready… wait for green"
          : "استعد… · Wait for green",
    640,
    539,
    21,
    b.inWindow ? "#237348" : "#6e613f",
  );
  const p = x + w * clamp(b.time / b.duration, 0, 1);
  A.ellipse(c, p, y + 11, 12, 19, "#fffbe8", "#205b64");
  A.text(c, b.stage === "rescue" ? "1 / 2" : "2 / 2", 640, 598, 17, "#235e63");
}
