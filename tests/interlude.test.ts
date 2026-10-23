import { expect, it } from "vitest";
import { StoryInterlude, interludeSpeech } from "../src/interlude";
it("starts Jesse's request before the food journey and keeps bilingual copy editable", () => {
  const s = new StoryInterlude("jesse");
  expect(s.time).toBe(0);
  expect(s.ready).toBe(false);
  expect(s.voiceReady).toBe(true);
  expect(s.reference).toContain("17:17");
  expect(interludeSpeech.jesse.en).toContain("brothers");
  expect(interludeSpeech.jesse.ar).toContain("إخوتك");
});
it("moves through request, handover, close-up and farewell before allowing continue", () => {
  const s = new StoryInterlude("jesse");
  const lines = new Set<string>();
  for (let i = 0; i < 4; i++) {
    lines.add(s.caption[0]);
    s.update(4);
  }
  expect(lines.size).toBe(4);
  expect(s.ready).toBe(false);
  s.update(1);
  expect(s.ready).toBe(true);
  expect(s.caption[0]).toContain("sets off");
});
it("cues two ground contacts and one laugh once, even across a long frame", () => {
  const s = new StoryInterlude("goliath");
  expect(s.update(1.79)).toEqual([]);
  expect(s.update(0.02)).toEqual(["stomp"]);
  expect(s.update(3)).toEqual(["stomp", "giantLaugh"]);
  expect(s.update(30)).toEqual([]);
  expect(s.beat).toBe(3);
});
it("separates laughter from challenge narration and allows both languages to finish", () => {
  const s = new StoryInterlude("goliath");
  s.update(6.99);
  expect(s.voiceReady).toBe(false);
  s.update(0.02);
  expect(s.voiceReady).toBe(true);
  s.update(14.98);
  expect(s.ready).toBe(false);
  s.update(0.02);
  expect(s.ready).toBe(true);
});
it("replay has an independent clean timeline without carrying cues or completion", () => {
  const s = new StoryInterlude("goliath");
  s.update(50);
  const replay = new StoryInterlude(s.id);
  expect(replay.ready).toBe(false);
  expect(replay.update(-5)).toEqual([]);
  expect(replay.time).toBe(0);
  expect(replay.update(5)).toEqual(["stomp", "stomp", "giantLaugh"]);
  expect(new StoryInterlude("jesse").update(30)).toEqual([]);
});
