import Phaser from "phaser";
import "./style.css";
import { World } from "./world";
import { ORDER, path, GEAR, type Mission } from "./model";
import {
  teacherHelp,
  copy,
  type CopyKey,
  type Language,
  label,
} from "./strings";
import { Sound } from "./audio";
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const sound = new Sound();
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
  banner: false,
  fps: { target: 60 },
});
function resize() {
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  $("stage").style.transform = `scale(${scale})`;
  if (game.canvas) game.scale.refresh();
}
window.addEventListener("resize", resize);
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
  const missionNames = [
    bilingual("Sheep", "الخراف"),
    bilingual("Maze", "المتاهة"),
    bilingual("Armour", "الدرع"),
    bilingual("Brook", "الجدول"),
    bilingual("Goliath", "جليات"),
  ];
  document
    .querySelectorAll<HTMLButtonElement>("[data-mission]")
    .forEach((b, i) => (b.textContent = `${i + 1} · ${missionNames[i]}`));
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
      ? bilingual("To pen →", "للحظيرة ←")
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
      `<b>${legend}</b>${lang === "en" ? instruction[2] : instruction[1]}`;
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
  $("modal-actions").querySelector("button")?.focus();
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
$("practice-toggle").onclick = () => {
  $("practice").hidden = !$("practice").hidden;
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
$("fullscreen").onclick = () => {
  if (document.fullscreenElement) void document.exitFullscreen();
  else
    void $("viewport")
      .requestFullscreen()
      .catch(() =>
        toast(bilingual("Use F11 for full screen.", "اضغط F11 لملء الشاشة")),
      );
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
$("help").onclick = () =>
  modal(
    bilingual("Every little explorer can help", "كل مستكشف صغير يقدر يساعد"),
    teacherHelp.map(([ar, en]) => `<p>${bilingual(en, ar)}</p>`).join(""),
    [{ label: label("resume", lang), run: close }],
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
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-dir]")) {
  b.onpointerdown = (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    const [x, y] = b.dataset.dir!.split(",").map(Number);
    if (!world.paused) {
      world.pressDirection({ x, y });
    }
  };
  b.onpointerup = () => (world.stepDir = { x: 0, y: 0 });
  b.onpointercancel = () => (world.stepDir = { x: 0, y: 0 });
}
$("action").onpointerdown = (e) => {
  e.preventDefault();
  $("action").setPointerCapture(e.pointerId);
  world.action(true);
};
$("action").onpointerup = () => world.action(false);
$("action").onpointercancel = () => world.clearInput();
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape") pause();
  if (e.code === "Space" && e.target instanceof HTMLButtonElement)
    e.preventDefault();
});
function loseFocus() {
  if (world.phase !== "title" && !world.paused) pause();
  else world.clearInput();
}
window.addEventListener("blur", loseFocus);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) loseFocus();
});
window.setInterval(sync, 100);
// Read-only QA state. Available only when explicitly requested; never advances or mutates gameplay.
if (new URL(location.href).searchParams.has("qa"))
  Object.defineProperty(window, "adventureQA", {
    value: {
      snapshot: () => ({
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
