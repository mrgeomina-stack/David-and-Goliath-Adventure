import { ORDER, type Mission } from "./model";
export class Journal {
  completed = new Set<Mission>();
  constructor(
    private storage: Pick<Storage, "getItem" | "setItem"> | null = null,
  ) {
    try {
      const saved = JSON.parse(storage?.getItem("david-keepsakes-v1") || "[]");
      if (Array.isArray(saved))
        for (const item of saved)
          if (ORDER.includes(item)) this.completed.add(item);
    } catch {
      /* The adventure also works without persistent browser storage. */
    }
  }
  earn(mission: Mission) {
    if (this.completed.has(mission)) return false;
    this.completed.add(mission);
    try {
      this.storage?.setItem(
        "david-keepsakes-v1",
        JSON.stringify([...this.completed]),
      );
    } catch {}
    return true;
  }
}
export const CHAPTERS = [
  {
    mission: "sheep",
    name: ["The shepherd’s meadow", "مرج الراعي"],
    gift: ["Shepherd’s ribbon", "شريط الراعي"],
    icon: "sheep",
    giftIcon: "ribbon",
    color: "#3a8e83",
    position: [18, 68],
  },
  {
    mission: "maze",
    name: ["A gift for the brothers", "هدية للإخوة"],
    gift: ["Bread basket", "سلة الخبز"],
    icon: "bread",
    giftIcon: "bread",
    color: "#ce8a39",
    position: [23, 23],
  },
  {
    mission: "armor",
    name: ["David finds his way", "داود يختار طريقه"],
    gift: ["Courage feather", "ريشة الشجاعة"],
    icon: "shield",
    giftIcon: "feather",
    color: "#9771b5",
    position: [49, 45],
  },
  {
    mission: "brook",
    name: ["Five smooth stones", "خمس حجارة ملساء"],
    gift: ["River stone", "حجر من الجدول"],
    icon: "stone",
    giftIcon: "stone",
    color: "#2b9ead",
    position: [77, 72],
  },
  {
    mission: "sling",
    name: ["A little courage", "شجاعة صغيرة"],
    gift: ["Faith medallion", "وسام الإيمان"],
    icon: "star",
    giftIcon: "star",
    color: "#d27752",
    position: [80, 24],
  },
] as const;
/** Original vector motifs share one stroke, material palette and generous silhouette. */
export function emblem(kind: string) {
  const paths: Record<string, string> = {
    ribbon:
      '<path d="m34 49-9 38 20-9 11 7 8-36" fill="#508d8a"/><circle cx="50" cy="35" r="23" fill="#f6d687"/><circle cx="50" cy="35" r="15" fill="#fff3c9"/><path d="m41 35 6 6 13-15" stroke="#447e73"/>',
    feather:
      '<path d="M22 80Q30 21 78 13Q89 61 30 76Z" fill="#e0c5e9"/><path d="M22 85 72 24m-29 35-9-20m20 8 15 1m-12-13-3-12" stroke="#87639e"/>',
    sheep:
      '<ellipse cx="45" cy="44" rx="28" ry="21" fill="#fff2cc"/><path d="M26 60v13m30-13v13"/><ellipse cx="72" cy="43" rx="13" ry="17" fill="#dba36a"/><circle cx="76" cy="39" r="2" fill="#263e43"/><path d="M22 32q6-14 16-7q12-14 20 0q15-4 16 12" fill="#fff7df"/>',
    bread:
      '<path d="M17 49h66l-9 29H26Z" fill="#ba804a"/><path d="M29 50V38a21 21 0 0 1 42 0v12" fill="none"/><ellipse cx="50" cy="43" rx="27" ry="17" fill="#efbb63"/><path d="m34 35 8 11m5-14 8 11m5-10 8 10" stroke="#fff0bd"/>',
    shield:
      '<path d="M50 14 80 26v23q0 22-30 37Q20 71 20 49V26Z" fill="#b1a0cc"/><path d="M50 25 69 33v16q0 15-19 25Q31 64 31 49V33Z" fill="#eee3f4"/><path d="m39 50 8 8 17-20" stroke="#6a568b"/>',
    stone:
      '<ellipse cx="50" cy="54" rx="33" ry="24" fill="#8ebcbd"/><path d="M24 58q25-27 54-15M33 70q16-22 38-24" stroke="#eef9e7"/><ellipse cx="39" cy="45" rx="9" ry="4" fill="#d9e8db" stroke="none"/>',
    star: '<path d="m50 12 11 25 27 4-20 20 5 27-23-13-23 13 5-27-20-20 27-4Z" fill="#f6ce6a"/><circle cx="50" cy="51" r="10" fill="#fff1bb"/>',
  };
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g stroke="#67593c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths[kind] || paths.star}</g></svg>`;
}
