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

it("plays bundled Arabic/English encounter speech without browser voices, deduplicates and stops on mute", () => {
  vi.stubGlobal("speechSynthesis", undefined);
  const play = vi.fn(),
    stop = vi.fn();
  const voice = new Narrator({ play, stop });
  voice.enabled = true;
  voice.speak("intro", "Hello", "مرحبا", "ar", false, "approach");
  voice.speak("intro", "Hello", "مرحبا", "ar", false, "approach");
  expect(play).toHaveBeenCalledTimes(1);
  expect(play.mock.calls[0][0]).toContain("approach-ar.mp3");
  voice.speak("challenge", "Hello", "مرحبا", "en", false, "challenge");
  expect(play.mock.calls[1][0]).toContain("challenge-en.mp3");
  voice.speak("challenge", "Hello", "مرحبا", "en", true, "challenge");
  expect(stop).toHaveBeenCalledTimes(3);
  expect(play).toHaveBeenCalledTimes(2);
});
