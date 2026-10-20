import Phaser from "phaser";
import { visualLibrary } from "./visual-assets";
import { deliveryAt } from "./food";
import { AdventurePwa } from "./pwa";
import { bindPress } from "./touch";
import { fittedScale, compactLayout, ensureCanvasSupport } from "./mobile";
ensureCanvasSupport();
import "./style.css";
import { World } from "./world";
import { ORDER, path, GEAR, type Mission, type Point } from "./model";
import {
  teacherHelp,
  copy,
  type CopyKey,
  type Language,
  label,
} from "./strings";
import { Sound } from "./audio";
import { Journal, CHAPTERS, emblem } from "./journal";
import { Narrator } from "./narration";
import mapUrl from "./assets/journey-map.png";
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const sound = new Sound();
const narrator = new Narrator();
const pwa = new AdventurePwa(() => {
  if (world.ready) sync();
});
let localStore: Storage | null = null;
try {
  localStore = window.localStorage;
} catch {}
const journal = new Journal(localStore);
const heldDirections = new Map<HTMLElement, Point>();
let mapCache = "",
  mapWasPaused = false,
  mapReturn: HTMLElement | null = null;
$<HTMLImageElement>("journey-art").src = mapUrl;
function toggleBook() {
  if (!$("practice").hidden) {
    closeBook();
    return;
  }
  mapReturn = document.activeElement as HTMLElement;
  mapWasPaused = world.paused;
  if (world.phase !== "title") world.setPaused(true);
  $("practice").hidden = false;
  sync();
  $("map-close").focus({ preventScroll: true });
}
function closeBook() {
  $("practice").hidden = true;
  if (world.phase !== "title" && !mapWasPaused) world.setPaused(false);
  mapReturn?.focus({ preventScroll: true });
}
let lang: Language = "both",
  modalOpen = false,
  toastTimer = 0;
const toast = (s: string) => {
  $("toast").textContent = s;
  $("toast").hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => ($("toast").hidden = true), 3500);
};
const world = new World({ changed: () => sync(), toast, sound });
const game = new Phaser.Game({
  type: Phaser.CANVAS,
  parent: "game",
  width: 1280,
  height: 720,
  backgroundColor: "#acc77f",
  scene: world,
  render: { antialias: true },
  audio: { noAudio: true },
  input: { mouse: false, touch: false },
  banner: false,
  fps: { target: 60 },
});
let mobile = false,
  portraitAcknowledged = false,
  orientationPaused = false,
  orientationPrior = false;
