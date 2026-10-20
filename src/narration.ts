import type { Language } from "./strings";
export class Narrator {
  enabled = false;
  private key = "";
  available =
    typeof speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined";
  stop() {
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
  ) {
    if (!this.enabled || muted) {
      this.stop();
      return;
    }
    if (!this.available || this.key === key) return;
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
    speechSynthesis.speak(utterance);
  }
}
