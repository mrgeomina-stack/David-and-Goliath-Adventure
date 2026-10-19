export class Sound {
  context: AudioContext | null = null;
  muted = false;
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
