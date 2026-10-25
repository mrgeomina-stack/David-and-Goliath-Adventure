import { it, expect, vi, afterEach } from "vitest";
import { Sound } from "../src/audio";
afterEach(() => vi.unstubAllGlobals());
it("story footsteps are bounded cached local effects cancelled with the scene", () => {
  const sound = new Sound(),
    buffers: Float32Array[] = [],
    stop = vi.fn();
  sound.context = {
    sampleRate: 48000,
    currentTime: 0,
    destination: {},
    createBuffer: (_channels: number, length: number) => {
      const data = new Float32Array(length);
      buffers.push(data);
      return { getChannelData: () => data };
    },
    createBufferSource: () => ({ connect: vi.fn(), start: vi.fn(), stop }),
    createGain: () => ({ gain: { value: 0 }, connect: vi.fn() }),
    suspend: vi.fn(),
    resume: vi.fn(),
  } as unknown as AudioContext;
  sound.play("stomp");
  sound.play("stomp");
  expect(buffers.map((b) => b.length)).toEqual([37440]);
  for (const b of buffers) {
    expect(b.every(Number.isFinite)).toBe(true);
    expect(b.reduce((m, v) => Math.max(m, Math.abs(v)), 0)).toBeLessThanOrEqual(
      0.68,
    );
    expect(b.some((v) => Math.abs(v) > 0.1)).toBe(true);
  }
  expect(sound.events.stomp).toBe(2);
  expect(sound.events.giantLaugh).toBeUndefined();
  sound.stopSamples();
  expect(stop).toHaveBeenCalledTimes(2);
  sound.setMuted(true);
  sound.play("giantLaugh");
  sound.setMuted(false);
  sound.pause(true);
  sound.play("stomp");
  expect(sound.events.stomp).toBe(2);
  expect(sound.events.giantLaugh).toBeUndefined();
});
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

it("keeps one background loop across mission resets and ducks beneath speech and victory", async () => {
  const sources: {
    stop: ReturnType<typeof vi.fn>;
    loop: boolean;
    buffer: unknown;
  }[] = [];
  const parameter = () => ({ value: 0, setTargetAtTime: vi.fn() });
  const context = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn(),
    suspend: vi.fn(),
    decodeAudioData: async () => ({ duration: 58.04 }),
    createBufferSource: () => {
      const source = {
        loop: false,
        buffer: null as unknown,
        stop: vi.fn(),
        start: vi.fn(),
        connect: vi.fn(),
      };
      sources.push(source);
      return source;
    },
    createGain: () => ({ gain: parameter(), connect: vi.fn() }),
  };
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        return context;
      }
    },
  );
  vi.stubGlobal("fetch", async () => ({
    arrayBuffer: async () => new ArrayBuffer(4),
  }));
  const sound = new Sound();
  sound.unlock();
  await vi.waitFor(() => expect(sound.events.background).toBe(1));
  const loop = sources.find((s) => s.loop)!;
  expect(loop).toBeDefined();
  expect(sound.musicState.targetGain).toBe(0.14);
  await sound.voice("data:audio/mp3;base64,AAAA");
  expect(sound.musicState.targetGain).toBe(0.035);
  sound.stopVoice();
  expect(sound.musicState.targetGain).toBe(0.14);
  sound.play("complete");
  expect(sound.musicState.targetGain).toBe(0.055);
  sound.setGuidance(true);
  expect(sound.musicState.targetGain).toBe(0.035);
  sound.setMusic(false);
  expect(sound.musicState.targetGain).toBe(0);
  sound.setMusic(true);
  expect(sound.musicState.targetGain).toBe(0.035);
  sound.setGuidance(false);
  sound.stopSamples();
  expect(loop.stop).not.toHaveBeenCalled();
  expect(sound.musicState.targetGain).toBe(0.14);
  sound.setMuted(true);
  expect(sound.musicState.targetGain).toBe(0);
  sound.setMuted(false);
  expect(sound.musicState.targetGain).toBe(0.14);
  sound.unlock();
  expect(sound.events.background).toBe(1);
});
it("release swish and armour crash are bounded, cached, cancellable and respect pause/mute", () => {
  const sound = new Sound(),
    buffers: Float32Array[] = [],
    stops = vi.fn();
  const context = {
    state: "running",
    currentTime: 0,
    sampleRate: 48000,
    destination: {},
    createBuffer: (_channels: number, length: number) => {
      const data = new Float32Array(length);
      buffers.push(data);
      return { getChannelData: () => data };
    },
    createBufferSource: () => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: stops,
    }),
    createGain: () => ({ gain: { value: 0 }, connect: vi.fn() }),
    suspend: vi.fn(),
    resume: vi.fn(),
  };
  sound.context = context as unknown as AudioContext;
  sound.play("launch");
  sound.play("armorCrash");
  expect(sound.events.launch).toBe(1);
  expect(sound.events.armorCrash).toBe(1);
  expect(buffers.map((b) => b.length)).toEqual([23040, 74400]);
  for (const data of buffers) {
    expect(data.every(Number.isFinite)).toBe(true);
    expect(Math.max(...data.map(Math.abs))).toBeLessThanOrEqual(0.72);
    expect(data.some((v) => Math.abs(v) > 0.1)).toBe(true);
  }
  sound.play("launch");
  expect(buffers.length).toBe(2);
  sound.stopSamples();
  expect(stops).toHaveBeenCalledTimes(3);
  sound.setMuted(true);
  sound.play("launch");
  sound.play("armorCrash");
  sound.setMuted(false);
  sound.pause(true);
  sound.play("launch");
  sound.play("armorCrash");
  expect(sound.events.launch).toBe(2);
  expect(sound.events.armorCrash).toBe(1);
});