function resize() {
  const view = window.visualViewport,
    width = view?.width || window.innerWidth,
    height = view?.height || window.innerHeight;
  const padding = getComputedStyle($("viewport"));
  const availableWidth =
    width -
    (parseFloat(padding.paddingLeft) || 0) -
    (parseFloat(padding.paddingRight) || 0);
  const availableHeight =
    height -
    (parseFloat(padding.paddingTop) || 0) -
    (parseFloat(padding.paddingBottom) || 0);
  const scale = fittedScale(availableWidth, availableHeight);
  document.documentElement.style.setProperty("--game-scale", String(scale));
  $("stage").style.transform = `scale(${scale})`;
  mobile = compactLayout(availableWidth, availableHeight);
  document.documentElement.classList.toggle("compact", mobile);
  document.documentElement.classList.toggle(
    "phone-portrait",
    width < 600 && height > width,
  );
  $("viewport").style.width = width + "px";
  $("viewport").style.height = height + "px";
  const portrait = width < 600 && height > width;
  $("rotate-notice").hidden = !portrait || portraitAcknowledged;
  if (portrait && !portraitAcknowledged && !orientationPaused) {
    orientationPaused = true;
    orientationPrior = world.paused;
    if (world.phase !== "title") world.setPaused(true);
  }
  if (!portrait && orientationPaused) {
    orientationPaused = false;
    portraitAcknowledged = false;
    if (!orientationPrior && world.phase !== "title" && !modalOpen)
      world.setPaused(false);
  }
  if (game.canvas) game.scale.refresh();
}
window.addEventListener("resize", resize);
window.visualViewport?.addEventListener("resize", resize);
window.addEventListener("orientationchange", () => {
  world.clearInput();
  requestAnimationFrame(resize);
});
$("portrait-continue").onclick = () => {
  portraitAcknowledged = true;
  $("rotate-notice").hidden = true;
  if (orientationPaused && !orientationPrior && world.phase !== "title")
    world.setPaused(false);
  orientationPaused = false;
};
resize();
const instructions: Record<Mission, [string, string, string]> = {
  sheep: [
    "↑ ↓ ← →  +  SPACE",
    "SPACE يشيل خروف • اجري للحظيرة",
    "SPACE to lift • Run to the pen",
  ],
  maze: [
    "↑ ↓ ← →",
    "امشي في الممرات لحد إخوات داود.",
    "Arrow keys / WASD • Touch arrows to explore",
  ],
  armor: [
    "DRAG → DROP",
    "اسحب، أو المس القطعة وبعدين مكانها.",
    "Drag pieces • Or tap a piece, then David",
  ],
  brook: [
    "SPACE  /  TAP",
    "التقط لما الدايرة تعدّي، أو المس حجر أملس.",
    "SPACE when the ring passes • Or tap a smooth stone",
  ],
  sling: [
    "HOLD  →  RELEASE",
    "دوس مطوّل… وبعدين سيب عشان ترمي!",
    "Hold SPACE or the button • Release to throw",
  ],
};
function bilingual(en: string, ar: string) {
  return lang === "ar" ? ar : lang === "en" ? en : `${ar} · ${en}`;
}
function textPair(arId: string, enId: string, key: CopyKey) {
  $(arId).textContent = copy[key][0];
  $(enId).textContent = copy[key][1];
}
function sync() {
  if (!document.getElementById("title")) return;
  const title = world.phase === "title",
    success = world.phase === "success",
    victory = world.phase === "victory",
    encounter = world.phase === "encounter";
  $("stage").dataset.ready = String(world.ready);
  $("pwa-settings").hidden = $("practice").hidden;
  $("pwa-status").dataset.state = pwa.state;
  $("pwa-status").textContent =
    pwa.state === "ready"
      ? bilingual("✓ Offline ready", "✓ جاهزة بدون إنترنت")
      : pwa.state === "saving"
        ? bilingual(
            "Saving adventure for offline play…",
            "بنحفظ المغامرة للعب بدون إنترنت…",
          )
        : pwa.state === "failed"
          ? bilingual(
              "Not saved yet. Connect and try again.",
              "لسه ما اتحفظتش. اتصل بالإنترنت وجرّب تاني.",
            )
          : bilingual(
              "Install from a secure hosted game link.",
              "ثبّت اللعبة من رابط الاستضافة الآمن.",
            );
  $("offline-retry").hidden = pwa.state !== "failed";
  $("pwa-update").hidden = !pwa.updateAvailable;
  $("offline-retry").textContent = bilingual("Save again", "احفظ تاني");
  $("pwa-update").textContent = bilingual("Update adventure", "حدّث المغامرة");

  $("stage").dataset.phase = world.phase;
  const labels: Record<string, string> = {
    pause: "II",
    sound: sound.muted ? "♬" : "♫",
    "book-toggle": "Book",
    narration: "◖",
    language: "ع/EN",
    fullscreen: "⛶",
    restart: "↻",
    help: "?",
    install: "＋",
  };
  for (const [id, short] of Object.entries(labels)) {
    const b = $(id);
    b.dataset.short = short;
    b.setAttribute("aria-label", b.title || b.textContent || id);
  }

  $("stage").dataset.chapter = world.mission;
  if (success && world.successTime >= world.payoffDuration)
    journal.earn(world.mission);
  const chapter = CHAPTERS.find((c) => c.mission === world.mission)!;
  $("stage").style.setProperty("--chapter-color", chapter.color);
  $("book-toggle").textContent = bilingual("✦ Book", "✦ الكتاب");
  $("narration").textContent = narrator.enabled
    ? bilingual("◖ Voice on", "◖ صوت الراوي")
    : bilingual("◖ Voice off", "◖ بدون راوي");
  $("narration").setAttribute("aria-pressed", String(narrator.enabled));
  $("music-toggle").textContent = sound.music
    ? bilingual("♫ Music on", "♫ موسيقى")
    : bilingual("♫ Music off", "♫ بدون موسيقى");
  $("music-toggle").setAttribute("aria-pressed", String(sound.music));
  $("map-title").textContent = bilingual("Your adventure book", "كتاب مغامرتك");
  $("map-eyebrow").textContent = bilingual(
    "YOUR STORYBOOK JOURNEY",
    "رحلتك في كتاب المغامرة",
  );
  $("map-note").textContent = bilingual(
    "Complete a chapter to collect its keepsake. You can replay any chapter.",
    "كمّل المهمة واجمع تذكارها. تقدر تلعب أي مهمة تاني.",
  );
  const cache = lang + ":" + mobile + ":" + [...journal.completed].join(",");
  if (cache !== mapCache) {
    mapCache = cache;
    for (const [i, ch] of CHAPTERS.entries()) {
      const button = document.querySelector<HTMLButtonElement>(
        `[data-mission="${ch.mission}"]`,
      )!;
      button.style.left = ch.position[0] + "%";
      button.style.top = ch.position[1] + "%";
      button.style.setProperty("--chapter", ch.color);
      button.classList.toggle("earned", journal.completed.has(ch.mission));
      button.setAttribute(
        "aria-label",
        `${i + 1}. ${bilingual(ch.name[0], ch.name[1])}${journal.completed.has(ch.mission) ? " ✓" : ""}`,
      );
      const shortNames = [
        ["Sheep", "الخراف"],
        ["Maze", "المتاهة"],
        ["Armour", "الدرع"],
        ["Brook", "الجدول"],
        ["Goliath", "جليات"],
      ];
      const chapterName = mobile
        ? bilingual(shortNames[i][0], shortNames[i][1])
        : bilingual(ch.name[0], ch.name[1]);
      button.innerHTML = `<span class="chapter-art">${emblem(ch.icon)}</span><span class="chapter-label"><b>${i + 1}</b> ${chapterName}</span><span class="chapter-tick">${journal.completed.has(ch.mission) ? "✓" : "↗"}</span>`;
    }
    $("keepsakes").innerHTML = CHAPTERS.map(
      (ch) =>
        `<div class="keepsake ${journal.completed.has(ch.mission) ? "collected" : ""}" aria-label="${bilingual(ch.gift[0], ch.gift[1])}: ${journal.completed.has(ch.mission) ? "earned" : "not yet earned"}">${emblem(ch.giftIcon)}<span>${bilingual(ch.gift[0], ch.gift[1])}</span>${journal.completed.has(ch.mission) ? "<b>✓</b>" : "<b>·</b>"}</div>`,
    ).join("");
  }
  if (world.paused || title) heldDirections.clear();
  if (world.paused || title) narrator.stop();
  else
    narrator.speak(
      `${world.run}:${world.phase}:${world.mission}:${lang}:${world.failed}`,
      world.failed
        ? "Let’s try again. You can do it."
        : success
          ? copy[`${world.mission}Success` as CopyKey][1]
          : copy[world.mission][1],
      world.failed
        ? "يلا نجرّب تاني. إنت تقدر."
        : success
          ? copy[`${world.mission}Success` as CopyKey][0]
          : copy[world.mission][0],
      lang,
      sound.muted,
    );
  $<HTMLButtonElement>("start").disabled = !world.ready;
  $<HTMLButtonElement>("practice-toggle").disabled = !world.ready;
  $("title").hidden = !title;
  $("title-note").hidden = !title;
  $("mission").hidden = title || victory;
  $("bottom").hidden = title || victory;
  $("pause").hidden = title;
  $("message").hidden = !(
    (success && world.successTime >= world.payoffDuration) ||
    victory ||
    (world.phase === "play" &&
      world.mission === "sling" &&
      world.sling.state === "miss") ||
    world.failed
  );
  document.querySelector(".title-card p")!.innerHTML =
    lang === "ar"
      ? "راعي صغير.<br>رحلة شجاعة ومحبة وإيمان."
      : "One small shepherd.<br>A journey of courage, kindness & faith.";
  $("practice-toggle").textContent =
    lang === "ar" ? "اختار مهمة →" : "Choose a mission →";
  $("title-note").textContent =
    lang === "ar" ? "✦ خطوات صغيرة… وإيمان كبير." : "✦ Small steps. Big faith.";
  const difficultyLabels = [
    bilingual("Easy · Little explorers", "سهل · مستكشفين صغار"),
    bilingual("Normal · Brave adventurers", "عادي · مغامرين شجعان"),
    bilingual("Free play · Take your time", "لعب حر · براحتك"),
  ];
  Array.from($<HTMLSelectElement>("difficulty").options).forEach(
    (o, i) => (o.textContent = difficultyLabels[i]),
  );
  const key: CopyKey = encounter ? "encounter" : world.mission;
  textPair("objective-ar", "objective-en", key);
  $("mission-badge").textContent = String(ORDER.indexOf(world.mission) + 1);
  $("progress").textContent =
    world.mission === "sheep"
      ? `${world.sheep.count} / 4 🐑`
      : world.mission === "armor"
        ? `${world.armor.equipped.size} / 4`
        : world.mission === "brook"
          ? `${world.brook.count} / 5`
          : `${lang === "ar" ? "المهمة" : "MISSION"} ${ORDER.indexOf(world.mission) + 1} / 5`;
  const clock = $("sheep-clock");
  clock.hidden = world.mission !== "sheep" || world.phase !== "play";
  const remaining = world.sheep.remaining;
  const seconds = remaining === null ? null : Math.ceil(remaining);
  const stamp =
    seconds === null
      ? "∞"
      : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  $("sheep-time").textContent = stamp;
  clock.classList.toggle("warning", remaining !== null && remaining <= 30);
  clock.classList.toggle("urgent", remaining !== null && remaining <= 15);
  $("sheep-warning").textContent =
    remaining === null
      ? bilingual("Free play", "لعب حر")
      : world.failed
        ? bilingual("Try again", "جرّب تاني")
        : remaining === 0
          ? bilingual("Lion is chasing! Run!", "الأسد بيجري! اجري!")
          : remaining <= 30
            ? bilingual("Hurry—save the sheep!", "بسرعة، أنقذ الخراف!")
            : bilingual(
                "Save all four before the lion!",
                "أنقذ الأربعة قبل الأسد!",
              );
  if (mobile)
    $("sheep-warning").textContent =
      remaining === null
        ? bilingual("Free", "حر")
        : world.failed
          ? bilingual("Retry", "تاني")
          : remaining === 0
            ? bilingual("Run!", "اجري!")
            : remaining <= 30
              ? bilingual("Hurry!", "بسرعة!")
              : bilingual("Time", "الوقت");
  clock.setAttribute("aria-label", `Rescue time remaining: ${stamp}`);
  $("directions").hidden =
    !encounter && !["maze", "sheep"].includes(world.mission);
  $("action").hidden =
    encounter || !["sheep", "brook", "sling"].includes(world.mission);
  $("input-controls").hidden = success;
  const instruction = instructions[world.mission];
  const legend =
    lang === "ar"
      ? {
          sheep: "الأسهم + شيل",
          maze: "↑ ↓ ← →",
          armor: "اسحب → حط",
          brook: "SPACE / المس",
          sling: "دوس → سيب",
        }[world.mission]
      : instruction[0];
  $("instruction").innerHTML =
    lang === "ar"
      ? instruction[1]
      : lang === "en"
        ? instruction[2]
        : `${instruction[1]}<br>${instruction[2]}`;
  if (encounter)
    $("instruction").textContent = world.heard
      ? bilingual("← Return to Saul’s tent", "ارجع لخيمة شاول ←")
      : bilingual("Walk closer to hear Goliath →", "قرّب عشان تسمع جليات ←");
  const action: CopyKey =
    world.mission === "sheep"
      ? "call"
      : world.mission === "brook"
        ? "scoop"
        : "charge";
  $("action").textContent =
    world.mission === "sheep" && world.sheep.carried
      ? bilingual("To the pen", "للحظيرة")
      : label(action, lang);
  $("hint").textContent = "✧ " + label("hint", lang);
  $("hint").hidden = success || encounter;
  const miss =
    world.failed || (world.mission === "sling" && world.sling.state === "miss");
  if (!$("message").hidden) {
    let k: CopyKey = miss
      ? "miss"
      : victory
        ? "victory"
        : (`${world.mission}Success` as CopyKey);
    textPair("message-ar", "message-en", k);
    if (world.failed) {
      $("message-ar").textContent =
        "الأسد وصل لخروف. يلا ننقذ الأربعة ونجرّب تاني!";
      $("message-en").textContent =
        "The lion reached a sheep. Let’s rescue all four—try again!";
    }
    $("message-tag").textContent = miss
      ? "A NEW TRY. A LITTLE MORE COURAGE."
      : victory
        ? "1 SAMUEL 17:47 · THE BATTLE IS THE LORD’S"
        : "MISSION COMPLETE · WELL DONE, LITTLE EXPLORER";
    if (success && world.mission === "armor")
      $("message-tag").textContent = label("armorTeaching", lang);
    if (success && world.mission === "sheep")
      $("message-tag").textContent =
        lang === "ar"
          ? "يسّى بعت داود بالأكل لإخواته."
          : "Jesse sent David with food for his brothers.";
    if (lang === "ar" && world.mission !== "armor" && world.mission !== "sheep")
      $("message-tag").textContent = miss
        ? "محاولة جديدة… وشجاعة أكبر!"
        : victory
          ? "١ صموئيل ١٧:٤٧ · لِلرَّبِّ الْحَرْبُ!"
          : "تمّت المهمة · شاطر يا بطل!";
    $("continue").textContent =
      label(miss ? "retry" : victory ? "restart" : "next", lang) + " →";
  }
  $("pause").textContent = world.paused
    ? "▶ " + label("resume", lang)
    : "II " + label("pause", lang);
  $("sound").textContent =
    (sound.muted ? "♬ " : "♫ ") +
    (lang === "ar"
      ? sound.muted
        ? "بدون صوت"
        : "الصوت شغّال"
      : sound.muted
        ? "Sound off"
        : "Sound on");
  $("fullscreen").title = label("fullscreen", lang);
  $("restart").title = label("restart", lang);
  $("help").title = label("help", lang);
  $("start").textContent = world.ready
    ? label("start", lang) + " →"
    : bilingual("Opening your adventure…", "بنجهّز المغامرة…");
  $("tutorial").hidden =
    world.phase !== "play" || world.tutorialTime <= 0 || world.paused;
  if (!$("tutorial").hidden)
    $("tutorial").innerHTML =
      `<span class="tutorial-art">${emblem(chapter.icon)}</span><div class="tutorial-copy"><span class="eyebrow">${bilingual("YOUR NEXT BRAVE STEP", "خطوتك الشجاعة الجاية")}</span><b>${legend}</b><p dir="${lang === "ar" ? "rtl" : "ltr"}">${lang === "en" ? instruction[2] : instruction[1]}</p><small>${bilingual("Move or press an arrow to begin", "حرّك داود أو اضغط سهم عشان تبدأ")}</small></div>`;
  if (!$("message").hidden) {
    const icon = world.failed ? "sheep" : chapter.icon;
    if ($("message-emblem").dataset.icon !== icon) {
      $("message-emblem").dataset.icon = icon;
      $("message-emblem").innerHTML = emblem(icon);
    }
  }
}
function modal(
  title: string,
  content: string,
  actions: { label: string; run: () => void }[],
) {
  modalOpen = true;
  world.setPaused(true);
  document.querySelector("#modal .eyebrow")!.textContent = bilingual(
    "TEACHER’S CORNER",
    "ركن المعلم",
  );
  $("modal-content").dir = lang === "ar" ? "rtl" : "ltr";
  $("modal-title").textContent = title;
  $("modal-content").innerHTML = content;
  $("modal-actions").replaceChildren();
  for (const action of actions) {
    const b = document.createElement("button");
    b.textContent = action.label;
    b.onclick = action.run;
    $("modal-actions").append(b);
  }
  $("modal-backdrop").hidden = false;
  $("modal-actions").querySelector("button")?.focus({ preventScroll: true });
}
function close() {
  modalOpen = false;
  $("modal-backdrop").hidden = true;
  world.setPaused(false);
}
function pause() {
  if (world.phase === "title") return;
  if (modalOpen) {
    close();
    return;
  }
  modal(
    bilingual("A moment to pause", "وقفة صغيرة"),
    `<p>${bilingual("Take your time. Your adventure will be right here.", "خد وقتك. المغامرة مستنّياك.")}</p>`,
    [
      { label: "▶ " + label("resume", lang), run: close },
      {
        label: bilingual("Replay mission", "إعادة المهمة"),
        run: () => {
          close();
          world.start(world.mission, world.practice);
        },
      },
    ],
  );
}
$("start").onclick = () => {
  sound.unlock();
  world.start("sheep");
};
$("practice-toggle").onclick = toggleBook;
$("book-toggle").onclick = toggleBook;
$("map-close").onclick = closeBook;
$("music-toggle").onclick = () => {
  sound.unlock();
  sound.setMusic(!sound.music);
  sync();
};
$("narration").onclick = () => {
  sound.unlock();
  narrator.enabled = !narrator.enabled;
  narrator.reset();
  sync();
  if (
    narrator.enabled &&
    (!narrator.available ||
      !speechSynthesis
        .getVoices()
        .some(
          (v) =>
            v.localService && v.lang.startsWith(lang === "ar" ? "ar" : "en"),
        ))
  )
    toast(
      bilingual(
        "No installed local voice for this language. Captions are always available.",
        "مفيش صوت محلي للغة دي. الكلام المكتوب موجود دايمًا.",
      ),
    );
};
document.querySelectorAll<HTMLButtonElement>("[data-mission]").forEach(
  (b) =>
    (b.onclick = () => {
      sound.unlock();
      $("practice").hidden = true;
      world.start(b.dataset.mission as Mission, true);
    }),
);
$("difficulty").onchange = () => {
  const value = $<HTMLSelectElement>("difficulty").value;
  world.easy = value !== "normal";
  world.free = value === "free";
};
$("language").onclick = () => {
  lang = lang === "both" ? "en" : lang === "en" ? "ar" : "both";
  world.lang = lang;
  document.body.className = `lang-${lang}`;
  document.documentElement.lang = lang === "ar" ? "ar" : "en";
  sync();
};
$("sound").onclick = () => {
  sound.unlock();
  sound.setMuted(!sound.muted);
  sync();
};
$("pause").onclick = pause;
$("fullscreen").onclick = async () => {
  try {
    if (document.fullscreenElement && document.exitFullscreen)
      await document.exitFullscreen();
    else if ($("viewport").requestFullscreen)
      await $("viewport").requestFullscreen();
    else
      toast(
        bilingual(
          "For full-screen play, use Share → Add to Home Screen.",
          "للعب بملء الشاشة، اختار مشاركة ثم إضافة للشاشة الرئيسية.",
        ),
      );
  } catch {
    toast(
      bilingual(
        "You can keep playing here, or add the game to your Home Screen.",
        "تقدر تكمّل هنا أو تضيف اللعبة للشاشة الرئيسية.",
      ),
    );
  }
};
$("restart").onclick = () =>
  modal(
    bilingual("Begin a new adventure?", "نبدأ من الأول؟"),
    `<p>${bilingual("This will return to the beginning.", "هنرجع للبداية.")}</p>`,
    [
      { label: label("resume", lang), run: close },
      {
        label: label("restart", lang),
        run: () => {
          close();
          world.clearInput();
          world.phase = "title";
          sync();
        },
      },
    ],
  );
