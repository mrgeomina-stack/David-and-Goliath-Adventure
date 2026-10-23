/** Story-only timeline. It never advances an activity timer or awards a reward. */
export type InterludeId = "jesse" | "goliath";
export const interludeSpeech = {
  jesse: {
    en: "David, take this bread and food to your brothers at the army camp. See how they are, then bring me news. David gladly sets off to help his family.",
    ar: "يا داود، خذ هذا الخبز والطعام إلى إخوتك في معسكر الجيش. اطمئن عليهم، ثم ارجع وأخبرني بأحوالهم. انطلق داود بفرح ليساعد أسرته.",
  },
  goliath: {
    en: "Who will face me? Choose someone to fight me! The soldiers are afraid, but David remembers how God helped him protect his sheep. He decides to speak to King Saul.",
    ar: "من يواجهني؟ اختاروا رجلاً ليحاربني! خاف الجنود، لكن داود تذكر كيف ساعده الله ليحمي خرافه. وقرر أن يتكلم مع الملك شاول.",
  },
};
const captions = {
  jesse: [
    ["Jesse has a special task for David.", "يسّى عنده مهمة خاصة لداود."],
    [
      "“Take this food to your brothers at the army camp.”",
      "«خذ هذا الطعام إلى إخوتك في معسكر الجيش.»",
    ],
    [
      "“See how they are, and bring me news.”",
      "«اطمئن عليهم، وارجع وأخبرني بأحوالهم.»",
    ],
    [
      "David sets off with food, kindness and courage.",
      "انطلق داود بالطعام، بقلب محب وشجاع.",
    ],
  ],
  goliath: [
    ["A giant steps into the valley…", "تقدّم عملاق إلى الوادي…"],
    [
      "THUMP! THUMP! Goliath laughs at the army.",
      "دُمْ! دُمْ! ضحك جليات متحدّيًا الجيش.",
    ],
    [
      "“Who will face me? Choose someone to fight me!”",
      "«من يواجهني؟ اختاروا رجلاً ليحاربني!»",
    ],
    [
      "David remembers God’s help. He will speak to Saul.",
      "تذكر داود مساعدة الله. وقرر أن يتكلم مع شاول.",
    ],
  ],
} satisfies Record<InterludeId, [string, string][]>;
export class StoryInterlude {
  time = 0;
  readonly duration: number;
  readonly id: InterludeId;
  constructor(id: InterludeId) {
    this.id = id;
    this.duration = id === "jesse" ? 17 : 22;
  }
  get ready() {
    return this.time >= this.duration;
  }
  get beat() {
    return Math.min(3, Math.floor(this.time / 4));
  }
  get caption() {
    return captions[this.id][this.beat];
  }
  get voiceReady() {
    return this.id === "jesse" || this.time >= 7;
  }
  get reference() {
    return this.id === "jesse"
      ? "1 SAMUEL 17:17–20"
      : "1 SAMUEL 17:8–11, 32–37";
  }
  update(dt: number): ("stomp" | "giantLaugh")[] {
    const before = this.time;
    this.time += Math.max(0, dt);
    if (this.id !== "goliath") return [];
    return (
      [
        [1.8, "stomp"],
        [3.6, "stomp"],
        [4.5, "giantLaugh"],
      ] as const
    )
      .filter(([at]) => before < at && this.time >= at)
      .map(([, cue]) => cue);
  }
}