it("plays the supplied Goliath laugh recording, ducks music, and respects replay, mute and pause", async () => {
  const recording = { duration: 3.288 };
  const other = { duration: 58.04 };
  const sources: {
    buffer: unknown;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }[] = [];
  const createBuffer = vi.fn();
  const fetchMock = vi.fn(async (url: string) => ({
    arrayBuffer: async () =>
      url.includes("goliath-laugh") ? recording : other,
  }));
  vi.stubGlobal("fetch", fetchMock);
  const context = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn(),
    suspend: vi.fn(),
    createBuffer,
    decodeAudioData: async (data: unknown) => data,
    createBufferSource: () => {
      const source = {
        buffer: null as unknown,
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
      };
      sources.push(source);
      return source;
    },
    createGain: () => ({
      gain: { value: 0, setTargetAtTime: vi.fn() },
      connect: vi.fn(),
    }),
  };
  const sound = new Sound();
  sound.context = context as unknown as AudioContext;
  sound.unlock();
  await vi.waitFor(() => expect(sound.sampleDurations.giantLaugh).toBe(3.288));
  sound.play("giantLaugh");
  const played = sources.filter((s) => s.buffer === recording);
  expect(played).toHaveLength(1);
  expect(played[0].start).toHaveBeenCalledOnce();
  expect(createBuffer).not.toHaveBeenCalled();
  expect(sound.musicState.targetGain).toBe(0.055);
  sound.stopSamples();
  expect(played[0].stop).toHaveBeenCalledOnce();
  sound.setMuted(true);
  sound.play("giantLaugh");
  sound.setMuted(false);
  sound.pause(true);
  sound.play("giantLaugh");
  expect(sound.events.giantLaugh).toBe(1);
  sound.pause(false);
  sound.play("giantLaugh");
  expect(sound.events.giantLaugh).toBe(2);
  const previousLaugh = sources.at(-1)!;
  sound.play("giantLaugh");
  expect(previousLaugh.stop).toHaveBeenCalledOnce();
  const currentLaugh = sources.at(-1)!;
  sound.stopLaugh();
  expect(currentLaugh.stop).toHaveBeenCalledOnce();
  expect(sound.events.giantLaugh).toBe(3);
  expect(
    fetchMock.mock.calls.filter(([url]) => url.includes("goliath-laugh")),
  ).toHaveLength(1);
});

it("plays the supplied armour recordings without synthesized effects and respects pause/mute", async () => {
  const recording = { duration: 3.056313 };
  const clatter = { duration: 4.075063 };
  const other = { duration: 58.04 };
  const sources: {
    buffer: unknown;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }[] = [];
  const createBuffer = vi.fn();
  const fetchMock = vi.fn(async (url: string) => ({
    arrayBuffer: async () =>
      url.includes("armor-fall")
        ? recording
        : url.includes("armor-clatter")
          ? clatter
          : other,
  }));
  vi.stubGlobal("fetch", fetchMock);
  const context = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn(),
    suspend: vi.fn(),
    createBuffer,
    decodeAudioData: async (data: unknown) => data,
    createBufferSource: () => {
      const source = {
        buffer: null as unknown,
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn(),
      };
      sources.push(source);
      return source;
    },
    createGain: () => ({
      gain: { value: 0, setTargetAtTime: vi.fn() },
      connect: vi.fn(),
    }),
  };
  const sound = new Sound();
  sound.context = context as unknown as AudioContext;
  sound.unlock();
  await vi.waitFor(() =>
    expect(sound.sampleDurations.armorFall).toBe(3.056313),
  );
  sound.play("armorFall");
  const played = sources.filter((s) => s.buffer === recording);
  expect(played).toHaveLength(1);
  expect(played[0].start).toHaveBeenCalledOnce();
  expect(createBuffer).not.toHaveBeenCalled();
  expect(sound.musicState.targetGain).toBe(0.055);
  sound.play("armorClatter");
  expect(sources.filter((s) => s.buffer === clatter)).toHaveLength(1);
  expect(sound.events.armorClatter).toBe(1);
  expect(sound.events.armorCrash).toBeUndefined();
  expect(sound.events.complete).toBeUndefined();
  sound.stopSamples();
  expect(played[0].stop).toHaveBeenCalledOnce();
  sound.setMuted(true);
  sound.play("armorFall");
  sound.setMuted(false);
  sound.pause(true);
  sound.play("armorFall");
  expect(sound.events.armorFall).toBe(1);
  sound.pause(false);
  sound.play("armorFall");
  expect(sound.events.armorFall).toBe(2);
  expect(
    fetchMock.mock.calls.filter(([url]) => url.includes("armor-fall")),
  ).toHaveLength(1);
  expect(
    fetchMock.mock.calls.filter(([url]) => url.includes("armor-clatter")),
  ).toHaveLength(1);
});
