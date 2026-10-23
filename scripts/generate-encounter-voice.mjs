// Development-only audio generation: no synthesis engine ships in the game.
// npm install --prefix /tmp/adventure-voice @echogarden/espeak-ng-emscripten@0.3.5
// ESPEAK_MODULE=/tmp/adventure-voice/node_modules/@echogarden/espeak-ng-emscripten/espeak-ng.js node scripts/generate-encounter-voice.mjs
import { encounterStory } from "../src/encounter-story.ts";
import { interludeSpeech } from "../src/interlude.ts";
const interludes = process.argv.includes("--interludes");
import { writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const { default: create } = await import(
  pathToFileURL(process.env.ESPEAK_MODULE).href
);
const module = await create();
const voice = new module.eSpeakNGWorker();
for (const [stage, lines] of Object.entries(
  interludes ? interludeSpeech : encounterStory,
))
  for (const language of ["en", "ar"]) {
    voice.set_voice(language === "en" ? "en-us" : "ar");
    voice.set_rate(145);
    voice.set_pitch(55);
    const chunks = [];
    voice.synthesize(lines[language], (samples) => {
      chunks.push(Buffer.from(samples.buffer));
      return false;
    });
    const pcm = Buffer.concat(chunks),
      sampleRate = voice.get_samplerate();
    const header = Buffer.alloc(44);
    header.write("RIFF");
    header.writeUInt32LE(pcm.length + 36, 4);
    header.write("WAVEfmt ", 8);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write("data", 36);
    header.writeUInt32LE(pcm.length, 40);
    const wav = `/tmp/adventure-${stage}-${language}.wav`;
    writeFileSync(wav, Buffer.concat([header, pcm]));
    execFileSync("ffmpeg", [
      "-y",
      "-v",
      "error",
      "-i",
      wav,
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "64k",
      `src/assets/audio/${interludes ? "interlude-" : ""}${stage}-${language}.mp3`,
    ]);
    unlinkSync(wav);
  }
