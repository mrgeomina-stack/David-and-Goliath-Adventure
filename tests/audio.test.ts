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
it("giant impact has bounded layered audio, reuses its buffer and stops on reset", () => {
  const sound = new Sound();
  const buffers: Float32Array[] = [];
  const sources: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }[] = [];
  sound.context = {
    sampleRate: 48000,
    destination: {},
    createBuffer: (_channels: number, length: number) => {
      const data = new Float32Array(length);
      buffers.push(data);
      return { getChannelData: () => data };
    },
    createBufferSource: () => {
      const source = { connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      sources.push(source);
      return source;
    },
  } as unknown as AudioContext;
  sound.play("impact");
  expect(sound.events.impact).toBe(1);
  const data = buffers[0];
  expect(data.length).toBe(91200);
  expect(data[0]).toBe(0);
  expect(Math.max(...data.map(Math.abs))).toBeLessThanOrEqual(0.72);
  const rms = (start: number, end: number) =>
    Math.sqrt(
      data.slice(start, end).reduce((n, v) => n + v * v, 0) / (end - start),
    );
  expect(rms(500, 10000)).toBeGreaterThan(0.1);
  expect(rms(70000, 90000)).toBeLessThan(rms(500, 10000) / 10);
  sound.play("impact");
  expect(buffers).toHaveLength(1);
  sound.stopSamples();
  expect(sources.every((source) => source.stop.mock.calls.length === 1)).toBe(
    true,
  );
  sound.setMuted(true);
  sound.play("impact");
  expect(sound.events.impact).toBe(2);
  sound.setMuted(false);
  sound.pause(true);
  sound.play("impact");
  expect(sound.events.impact).toBe(2);
});
