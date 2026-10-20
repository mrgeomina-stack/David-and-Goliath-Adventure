export class Sound {
  context: AudioContext | null = null;
  muted = false;
  music = true;
  private score: GainNode | null = null;
  private air: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private nextBar = 0;
  private nextBird = 0;
  private bar = 0;
  private walking = 0;
  setMusic(enabled: boolean) {
    this.music = enabled;
  }
  private note(freq: number, when: number, length: number, gain: number) {
    if (!this.context || !this.score) return;
    const o = this.context.createOscillator(),
      g = this.context.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + length);
    o.connect(g);
    g.connect(this.score);
    o.start(when);
    o.stop(when + length + 0.02);
  }
  tick(mission: string, paused: boolean, moving: boolean, dt: number) {
    if (!this.context || this.muted) return;
    const c = this.context,
      t = c.currentTime;
    if (!this.score) {
      this.score = c.createGain();
      this.score.connect(c.destination);
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
    this.score.gain.setTargetAtTime(paused || !this.music ? 0 : 0.1, t, 0.25);
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
    if (t >= this.nextBar) {
      this.nextBar = t + 4.2;
      const roots = [146.83, 130.81, 174.61, 130.81],
        root = roots[this.bar % 4];
      if (this.music) {
        [1, 1.5, 2].forEach((ratio, i) =>
          this.note(root * ratio, t + i * 0.1, 3.5, 0.12),
        );
        const melody = [2, 2.25, 2.5, 3, 2.5, 2.25, 2, 1.5];
        for (let i = 0; i < 4; i++)
          this.note(
            root * melody[(this.bar * 3 + i) % 8],
            t + 0.4 + i * 0.75,
            0.7,
            0.22,
          );
      }
      this.bar++;
    }
    if (t >= this.nextBird && mission !== "armor") {
      this.nextBird = t + 8 + (this.bar % 4);
      this.note(2200, t, 0.1, 0.12);
      this.note(2800, t + 0.15, 0.12, 0.1);
    }
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
    if (!this.muted) void this.context.resume();
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
    if (this.context) {
      if (muted) void this.context.suspend();
      else if (!this.muted) void this.context.resume();
    }
  }
}
