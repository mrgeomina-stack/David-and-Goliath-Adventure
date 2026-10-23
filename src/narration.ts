import approachen from "./assets/audio/approach-en.mp3";
import approachar from "./assets/audio/approach-ar.mp3";
import challengeen from "./assets/audio/challenge-en.mp3";
import challengear from "./assets/audio/challenge-ar.mp3";
import saulen from "./assets/audio/saul-en.mp3";
import saular from "./assets/audio/saul-ar.mp3";
import jesseen from "./assets/audio/interlude-jesse-en.mp3";
import jessear from "./assets/audio/interlude-jesse-ar.mp3";
import gianten from "./assets/audio/interlude-goliath-en.mp3";
import giantar from "./assets/audio/interlude-goliath-ar.mp3";
const bundled = {
  jesse: { en: jesseen, ar: jessear },
  goliath: { en: gianten, ar: giantar },
  approach: { en: approachen, ar: approachar },
  challenge: { en: challengeen, ar: challengear },
  saul: { en: saulen, ar: saular },
};
import type { Language } from "./strings";
export class Narrator {
  constructor(
    private playback?: {
      play: (url: string) => void;
      stop: () => void;
      activity?: (speaking: boolean) => void;
    },
  ) {}
  enabled = false;
  private key = "";
  private generation = 0;
  available =
    typeof speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined";
  stop() {
    this.generation++;
    this.playback?.activity?.(false);
    this.playback?.stop();
    if (this.available) speechSynthesis.cancel();
  }
  reset() {
    this.key = "";
    this.stop();
  }
  speak(
    key: string,
    english: string,
    arabic: string,
    language: Language,
    muted: boolean,
    fallback?: keyof typeof bundled,
  ) {
    if (!this.enabled || muted) {
      this.key = "";
      this.stop();
      return;
    }
    if (this.key === key) return;
    const local =
      this.available &&
      speechSynthesis
        .getVoices()
        .find(
          (v) =>
            v.localService &&
            v.lang.startsWith(language === "ar" ? "ar" : "en"),
        );
    if (!local && fallback && this.playback) {
      this.stop();
      this.key = key;
      this.playback.play(bundled[fallback][language === "ar" ? "ar" : "en"]);
      return;
    }
    if (!local && !fallback) {
      this.stop();
      return;
    }
    if (!this.available) return;
    const utterance = new SpeechSynthesisUtterance(
      language === "ar" ? arabic : english,
    );
    utterance.lang = language === "ar" ? "ar" : "en";
    utterance.rate = 0.87;
    utterance.pitch = 1.08;
    utterance.volume = 0.8;
    // Choose an installed local voice: narration must not request a cloud service.
    const voice = speechSynthesis
      .getVoices()
      .find((v) => v.localService && v.lang.startsWith(utterance.lang));
    if (!voice) return;
    this.key = key;
    this.stop();
    utterance.voice = voice;
    const generation = this.generation;
    utterance.onstart = () => {
      if (generation === this.generation) this.playback?.activity?.(true);
    };
    utterance.onend = utterance.onerror = () => {
      if (generation === this.generation) this.playback?.activity?.(false);
    };
    speechSynthesis.speak(utterance);
  }
}
