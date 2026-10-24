import { lionLines } from "./lion-encounter-view";
import { TITLE_DAVID, titleFlockAt } from "./title-flock";
import {
  ACTIVITY_SECONDS,
  SHEEP_SECONDS,
  countdownHue,
} from "./activity-timer";
import { heroRigInfo } from "./hero";
import Phaser from "phaser";
import { visualLibrary } from "./visual-assets";
import { giantForehead } from "./art";
import { deliveryAt } from "./food";
import { AdventurePwa } from "./pwa";
import { bindPress } from "./touch";
import { bindJoystick } from "./joystick";
import { fittedScale, compactLayout, ensureCanvasSupport } from "./mobile";
ensureCanvasSupport();
import "./style.css";
import "./ui-theme.css";
import "./interlude.css";
import "./joystick.css";
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
import { bindButtonSounds } from "./ui-audio";
import { Journal, CHAPTERS, emblem } from "./journal";
import { Narrator } from "./narration";
import { encounterStory } from "./encounter-story";
import { interludeSpeech } from "./interlude";
import mapUrl from "./assets/journey-map.png";
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const sound = new Sound();
bindButtonSounds(document, sound);
const narrator = new Narrator({
  play: (url) => {
    void sound.voice(url);
  },
  stop: () => sound.stopVoice(),
  activity: (speaking) => sound.setGuidance(speaking),
});
narrator.enabled = true;
// Safari/Chrome can populate installed voices after the first user gesture.
if (narrator.available)
  speechSynthesis.addEventListener("voiceschanged", () => sync());