$("offline-retry").onclick = () => void pwa.start();
$("pwa-update").onclick = () =>
  modal(
    bilingual("A fresh adventure is ready", "تحديث المغامرة جاهز"),
    `<p>${bilingual("Reload to use the saved update. Keepsakes stay in your book; the current mission will restart.", "حدّث اللعبة. التذكارات هتفضل محفوظة والمهمة الحالية هتبدأ تاني.")}</p>`,
    [
      { label: label("resume", lang), run: close },
      {
        label: bilingual("Update now", "حدّث دلوقتي"),
        run: () => pwa.applyUpdate(),
      },
    ],
  );
$("install").onclick = async () => {
  sound.unlock();
  if (await pwa.install()) return;
  modal(
    bilingual(
      "Keep the adventure on your Home Screen",
      "ضيف المغامرة للشاشة الرئيسية",
    ),
    `<p>${bilingual("On iPhone or iPad: open this hosted game in Safari, tap Share, then Add to Home Screen. On Android: open it in Chrome and choose Install app or Add to Home screen.", "على آيفون أو آيباد: افتح اللعبة في سفاري واختار مشاركة ثم إضافة للشاشة الرئيسية. على أندرويد: افتحها في كروم واختار تثبيت التطبيق أو إضافة للشاشة الرئيسية.")}</p><p>${bilingual("For offline play, keep the game open online until the adventure book says Offline ready. Installation needs an HTTPS game link; a downloaded HTML file cannot install as an app.", "للعب بدون إنترنت، استنى لحد ما كتاب المغامرة يقول إنها جاهزة بدون إنترنت. التثبيت محتاج رابط HTTPS للعبة.")}</p>`,
    [{ label: label("resume", lang), run: close }],
  );
};
$("help").onclick = () =>
  modal(
    bilingual("Every little explorer can help", "كل مستكشف صغير يقدر يساعد"),
    teacherHelp.map(([ar, en]) => `<p>${bilingual(en, ar)}</p>`).join(""),
    [
      { label: label("resume", lang), run: close },
      {
        label: bilingual("Playtest guide", "دليل تجربة الأطفال"),
        run: () =>
          modal(
            bilingual("Watch, listen, then help", "شوف واسمع وبعدين ساعد"),
            `<p>${bilingual("Let a child try independently. Can they explain the card, pick up one sheep, find the pen and understand the 40-second timer?", "خلّي الطفل يجرّب بنفسه. هل فهم التعليمات وشال خروف ولقى الحظيرة وفهم عداد الأربعين ثانية؟")}</p><p>${bilingual("Note the first hesitation, hints needed, sheep rescued, and response to a retry. Try ages 5–8 with keyboard and tablet. Switch to Free Play if needed.", "سجّل أول حاجة حيّرته والمساعدة اللي احتاجها وعدد الخراف ورد فعله على المحاولة الجديدة. جرّب بالكيبورد والتابلت واختار اللعب الحر لو محتاج.")}</p><p>${bilingual("This is an observation guide. Child playtesting has not yet been conducted. A printable worksheet is included with the source.", "ده دليل للملاحظة. تجربة الأطفال لسه ما اتعملتش. ورقة ملاحظات للطباعة موجودة مع المصدر.")}</p>`,
            [{ label: label("resume", lang), run: close }],
          ),
      },
    ],
  );
