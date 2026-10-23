import sheepUrl from "./assets/audio/sheep.mp3";
import victoryUrl from "./assets/audio/victory.mp3";
import musicUrl from "./assets/audio/magnific-buttons-and-pins.mp3";
export class Sound {
  private samples = new Map<string, AudioBuffer>();
  private loading: Promise<void> | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private generation = 0;
  private voiceSource: AudioBufferSourceNode | null = null;
  private voiceGeneration = 0;
  stopVoice() {
    this.voiceGeneration++;
    this.voiceSource?.stop();
    this.voiceSource = null;
    this.mixMusic();
  }
  async voice(url: string) {
    this.stopVoice();
    const generation = this.voiceGeneration;
    try {
      if (!this.context) return;
      let buffer = this.samples.get(url);
      if (!buffer) {
        buffer = await this.context.decodeAudioData(
          await (await fetch(url)).arrayBuffer(),
        );
        this.samples.set(url, buffer);
      }
      if (generation !== this.voiceGeneration || this.muted) return;
      const source = this.context.createBufferSource(),
        gain = this.context.createGain();
      source.buffer = buffer;
      gain.gain.value = 0.75;
      source.connect(gain);
      gain.connect(this.context.destination);
      this.voiceSource = source;
      this.mixMusic();
      source.onended = () => {
        if (this.voiceSource === source) {
          this.voiceSource = null;
          this.mixMusic();
        }
      };
      this.events.voice = (this.events.voice ?? 0) + 1;
      source.start();
    } catch (error) {
      console.warn("Narration unavailable", error);
    }
  }
  get sampleDurations() {
    return Object.fromEntries(
      [...this.samples]
        .filter(([key]) => !key.startsWith("data:"))
        .map(([key, buffer]) => [key, buffer.duration]),
    );
  }
  private roarWait = 5;
  readonly events: Record<string, number> = {};
  private async loadSamples() {
    await Promise.all(
      [
        ["sheep", sheepUrl],
        ["complete", victoryUrl],
        ["background", musicUrl],
      ].map(async ([key, url]) => {
        try {
          const response = await fetch(url);
          const buffer = await this.context!.decodeAudioData(
            await response.arrayBuffer(),
          );
          this.samples.set(key, buffer);
          if (key === "background") this.startMusic();
        } catch (error) {
          console.warn(`Audio unavailable: ${key}`, error);
        }
      }),
    );
  }
  stopSamples() {
    this.generation++;
    for (const source of this.sources) source.stop();
    this.sources.clear();
    this.roarWait = 5;
    this.featureUntil = 0;
    this.mixMusic();
  }
  private sample(name: string) {
    const generation = this.generation;
    const start = () => {
      const buffer = this.samples.get(name);
      if (
        !buffer ||
        !this.context ||
        this.muted ||
        generation !== this.generation
      )
        return;
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer;
      gain.gain.value = name === "complete" ? 0.55 : 0.7;
      source.connect(gain);
      gain.connect(this.context.destination);
      this.sources.add(source);
      source.onended = () => this.sources.delete(source);
      this.events[name] = (this.events[name] ?? 0) + 1;
      if (name === "complete") this.featureSound(buffer.duration);
      source.start();
    };
    if (this.samples.has(name)) start();
    else void this.loading?.then(start);
  }
  private giantImpact() {
    if (!this.context || this.muted || this.paused) return;
    const c = this.context;
    let buffer = this.samples.get("impact");
    if (!buffer) {
      // Layer body weight, an earthy contact crack and settling debris. Harmonics
      // above the bass keep the impact audible on tablet/phone speakers, too.
      buffer = c.createBuffer(1, Math.ceil(c.sampleRate * 1.9), c.sampleRate);
      const data = buffer.getChannelData(0);
      let seed = 937,
        earth = 0,
        dust = 0;
      for (let i = 0; i < data.length; i++) {
        const t = i / c.sampleRate;
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const noise = (seed / 4294967296) * 2 - 1;
        earth +=
          (1 - Math.exp((-2 * Math.PI * 420) / c.sampleRate)) * (noise - earth);
        dust +=
          (1 - Math.exp((-2 * Math.PI * 1800) / c.sampleRate)) * (noise - dust);
        const phase =
          2 * Math.PI * (42 * t + 68 * 0.075 * (1 - Math.exp(-t / 0.075)));
        const attack = Math.min(1, t / 0.006);
        const body =
          (Math.sin(phase) +
            0.32 * Math.sin(phase * 2) +
            0.16 * Math.sin(phase * 3)) *
          Math.exp(-t * 5);
        const crack = dust * Math.exp(-t * 24);
        const rumble =
          earth * Math.exp(-t * 2.8) * (0.75 + 0.25 * Math.cos(t * 37));
        const debris =
          (dust - earth) * Math.exp(-t * 4.5) * Math.sin(t * 53) ** 2;
        const fade = Math.min(1, (1.9 - t) / 0.15);
        data[i] =
          Math.tanh(body * 0.85 + crack * 1.6 + rumble * 1.3 + debris * 0.35) *
          attack *
          fade *
          0.72;
      }
      this.samples.set("impact", buffer);
    }
    const source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(c.destination);
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
    this.events.impact = (this.events.impact ?? 0) + 1;
    this.featureSound(1.9);
    source.start();
  }
  lion(dt: number, active: boolean) {
    if (!active || this.muted || !this.context) return;
    this.roarWait -= dt;
    if (this.roarWait > 0) return;
    this.roarWait = 7 + Math.random() * 3;
    const c = this.context,
      now = c.currentTime;
    // A soft, breathy growl with a falling pitch; deliberately child-friendly.
    const buffer = c.createBuffer(1, c.sampleRate * 1.4, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / c.sampleRate,
        envelope = Math.sin((Math.PI * t) / 1.4) ** 2;
      data[i] =
        envelope *
        (0.6 *
          Math.sin(2 * Math.PI * (105 * t - 17 * t * t)) *
          (0.6 + 0.4 * Math.sin(t * 45)) +
          0.3 * (Math.random() * 2 - 1));
    }
    const source = c.createBufferSource(),
      filter = c.createBiquadFilter(),
      gain = c.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = 650;
    gain.gain.value = 0.24;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
    source.start(now);
    this.events.roar = (this.events.roar ?? 0) + 1;
  }
  context: AudioContext | null = null;
  private paused = false;
  pause(paused: boolean) {
    this.paused = paused;
    if (!this.context) return;
    if ((paused || this.muted) && this.context.state === "running")
      void this.context.suspend();
    else if (!paused && !this.muted && this.context.state === "suspended")
      void this.context.resume();
  }
  muted = false;
  music = true;
  private background: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private musicStartedAt = 0;
  private guidance = false;
  private featureUntil = 0;
  private musicTarget = 0;
  private uiContext: AudioContext | null = null;
  private uiGain: GainNode | null = null;
  private air: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private walking = 0;
  get musicState() {
    return {
      started: this.background !== null,
      loop: this.background?.loop ?? false,
      targetGain: this.musicTarget,
      guidance: this.guidance || this.voiceSource !== null,
      position:
        this.context && this.background?.buffer
          ? (this.context.currentTime - this.musicStartedAt) %
            this.background.buffer.duration
          : 0,
    };
  }
  setMusic(enabled: boolean) {
    this.music = enabled;
    this.mixMusic();
  }
  setGuidance(active: boolean) {
    this.guidance = active;
    this.mixMusic();
  }
  private featureSound(duration: number) {
    if (!this.context) return;
    this.featureUntil = Math.max(
      this.featureUntil,
      this.context.currentTime + duration,
    );
    this.mixMusic();
  }
  private mixMusic() {
    if (!this.context || !this.musicGain) return;
    const target =
      !this.music || this.muted
        ? 0
        : this.guidance || this.voiceSource
          ? 0.035
          : this.context.currentTime < this.featureUntil
            ? 0.055
            : 0.14;
    if (target === this.musicTarget) return;
    this.musicTarget = target;
    this.musicGain.gain.setTargetAtTime(
      target,
      this.context.currentTime,
      target === 0 ? 0.035 : target < 0.14 ? 0.08 : 0.45,
    );
  }
  private startMusic() {
    const buffer = this.samples.get("background");
    if (!buffer || !this.context || this.background) return;
    const source = this.context.createBufferSource();
    this.musicGain = this.context.createGain();
    this.musicGain.gain.value = 0;
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.musicGain);
    this.musicGain.connect(this.context.destination);
    this.background = source;
    this.musicStartedAt = this.context.currentTime;
    this.events.background = (this.events.background ?? 0) + 1;
    this.mixMusic();
    source.start();
  }
  /** UI audio remains available in pause/teacher menus; global mute still applies. */
  pop() {
    if (this.muted) return;
    this.uiContext ??= new AudioContext();
    const c = this.uiContext;
    void c.resume();
    if (!this.uiGain) {
      this.uiGain = c.createGain();
      this.uiGain.connect(c.destination);
    }
    this.uiGain.gain.setValueAtTime(1, c.currentTime);
    const oscillator = c.createOscillator(),
      gain = c.createGain(),
      t = c.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, t);
    oscillator.frequency.exponentialRampToValueAtTime(210, t + 0.075);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.13, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);
    oscillator.connect(gain);
    gain.connect(this.uiGain);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(t);
    oscillator.stop(t + 0.09);
    this.events.pop = (this.events.pop ?? 0) + 1;
  }
  tick(mission: string, paused: boolean, moving: boolean, dt: number) {
    if (!this.context || this.muted) return;
    this.pause(paused);
    const c = this.context,
      t = c.currentTime;
    this.mixMusic();
    if (!this.air) {
      this.air = c.createGain();
      this.filter = c.createBiquadFilter();
      this.filter.type = "lowpass";
      const buffer = c.createBuffer(1, c.sampleRate * 3, c.sampleRate),
        a = buffer.getChannelData(0);
      let seed = 17;
      for (let i = 0; i < a.length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        a[i] = ((seed / 4294967296) * 2 - 1) * 0.4;
      }
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(this.filter);
      this.filter.connect(this.air);
      this.air.connect(c.destination);
      noise.start();
    }
    this.air!.gain.setTargetAtTime(
      paused ? 0 : mission === "brook" ? 0.11 : 0.025,
      t,
      0.4,
    );
    this.filter!.frequency.setTargetAtTime(
      mission === "brook" ? 1500 : mission === "armor" ? 260 : 500,
      t,
      0.6,
    );
    if (paused) return;
    this.walking += dt;
    if (moving && this.walking > 0.27) {
      this.walking = 0;
      this.rustle(mission === "brook" ? "water" : "step");
    }
  }
  rustle(kind: string) {
    if (!this.context || this.muted) return;
    const c = this.context,
      buffer = c.createBuffer(1, Math.floor(c.sampleRate * 0.16), c.sampleRate),
      data = buffer.getChannelData(0);
    let seed = 413;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = ((seed / 4294967296) * 2 - 1) * (1 - i / data.length) ** 3;
    }
    const source = c.createBufferSource(),
      filter = c.createBiquadFilter(),
      gain = c.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value =
      kind === "water" ? 1400 : kind === "cloth" ? 700 : 200;
    gain.gain.value = kind === "step" ? 0.035 : 0.06;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    source.start();
  }
  unlock() {
    this.context ??= new AudioContext();
    this.loading ??= this.loadSamples();
    if (!this.muted && !this.paused) void this.context.resume();
  }
  tone(freq = 440, length = 0.15, delay = 0, type: OscillatorType = "sine") {
    if (!this.context || this.muted) return;
    const t = this.context.currentTime + delay,
      o = this.context.createOscillator(),
      g = this.context.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.8, t + length);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.075, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + length);
    o.connect(g);
    g.connect(this.context.destination);
    o.start(t);
    o.stop(t + length + 0.01);
  }
  play(name: string) {
    if (name === "impact") {
      this.giantImpact();
      return;
    }
    if (name === "sheep" || name === "complete") {
      this.sample(name);
      return;
    }
    if (["metal", "call", "plop", "launch"].includes(name))
      this.rustle(name === "plop" ? "water" : "cloth");
    if (name === "win") {
      [392, 494, 587, 784].forEach((f, i) =>
        this.tone(f, 0.25, i * 0.12, "triangle"),
      );
    } else if (name === "wall") this.tone(150, 0.1);
    else if (name === "metal") {
      this.tone(930, 0.15, 0, "triangle");
      this.tone(1390, 0.1, 0.035);
    } else if (name === "call") {
      this.tone(550, 0.18);
      this.tone(680, 0.2, 0.15);
    } else if (name === "plop") this.tone(290, 0.15);
    else if (name === "launch") this.tone(740, 0.3, 0, "triangle");
    else this.tone(580, 0.1);
  }
  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.uiContext && this.uiGain)
      this.uiGain.gain.setValueAtTime(
        muted ? 0 : 1,
        this.uiContext.currentTime,
      );
    this.mixMusic();
    this.pause(this.paused);
  }
}