const pwa = new AdventurePwa(() => {
  if (world.ready) sync();
});
let localStore: Storage | null = null;
try {
  localStore = window.localStorage;
} catch {}
const journal = new Journal(localStore);
let resetJoystick = () => {};
let joystickContext = "";
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
    "cover-large",
    availableWidth >= 1000 && availableHeight >= 540,
  );
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
    "STEER  +  TAP",
    "حرّك الدائرة • قرّب والمس الخروف لشيله • ارجع للحظيرة",
    "Drag the circle to walk • Tap a nearby sheep to lift • Carry it into the pen",
  ],
  maze: [
    "↑ ↓ ← →",
    "اسحب الدائرة واستكشف الممرات لحد إخوات داود.",
    "Drag the circle to explore • Arrow keys / WASD also work",
  ],
  armor: [
    "DRAG → DROP",
    "حرّك اليد بالدائرة واختار القطعة ثم حطها على داود، أو اسحبها بإصبعك.",
    "Drag pieces • Or steer the hand and tap Pick / Place",
  ],
  brook: [
    "SPACE  /  TAP",
    "حرّك اليد لحجر أملس واضغط اغرف لما الدائرة تعدّي عليه، أو المس الحجر.",
    "Steer the hand to a smooth stone • Scoop as the ring passes • Or tap the stone",
  ],
  sling: [
    "HOLD  →  RELEASE",
    "اسحب الدائرة واستنى… وبعدين سيب عشان ترمي!",
    "Pull and hold the circle • Release to throw • SPACE also works",
  ],
};
function bilingual(en: string, ar: string) {
  return lang === "ar" ? ar : lang === "en" ? en : `${ar} · ${en}`;
}
/** Presentational bilingual text with independent shaping and reading direction. */
function readingPair(en: string, ar: string) {
  const arabic = `<span class="ui-copy-ar" lang="ar" dir="rtl">${ar}</span>`;
  const english = `<span class="ui-copy-en" lang="en" dir="ltr">${en}</span>`;
  return lang === "ar" ? arabic : lang === "en" ? english : arabic + english;
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
        : pwa.state === "available"
          ? bilingual(
              "Optional: save this adventure for offline play.",
              "اختياري: احفظ المغامرة للعب بدون إنترنت.",
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
  $("offline-retry").hidden =
    pwa.state !== "failed" && pwa.state !== "available";
  $("pwa-update").hidden = !pwa.updateAvailable;
  $("offline-retry").textContent =
    pwa.state === "available"
      ? bilingual("Save for offline play", "احفظ للعب بدون إنترنت")
      : bilingual("Save again", "احفظ تاني");
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
        ? readingPair(shortNames[i][0], shortNames[i][1])
        : readingPair(ch.name[0], ch.name[1]);
      button.innerHTML = `<span class="chapter-art">${emblem(ch.icon)}</span><span class="chapter-label"><b>${i + 1}</b><span class="chapter-copy">${chapterName}</span></span><span class="chapter-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="${journal.completed.has(ch.mission) ? "m5 12 4 4 10-10" : "m7 17 10-10M7 7h10v10"}"/></svg></span>`;
    }
    $("keepsakes").innerHTML = CHAPTERS.map(
      (ch) =>
        `<div class="keepsake ${journal.completed.has(ch.mission) ? "collected" : ""}" aria-label="${bilingual(ch.gift[0], ch.gift[1])}: ${journal.completed.has(ch.mission) ? "earned" : "not yet earned"}">${emblem(ch.giftIcon)}<span>${readingPair(ch.gift[0], ch.gift[1])}</span>${journal.completed.has(ch.mission) ? "<b>✓</b>" : "<b>·</b>"}</div>`,
    ).join("");
  }
  if (world.paused || title) resetJoystick();
  if (world.paused || title) narrator.reset();
  else if (world.phase === "interlude" && world.interlude) {
    const story = world.interlude;
    if (story.voiceReady)
      narrator.speak(
        `${world.run}:story:${story.id}:${lang}`,
        interludeSpeech[story.id].en,
        interludeSpeech[story.id].ar,
        lang,
        sound.muted,
        story.id,
      );
    else narrator.reset();
  } else
    narrator.speak(
      `${world.run}:${world.phase}:${world.heard}:${world.mission}:${lang}:${world.failed}`,
      world.failed
        ? "Let’s try again. You can do it."
        : success
          ? copy[`${world.mission}Success` as CopyKey][1]
          : encounter
            ? encounterStory[world.heard ? "challenge" : "approach"].en
            : world.mission === "armor"
              ? encounterStory.saul.en
              : copy[world.mission][1],
      world.failed
        ? "يلا نجرّب تاني. إنت تقدر."
        : success
          ? copy[`${world.mission}Success` as CopyKey][0]
          : encounter
            ? encounterStory[world.heard ? "challenge" : "approach"].ar
            : world.mission === "armor"
              ? encounterStory.saul.ar
              : copy[world.mission][0],
      lang,
      sound.muted,
      !world.failed && !success
        ? encounter
          ? world.heard
            ? "challenge"
            : "approach"
          : world.mission === "armor"
            ? "saul"
            : undefined
        : undefined,
    );
  $<HTMLButtonElement>("start").disabled = !world.ready;
  $<HTMLButtonElement>("practice-toggle").disabled = !world.ready;
  $("title").hidden = !title;
  $("title-note").hidden = !title;
  $("mission").hidden = title || victory || world.phase === "interlude";
  $("bottom").hidden = title || victory || world.phase === "interlude";
  $("story-interlude").hidden = world.phase !== "interlude";
  if (world.phase === "interlude" && world.interlude) {
    const story = world.interlude;
    $("story-label").textContent =
      bilingual(
        story.id === "jesse" ? "A FATHER’S REQUEST" : "THE GIANT’S CHALLENGE",
        story.id === "jesse" ? "طلب الأب" : "تحدّي العملاق",
      ) +
      " · " +
      story.reference.replace(/ /g, "\u00a0");
    $("story-en").textContent = story.caption[0];
    $("story-ar").textContent = story.caption[1];
    $("story-en").hidden = lang === "ar";
    $("story-ar").hidden = lang === "en";
    $("story-progress").textContent = [0, 1, 2, 3]
      .map((i) => (i <= story.beat ? "●" : "○"))
      .join("  ");
    $("story-replay").textContent = bilingual("↻ Replay", "↻ إعادة");
    $("story-next").textContent = !story.ready
      ? bilingual("Watch the story…", "شاهد الحكاية…")
      : story.id === "jesse"
        ? bilingual("Deliver the food →", "وصّل الطعام ←")
        : bilingual("Return to Saul →", "ارجع لشاول ←");
    $<HTMLButtonElement>("story-next").disabled = !story.ready || world.paused;
    $<HTMLButtonElement>("story-replay").disabled = world.paused;
  }
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
      ? `${world.sheep.count} / ${world.lionEncounter.started ? 5 : 4} 🐑`
      : world.mission === "armor"
        ? `${world.armor.equipped.size} / 4`
        : world.mission === "brook"
          ? `${world.brook.count} / 5`
          : `${lang === "ar" ? "المهمة" : "MISSION"} ${ORDER.indexOf(world.mission) + 1} / 5`;
  const clock = $("sheep-clock");
  const lionActive = world.mission === "sheep" && world.lionEncounter.active;
  clock.hidden = !["play", "encounter"].includes(world.phase) || lionActive;
  const limit =
    world.mission === "sheep" && world.phase !== "encounter"
      ? SHEEP_SECONDS
      : ACTIVITY_SECONDS;
  const orangeAt = (limit * 2) / 3;
  const redAt = limit / 3;
  const remaining = world.activityRemaining;
  const seconds = remaining === null ? null : Math.ceil(remaining);
  const stamp =
    seconds === null ? "∞" : `0:${String(seconds).padStart(2, "0")}`;
  $("sheep-time").textContent = stamp;
  clock.classList.toggle(
    "warning",
    remaining !== null && remaining <= orangeAt,
  );
  clock.classList.toggle("urgent", remaining !== null && remaining < redAt);
  $("sheep-warning").textContent =
    remaining === null
      ? bilingual("Free play", "لعب حر")
      : world.failed
        ? bilingual("Try again", "جرّب تاني")
        : remaining === 0 &&
            world.mission === "sheep" &&
            world.phase !== "encounter"
          ? bilingual("Lion is chasing! Run!", "الأسد بيجري! اجري!")
          : remaining <= orangeAt
            ? bilingual("Keep going!", "كمّل يا بطل!")
            : bilingual("Time remaining", "الوقت المتبقي");
  if (mobile)
    $("sheep-warning").textContent =
      remaining === null
        ? bilingual("Free", "حر")
        : world.failed
          ? bilingual("Retry", "تاني")
          : bilingual("Time", "الوقت");
  const track = $("countdown-track");
  track.hidden = remaining === null;
  track.setAttribute(
    "aria-label",
    bilingual("Activity time remaining", "الوقت المتبقي للمهمة"),
  );
  track.setAttribute("aria-valuemax", String(limit));
  track.setAttribute("aria-valuenow", String(seconds ?? limit));
  track.setAttribute(
    "aria-valuetext",
    remaining === null ? "Untimed" : `${seconds} seconds remaining`,
  );
  clock.style.setProperty(
    "--time-color",
    `hsl(${countdownHue(remaining ?? limit, limit).toFixed(1)} 70% 40%)`,
  );
  $("countdown-fill").style.transform =
    `scaleX(${Math.max(0, (remaining ?? limit) / limit)})`;
  clock.setAttribute("aria-label", `Activity time remaining: ${stamp}`);
  const controlLocked =
    world.paused ||
    world.failed ||
    !["play", "encounter"].includes(world.phase) ||
    (!encounter &&
      (lionActive ||
        (world.mission === "armor" && world.armor.fallTime >= 0) ||
        (world.mission === "sling" && world.sling.state !== "ready")));
  const controlContext = `${world.phase}:${world.mission}:${controlLocked}:${lionActive}`;
  if (controlContext !== joystickContext) {
    joystickContext = controlContext;
    resetJoystick();
  }
  $("joystick").hidden = lionActive;
  $("joystick-label").hidden = lionActive;
  $("joystick").setAttribute("aria-disabled", String(controlLocked));
  $("joystick-label").textContent = bilingual(
    world.mission === "sling" && !encounter
      ? "Hold · release"
      : ["armor", "brook"].includes(world.mission) && !encounter
        ? "Hand"
        : "Move",
    world.mission === "sling" && !encounter
      ? "امسك · سيب"
      : ["armor", "brook"].includes(world.mission) && !encounter
        ? "اليد"
        : "حرّك",
  );
  $("action").hidden =
    !encounter && !["sheep", "armor", "brook", "sling"].includes(world.mission);
  $<HTMLButtonElement>("action").disabled =
    world.paused ||
    world.failed ||
    (encounter && (!world.heard || world.encounterX >= 290)) ||
    (!encounter &&
      world.mission === "armor" &&
      (!world.controlCursor || world.armor.fallTime >= 0)) ||
    (!encounter && world.mission === "sling" && world.sling.state !== "ready");
  $("input-controls").hidden = success || world.failed;
  $("input-controls").dataset.activity = encounter ? "walk" : world.mission;
  const instruction = instructions[world.mission];
  const legend =
    lang === "ar"
      ? {
          sheep: "حرّك الدائرة والمس الخروف",
          maze: "اسحب الدائرة",
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
      ? bilingual(
          "← Return to Saul. Press Speak / SPACE to offer your help.",
          "ارجع لشاول واضغط تكلم لتعرض المساعدة ←",
        )
      : bilingual("Walk closer to hear Goliath →", "امش يمينًا لتسمع جليات");
  const action: CopyKey =
    world.mission === "sheep"
      ? "call"
      : world.mission === "brook"
        ? "scoop"
        : "charge";
  $("action").textContent = encounter
    ? bilingual("Speak to Saul", "تكلم مع شاول")
    : world.mission === "sheep" && world.sheep.carried
      ? bilingual("To the pen", "للحظيرة")
      : label(action, lang);
  if (!encounter && world.mission === "armor")
    $("action").textContent = world.selected
      ? bilingual("Place piece", "حط القطعة")
      : bilingual("Pick piece", "اختار قطعة");
  if (lionActive) {
    const [en, ar] = lionLines[world.lionEncounter.stage];
    $("objective-ar").textContent = "احمِ الخروف · ١ صموئيل ١٧:٣٤–٣٧";
    $("objective-en").textContent = "Rescue the lamb · 1 Samuel 17:34–37";
    $("instruction").textContent = bilingual(en, ar);
    $("action").textContent =
      world.lionEncounter.stage === "retry"
        ? bilingual("Try again", "جرّب تاني")
        : world.lionEncounter.stage === "rescue"
          ? bilingual("Rescue!", "أنقذ!")
          : world.lionEncounter.stage === "defend"
            ? bilingual("Defend!", "احمِ!")
            : bilingual("Watch", "شاهد");
    $<HTMLButtonElement>("action").disabled =
      !world.lionEncounter.timing && world.lionEncounter.stage !== "retry";
  }
  $("hint").textContent = "✧ " + label("hint", lang);
  $("hint").hidden = success || encounter || lionActive;
  const miss =
    world.failed || (world.mission === "sling" && world.sling.state === "miss");
  if (!$("message").hidden) {
    let k: CopyKey = miss
      ? "miss"
      : victory
        ? "victory"
        : (`${world.mission}Success` as CopyKey);
    textPair("message-ar", "message-en", k);
    if (world.failed && world.timedOut) {
      $("message-ar").textContent = "خلص الوقت! يلا نجرّب المهمة تاني.";
      $("message-en").textContent = "Time’s up! Let’s try this activity again.";
    } else if (world.failed) {
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
    ? "▷ " + label("resume", lang)
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
      `<span class="tutorial-art">${emblem(chapter.icon)}</span><div class="tutorial-copy"><span class="eyebrow">${bilingual("YOUR NEXT BRAVE STEP", "خطوتك الشجاعة الجاية")}</span><b>${legend}</b><p dir="${lang === "en" ? "ltr" : "rtl"}">${lang === "en" ? instruction[2] : instruction[1]}</p><small>${readingPair("Drag the circle to begin", "اسحب الدائرة عشان تبدأ")}</small></div>`;
  if (!$("message").hidden) {
    const icon = world.failed && !world.timedOut ? "sheep" : chapter.icon;
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
  kind: "teacher" | "pause" = "teacher",
) {
  modalOpen = true;
  $("modal").dataset.kind = kind;
  world.setPaused(true);
  document.querySelector("#modal .eyebrow")!.textContent =
    kind === "pause"
      ? bilingual("A LITTLE BREATHER", "استراحة صغيرة")
      : bilingual("TEACHER’S CORNER", "ركن المعلم");
  $("modal-content").dir = lang === "ar" ? "rtl" : "ltr";
  $("modal-title").textContent = title;
  $("modal-content").innerHTML = content;
  $("modal-actions").replaceChildren();
  for (const action of actions) {
    const b = document.createElement("button");
    b.className = "ui-button";
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
  if (world.mission === "sheep" && world.phase === "play") {
    $("stage").tabIndex = -1;
    $("stage").focus({ preventScroll: true });
  }
}
function pause() {
  if (world.phase === "title") return;
  if (modalOpen) {
    close();
    return;
  }
  modal(
    bilingual("A moment to pause", "وقفة صغيرة"),
    `<p>${readingPair("Take your time. Your adventure will be right here.", "خد وقتك. المغامرة مستنّياك.")}</p>`,
    [
      { label: "▷ " + label("resume", lang), run: close },
      {
        label: bilingual("Replay mission", "إعادة المهمة"),
        run: () => {
          close();
          world.start(world.mission, world.practice);
        },
      },
    ],
    "pause",
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
        "No installed voice. The Goliath story uses bundled speech; other activities have captions.",
        "لا يوجد صوت محلي. قصة جليات لها صوت مرفق، وباقي الأنشطة لها نص مكتوب.",
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
    `<p>${readingPair("This will return to the beginning.", "هنرجع للبداية.")}</p>`,
    [
      { label: label("resume", lang), run: close },
      {
        label: label("restart", lang),
        run: () => {
          close();
          world.clearInput();
          world.phase = "title";
          sound.stopSamples();
          sync();
        },
      },
    ],
  );
$("offline-retry").onclick = () => void pwa.start();
$("pwa-update").onclick = () =>
  modal(
    bilingual("A fresh adventure is ready", "تحديث المغامرة جاهز"),
    `<p>${readingPair("Reload to use the saved update. Keepsakes stay in your book; the current mission will restart.", "حدّث اللعبة. التذكارات هتفضل محفوظة والمهمة الحالية هتبدأ تاني.")}</p>`,
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
    `<p>${readingPair("On iPhone or iPad: open this hosted game in Safari, tap Share, then Add to Home Screen. On Android: open it in Chrome and choose Install app or Add to Home screen.", "على آيفون أو آيباد: افتح اللعبة في سفاري واختار مشاركة ثم إضافة للشاشة الرئيسية. على أندرويد: افتحها في كروم واختار تثبيت التطبيق أو إضافة للشاشة الرئيسية.")}</p><p>${readingPair("Offline play is optional and uses device storage. In the Adventure Book, choose Save for offline play, then stay online until it says Offline ready. Installation needs an HTTPS game link; a downloaded HTML file cannot install as an app.", "اللعب بدون إنترنت اختياري وبيستخدم مساحة على الجهاز. في كتاب المغامرة اختار احفظ للعب بدون إنترنت واستنى لحد ما يقول جاهزة بدون إنترنت. التثبيت محتاج رابط HTTPS للعبة.")}</p>`,
    [{ label: label("resume", lang), run: close }],
  );
};
$("help").onclick = () =>
  modal(
    bilingual("Every little explorer can help", "كل مستكشف صغير يقدر يساعد"),
    teacherHelp.map(([ar, en]) => `<p>${readingPair(en, ar)}</p>`).join(""),
    [
      { label: label("resume", lang), run: close },
      {
        label: bilingual("Playtest guide", "دليل تجربة الأطفال"),
        run: () =>
          modal(
            bilingual("Watch, listen, then help", "شوف واسمع وبعدين ساعد"),
            `<p>${readingPair("Let a child try independently. Can they explain the card, pick up one sheep, find the pen and understand the 36-second timer?", "خلّي الطفل يجرّب بنفسه. هل فهم التعليمات وشال خروف ولقى الحظيرة وفهم عداد الستة وثلاثين ثانية؟")}</p><p>${readingPair("Note the first hesitation, hints needed, sheep rescued, and response to a retry. Try ages 5–8 with keyboard and tablet. Switch to Free Play if needed.", "سجّل أول حاجة حيّرته والمساعدة اللي احتاجها وعدد الخراف ورد فعله على المحاولة الجديدة. جرّب بالكيبورد والتابلت واختار اللعب الحر لو محتاج.")}</p><p>${readingPair("This is an observation guide. Child playtesting has not yet been conducted. A printable worksheet is included with the source.", "ده دليل للملاحظة. تجربة الأطفال لسه ما اتعملتش. ورقة ملاحظات للطباعة موجودة مع المصدر.")}</p>`,
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
    world.retry();
    return;
  }
  world.continue();
};
$("story-next").onclick = () => {
  sound.unlock();
  world.continue();
  $("stage").tabIndex = -1;
  $("stage").focus({ preventScroll: true });
};
$("story-replay").onclick = () => {
  narrator.reset();
  world.retry();
};
$("hint").onclick = () => world.hint();
resetJoystick = bindJoystick(
  $("joystick"),
  (dir) => {
    if (dir.x || dir.y) sound.unlock();
    world.steer(dir);
  },
  (cancelled) => world.releaseSteering(cancelled),
);
bindPress(
  $("action"),
  () => {
    sound.unlock();
    world.cursorAction(true);
  },
  () => world.cursorAction(false),
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
  resetJoystick();
  if (world.phase !== "title" && !world.paused) pause();
  else world.clearInput();
}
window.addEventListener("blur", loseFocus);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) loseFocus();
});
window.setInterval(sync, 100);
if (import.meta.env.MODE === "pages") void pwa.restore();
else if (import.meta.env.PROD) void pwa.start();
// Read-only QA state. Available only when explicitly requested; never advances or mutates gameplay.
if (new URL(location.href).searchParams.has("qa"))
  Object.defineProperty(window, "adventureQA", {
    value: {
      snapshot: () => ({
        pwaState: pwa.state,
        visualAssetsLoaded: visualLibrary.loadedCount,
        heroRig: { ...heroRigInfo },
        renderedGoliathForehead: giantForehead,
        renderedProjectile: world.renderedProjectile,
        visualAssetsUsed: [...visualLibrary.used],
        visualAssetIssues: [...visualLibrary.issues],
        foodDelivery:
          world.mission === "maze" && world.phase === "success"
            ? deliveryAt(world.successTime)
            : null,
        keepsakes: [...journal.completed],
        narration: narrator.enabled,
        music: sound.music,
        musicState: sound.musicState,
        phase: world.phase,
        interlude: world.interlude
          ? {
              id: world.interlude.id,
              time: world.interlude.time,
              ready: world.interlude.ready,
              beat: world.interlude.beat,
              caption: world.interlude.caption,
              voiceReady: world.interlude.voiceReady,
            }
          : null,
        titleScene:
          world.phase === "title"
            ? {
                david: TITLE_DAVID,
                sheep: titleFlockAt(world.clock),
              }
            : null,
        mission: world.mission,
        paused: world.paused,
        seed: world.maze.maze.seed,
        cell: world.maze.cell,
        mazePath: path(world.maze.maze, world.maze.cell),
        equipped: [...world.armor.equipped],
        fallTime: world.armor.fallTime,
        sheep: world.sheep.sheep,
        lionEncounter: world.lionEncounter.snapshot(),
        carriedIndex: world.sheep.carriedIndex,
        liftProgress: world.sheep.liftProgress,
        sheepRemaining: world.sheep.remaining,
        activityRemaining: world.activityRemaining,
        activityLimit: world.activityTimer.limit,
        facing: world.facing,
        timedOut: world.timedOut,
        mazeEdges: world.maze.maze.edges,
        sheepTimeLimit: world.sheep.timeLimit,
        lion: world.sheep.lion,
        hunting: world.sheep.hunting,
        caughtIndex: world.sheep.caughtIndex,
        david: world.sheep.david,
        stones: world.brook.stones,
        stoneCount: world.brook.count,
        shot: world.sling.state,
        charge: world.sling.charge,
        controlCursor: world.controlCursor,
        selectedGear: world.selected,
        stickDirection: world.stickDir,
        stone: world.sling.stone,
        successTime: world.successTime,
        encounterX: world.encounterX,
        heard: world.heard,
        language: lang,
        muted: sound.muted,
        audioState: sound.context?.state,
        audioEvents: { ...sound.events },
        sampleDurations: sound.sampleDurations,
        failed: world.failed,
        ring: { x: world.brook.ring, y: world.brook.ringY },
        gear: GEAR,
      }),
    },
  });
