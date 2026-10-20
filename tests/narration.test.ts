import { describe, it, expect, vi, afterEach } from "vitest";
import { Narrator } from "../src/narration";
afterEach(() => vi.unstubAllGlobals());
describe("optional local narration", () => {
  it("uses an installed local voice, avoids repeats, and cancels on mute", () => {
    const speak = vi.fn(),
      cancel = vi.fn();
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [{ localService: true, lang: "en-US" }],
      speak,
      cancel,
    });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        constructor(public text: string) {}
      },
    );
    const voice = new Narrator();
    voice.enabled = true;
    voice.speak("chapter", "Hello", "مرحبا", "en", false);
    voice.speak("chapter", "Hello", "مرحبا", "en", false);
    expect(speak).toHaveBeenCalledTimes(1);
    voice.speak("chapter", "Hello", "مرحبا", "en", true);
    expect(cancel).toHaveBeenCalledTimes(2);
  });
  it("does not select a remote voice or throw when speech is unavailable", () => {
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [{ localService: false, lang: "en-US" }],
      speak,
      cancel: vi.fn(),
    });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        constructor(public text: string) {}
      },
    );
    const voice = new Narrator();
    voice.enabled = true;
    voice.speak("chapter", "Hello", "مرحبا", "en", false);
    expect(speak).not.toHaveBeenCalled();
    vi.stubGlobal("speechSynthesis", undefined);
    const absent = new Narrator();
    absent.enabled = true;
    expect(() =>
      absent.speak("x", "Hello", "مرحبا", "ar", false),
    ).not.toThrow();
  });
});
