# Background music and UI feedback · 1.9.2

The supplied `magnific-buttons-and-pins.mp3` is preserved byte-for-byte under
`src/assets/audio/` and embedded in the offline HTML. Its decoded duration is about
58 seconds. One AudioBufferSource loops across missions, retries, the book, and the
final screen; mission sound cancellation does not restart it. The old procedural
chord melody and generated bird-note accompaniment have been removed. Existing
ambient water/wind and gameplay effects remain.

Music gain is 0.14 normally, 0.035 while bundled speech or an installed local voice
is speaking, and 0.055 during the victory recording/giant landing. Gains ease down
and recover gently. The music toggle changes only music; global mute silences
music, narration, effects and UI feedback. Pausing or losing focus freezes the main
audio context, preserving the loop position. As required by Safari/Chrome, playback
starts on the first pointer or keyboard gesture, including on the landing page.

`src/ui-audio.ts` delegates button feedback for nested icons and dynamic popup
buttons. Pointer presses pop once (including held directional/action controls);
keyboard/assistive click activation pops once. Disabled buttons are silent. The
90ms synthesized descending pop uses a small separate Web Audio context so it
remains audible in pause and teacher menus, where gameplay audio is suspended.
Global mute silences this context's gain immediately. No external sound service is
used. Controls and gameplay are unchanged.

# Giant landing update · 1.9.1

`src/audio.ts` synthesizes a cached 1.9-second impact: a descending bass/body tone,
upper harmonics for small speakers, a filtered contact crack, earth rumble and
settling debris. A short attack and bounded waveform avoid clipping. It uses the
same tracked-source cancellation and AudioContext pause/mute policy as recordings.
No downloaded audio or internet connection is required.

`src/world.ts` triggers impact once when success simulation time crosses 1.0s.
With the supplied defeat artwork, ground contact starts at
0.25 + (0.94 / 2.02) × 1.6 ≈ 0.995s. Victory starts at 1.65s, leaving the first
impact clear. Only a real forehead collision enters this sequence. Misses never
trigger it, pauses freeze it, retry resets timing, and unmuting cannot replay an
old impact. The extra adult drawn behind David after sheep rescue was removed;
the next chapter's editable Jesse/food transition caption remains.

# Audio and Goliath encounter · 1.8.0

The uploaded Victory sound.mp3 is kept byte-for-byte as src/assets/audio/victory.mp3.
The uploaded Sheep sound.m4a is retained as original-sheep.m4a and converted with
FFmpeg to a 96 kbps MP3 for consistent AAC-independent browser decoding. The runtime
loads only the converted file. Victory plays once per completed mission, after the
actual basket transfer in the maze. Individual rescues retain their short scoring
chime and do not trigger the victory recording. A new mission cancels the previous
completion recording. Both recordings are embedded data URLs; no network service
or extra audio files are needed when opening the packaged HTML.

Lion calls are generated locally with a quiet falling-pitch breathy growl,
starting after five active seconds and repeating at irregular 7–10 second intervals.
The interval pauses with gameplay; there are no lion calls in other activities,
after failure or after a completed rescue. Pause suspends the audio context;
Sound mutes it. Effects start only after a user gesture unlocks audio.

The Goliath interlude explains: Goliath frightens the soldiers; David trusts God,
chooses courage, and volunteers to Saul. Walk right to hear the challenge, return
to the tent, then press SPACE / Speak. Speaking at a distance does nothing.
Reaching the tent alone no longer skips the conversation. Saul's next spoken
line explains why the armour challenge follows. It is a short interactive story
bridge between the maze and armour, rather than a separately scored combat level.

Narration is enabled initially and can be disabled with Voice. Installed local
English/Arabic voices are preferred. The approach, challenge and Saul explanation
also have bundled synthetic English/Arabic MP3 fallback speech, played through the
already gesture-unlocked Web Audio context for mobile compatibility. This avoids
depending on installed voices or remote speech APIs. Other activities retain their
existing editable captions and optional installed-voice narration. In bilingual
mode spoken narration is English. Captions remain editable in TypeScript.

Fallback speech is synthetic, not a professional human performance. It was generated
with development-only eSpeak NG, @echogarden/espeak-ng-emscripten 0.3.5 (GPL-3.0);
no synthesis engine or third-party engine code is shipped. Scripts and speech text
are in scripts/generate-encounter-voice.mjs and src/encounter-story.ts. The generator
header gives its optional dependency/install command; FFmpeg must be on PATH.
A future actor recording can replace these six MP3 files without gameplay changes.

The brook has ten separated stones in a seeded scattered layout, seven smooth and
three jagged. The collection circle travels at 320 px/s (Easy) or 410 px/s (Normal),
compared with the previous 155/215 px/s. It continuously follows shuffled routes,
visiting each remaining stone once before reshuffling. Brief 0.22/0.12s arrival
pauses and a 58px keyboard pickup radius preserve a forgiving reaction window.
Touch/mouse selection, five unique pickups, kneeling animation, cooldown and
mistake/retry rules are unchanged. A 100-seed model check verifies that real ring
pickups can finish within the thirty-second limit; this is not child playtesting.
