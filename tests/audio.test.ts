import { it, expect, vi } from "vitest";
import { Sound } from "../src/audio";
function audio() {
  const sound = new Sound();
  const context = {
    state: "running",
    suspend: vi.fn(() => {
      context.state = "suspended";
      return Promise.resolve();
    }),
    resume: vi.fn(() => {
      context.state = "running";
      return Promise.resolve();
    }),
  };
  sound.context = context as unknown as AudioContext;
  return { sound, context };
}
it("immediately silences a focus pause without waiting for a rendered frame", () => {
  const { sound, context } = audio();
  sound.pause(true);
  expect(context.state).toBe("suspended");
  sound.pause(false);
  expect(context.state).toBe("running");
});
it("unmuting while paused cannot resume recordings; resuming while muted stays silent", () => {
  const { sound, context } = audio();
  sound.pause(true);
  sound.setMuted(true);
  sound.setMuted(false);
  expect(context.state).toBe("suspended");
  sound.setMuted(true);
  sound.pause(false);
  expect(context.state).toBe("suspended");
  sound.setMuted(false);
  expect(context.state).toBe("running");
});
