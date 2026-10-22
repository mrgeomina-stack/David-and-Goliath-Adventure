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