$("continue").onclick = () => {
  // Return keyboard control to the game after a retry or story transition.
  const stage = $("stage");
  stage.tabIndex = -1;
  stage.focus({ preventScroll: true });
  sound.unlock();
  if (world.phase === "victory") {
    world.phase = "title";
    sync();
    return;
  }
  if (
    world.failed ||
    (world.mission === "sling" && world.sling.state === "miss")
  ) {
    world.start(world.mission, world.practice);
    return;
  }
  world.continue();
};
$("hint").onclick = () => world.hint();
function directionVector() {
  let x = 0,
    y = 0;
  for (const d of heldDirections.values()) {
    x += d.x;
    y += d.y;
  }
  const length = Math.hypot(x, y);
  return length ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-dir]")) {
  const [x, y] = b.dataset.dir!.split(",").map(Number);
  bindPress(
    b,
    () => {
      sound.unlock();
      if (!world.paused) {
        heldDirections.set(b, { x, y });
        world.pressDirection(directionVector());
      }
    },
    () => {
      heldDirections.delete(b);
      world.stepDir = directionVector();
    },
  );
}
bindPress(
  $("action"),
  () => {
    sound.unlock();
    world.action(true);
  },
  () => world.action(false),
  () => world.clearInput(),
);
window.addEventListener("keydown", (e) => {
  if (e.code === "Tab" && !$("practice").hidden) {
    const nodes = [
      ...$("practice").querySelectorAll<HTMLButtonElement>("button"),
    ].filter((b) => !b.disabled && b.getClientRects().length > 0);
    const first = nodes[0],
      last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  }
  if (e.code === "Escape") {
    if (!$("practice").hidden) closeBook();
    else pause();
  }
  if (e.code === "Space" && e.target instanceof HTMLButtonElement)
    e.preventDefault();
});
function loseFocus() {
  heldDirections.clear();
  if (world.phase !== "title" && !world.paused) pause();
  else world.clearInput();
}
window.addEventListener("blur", loseFocus);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) loseFocus();
});
window.setInterval(sync, 100);
if (import.meta.env.PROD) void pwa.start();
// Read-only QA state. Available only when explicitly requested; never advances or mutates gameplay.
if (new URL(location.href).searchParams.has("qa"))
  Object.defineProperty(window, "adventureQA", {
    value: {
      snapshot: () => ({
        pwaState: pwa.state,
        visualAssetsLoaded: visualLibrary.loadedCount,
        visualAssetIssues: [...visualLibrary.issues],
        foodDelivery:
          world.mission === "maze" && world.phase === "success"
            ? deliveryAt(world.successTime)
            : null,
        keepsakes: [...journal.completed],
        narration: narrator.enabled,
        music: sound.music,
        phase: world.phase,
        mission: world.mission,
        paused: world.paused,
        seed: world.maze.maze.seed,
        cell: world.maze.cell,
        mazePath: path(world.maze.maze, world.maze.cell),
        equipped: [...world.armor.equipped],
        fallTime: world.armor.fallTime,
        sheep: world.sheep.sheep,
        carriedIndex: world.sheep.carriedIndex,
        liftProgress: world.sheep.liftProgress,
        sheepRemaining: world.sheep.remaining,
        sheepTimeLimit: world.sheep.timeLimit,
        lion: world.sheep.lion,
        hunting: world.sheep.hunting,
        caughtIndex: world.sheep.caughtIndex,
        david: world.sheep.david,
        stones: world.brook.stones,
        stoneCount: world.brook.count,
        shot: world.sling.state,
        charge: world.sling.charge,
        stone: world.sling.stone,
        successTime: world.successTime,
        encounterX: world.encounterX,
        heard: world.heard,
        language: lang,
        muted: sound.muted,
        audioState: sound.context?.state,
        failed: world.failed,
        ring: { x: world.brook.ring, y: 335 + world.brook.row * 145 },
        gear: GEAR,
      }),
    },
  });
