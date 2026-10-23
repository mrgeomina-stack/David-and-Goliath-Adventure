export type Language = "both" | "en" | "ar";
export const copy = {
  title: ["مغامرة داود الكبرى", "David’s Big Adventure"],
  opening: [
    "يلا نساعد داود في مغامرته!",
    "A little shepherd. A very big adventure.",
  ],
  sheep: [
    "شيل الأربعة وارجع للحظيرة قبل الأسد!",
    "Carry four sheep into the pen before the lion!",
  ],
  maze: ["وصّل الأكل لإخوات داود!", "Find your way to David’s brothers."],
  armor: ["اسحب كل قطعة لمكانها على داود.", "Drag each piece onto David."],
  brook: ["اختار خمس حجارة ملساء!", "Collect five smooth stones."],
  sling: [
    "امسك الدائرة… وسيب عشان ترمي!",
    "Hold the circle… release to throw!",
  ],
  sheepSuccess: ["داود حمى خرافه!", "David protected his sheep!"],
  mazeSuccess: ["وصلت الأكل! شاطر!", "A special delivery, made with love!"],
  armorSuccess: ["الدرع ده مش مناسب ليا!", "This armor isn’t right for me!"],
  armorTeaching: [
    "داود ماكانش متعود على درع شاول.",
    "David wasn’t used to Saul’s armor.",
  ],
  brookSuccess: [
    "خمس حجارة… وقلب شجاع!",
    "Five smooth stones. One brave heart.",
  ],
  slingSuccess: ["لِلرَّبِّ الْحَرْبُ!", "The battle is the Lord’s!"],
  miss: ["ما أصابتش! جرّب تاني.", "Missed! Let’s try again."],
  victory: [
    "لما نخاف، نثق في ربنا!",
    "God gives us courage when we trust Him.",
  ],
  encounter: [
    "اسمع جليات، ثم اعرض مساعدتك على شاول.",
    "Hear Goliath. Offer Saul your help.",
  ],
  encounterInstruction: [
    "قرّب داود عشان يسمع، وبعدين روح لشاول.",
    "Walk closer to listen, then go to Saul.",
  ],
  start: ["نبدأ المغامرة", "Let’s begin"],
  next: ["كمّل المغامرة", "Continue adventure"],
  retry: ["جرّب تاني", "Try again"],
  hint: ["مساعدة", "Hint"],
  pause: ["وقفة", "Pause"],
  resume: ["نكمّل", "Resume"],
  sound: ["الصوت", "Sound"],
  fullscreen: ["ملء الشاشة", "Full screen"],
  restart: ["من الأول", "Restart"],
  help: ["مساعدة المعلم", "Teacher help"],
  call: ["شيل الخروف", "Lift sheep"],
  scoop: ["التقط", "Scoop"],
  charge: ["دوس… وسيب", "Hold / release"],
  tunic: ["قميص شاول", "Saul’s tunic"],
  mail: ["درع", "Coat of mail"],
  helmet: ["خوذة", "Bronze helmet"],
  sword: ["سيف وحزام", "Sword & belt"],
};
export type CopyKey = keyof typeof copy;
export function label(key: CopyKey, lang: Language) {
  return lang === "ar"
    ? copy[key][0]
    : lang === "en"
      ? copy[key][1]
      : `${copy[key][0]} · ${copy[key][1]}`;
}

export const teacherHelp: [string, string][] = [
  [
    "١ · الخراف: حرّك داود بالدائرة أو الأسهم. المس خروف قريب أو اضغط SPACE لشيله. أنقذ الأربعة من فتحة الحظيرة قبل انتهاء الوقت، وبعدين أنقذ خروف خامس من الأسد.",
    "1 · Sheep: Move with the circle or arrows / WASD. Tap a nearby sheep or press SPACE to lift it. Run through the right pen opening to set it down. Save all four before the 30-second countdown ends, then rescue a fifth lamb from the lion. Free Play has no deadline.",
  ],
  [
    "٢ · المتاهة: الدائرة أو الأسهم. المساعدة بتنوّر الخطوة الجاية بس.",
    "2 · Maze: Steer with the circle or arrows / WASD. Hint shows one next step.",
  ],
  [
    "٣ · الدرع: اسحب القطعة أو المسها وبعدين المس رأس أو صدر أو وسط داود.",
    "3 · Armour: Steer the hand and Pick / Place, drag a piece, or tap it then David’s head, chest or hip.",
  ],
  [
    "٤ · الجدول: اضغط SPACE أو المس حجر أملس لما الدايرة المتحركة تعدّي عليه.",
    "4 · Brook: Steer the hand and Scoop, press SPACE, or tap a smooth stone as the moving ring passes it.",
  ],
  [
    "٥ · المقلاع: دوس مطوّل على SPACE أو الزر وسيب عشان ترمي. جرّب تاني لو الرمية ما أصابتش.",
    "5 · Sling: Pull and hold the circle, or hold SPACE / the button, then release. Retry freely after a miss.",
  ],
  [
    "ست فرق، كل فريق خمس أطفال: شجّعوا وعدّوا وساعدوا. بدّلوا طفل واحد بيلعب عند كل مهمة. خمس دقايق مش كفاية لكل الثلاثين طفل يمسكوا الأزرار. اللعب الحر بيدي وقت أطول.",
    "Six teams of five can coach, count and cheer. Rotate one operator per mission. Five minutes cannot give all thirty individual control turns. Free play allows extra time.",
  ],
  [
    "وقعة الدرع تمثيل مرح. داود ماكانش متعوّد على درع شاول (١ صموئيل ١٧:٣٩).",
    "The armour tumble is playful exaggeration. David was unfamiliar with Saul’s armour (1 Samuel 17:39).",
  ],
];

export const missionHints: Record<string, [string, string]> = {
  maze: ["اتبع الخطوة اللي بتنور بس.", "Follow the softly pulsing next step."],
  armor: [
    "الخوذة للرأس، القميص والدرع للصدر، والسيف للوسط.",
    "Head → helmet · Chest → tunic & mail · Hip → sword",
  ],
  sheep: [
    "قرّب واضغط SPACE عشان تشيل خروف. اجري لفتحة الحظيرة على اليمين.",
    "Get close and tap the sheep or press SPACE to lift it. Run through the opening on the right; David sets it down automatically.",
  ],
  brook: [
    "اختار حجر مدوّر وأملس. المسه أو اضغط SPACE بس لما الدايرة المتحركة تعدّي عليه.",
    "Round and smooth! Tap or press SPACE only as the moving ring passes.",
  ],
  sling: [
    "جرّب تسيب بعد النص بشوية. بص الحجر راح فين!",
    "Try releasing just past halfway. Watch where your stone goes!",
  ],
};
