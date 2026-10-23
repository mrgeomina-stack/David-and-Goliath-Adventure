# Story interludes · 1.12.0

Baseline: f2f7d0a2dfe92a7b0d878844796a89a1460fa473.

## Flow and controls

Sheep (four timed deliveries + fifth-lamb encounter) → existing celebration →
Jesse interlude → real maze and single basket transfer → existing celebration →
Goliath interlude → David returns left and speaks to Saul → unchanged armour →
unchanged brook → unchanged ballistic sling → final celebration.

Story scenes are a distinct `interlude` phase rather than playable activity
substitutes. They do not tick timers or call finish/reward code. Practice completion
still returns to title. SPACE or the large Continue button moves on after 17s
(Jesse) / 22s (Goliath); the last pose remains alive while the child reads. Replay
creates a fresh story timeline without resetting rescued sheep or mission progress.
Pause/focus loss freezes simulation and audio. Book navigation and restart retain
existing behavior. Reduced motion removes camera drift, dust/shake and deformation
while keeping captions, poses, sound and the narrative sequence.

`src/interlude.ts` owns editable bilingual captions/speech and deterministic cues.
`src/interlude-view.ts` draws art on the existing 1280×720 Phaser Canvas texture.
Jesse's four directed shots use clean fade-through-shade cuts; connected basket/
hands pixels move subtly using the existing CharacterMesh. Goliath uses a single
alpha-isolated painted mesh, alternating feet, head/torso laughter and breathing,
separate valley plate, two dust bursts and original reference close-ups. Separate
poses are not treated as a provisional frame-by-frame walking sprite sequence.
No animation framework or runtime network service was added.

`src/interlude.css` provides a reusable story label/caption/action panel using the
existing card/button tokens. New controls keep 44px minimum touch heights in the
compact viewport. English/Arabic are separate editable DOM blocks with language
attributes, intentional reading directions and bundled fonts; no rasterized text.
The story label is on the right to keep Jesse and David's faces unobscured.

## Assets and audio

The user supplied eight PNGs in `ChatGPT Image Oct 23, 2026, 03_55_06 PM-1.zip`.
They are preserved unchanged under `src/assets/interludes/`; hashes and roles are
in `provenance.json`. Four Jesse poses and Goliath's laughter/challenge close-ups
are used directly. Reference 5 additionally informed two OpenAI image edits: a clean
valley plate and transparent continuous Goliath actor. These derivatives are
clearly distinguished from the supplied PNGs in the provenance file. Reference
stomp poses 5/6 remain available as editable artwork references.

The two 0.78s ground contacts and one 2.5s low voiced laughter effect are generated
and cached locally through Sound, with tracked cancellation/mute/pause and music
ducking. No giant-fall victory sound is accidentally triggered by a stomp.
Laughter ends before challenge narration begins at 7s. One laugh is a deliberately
synthetic boastful character cue, not a supplied actor recording.

English/Arabic interlude narration is bundled MP3 fallback speech; installed local
voices remain preferred. Regenerate with:

    NPM_CONFIG_CACHE=/tmp/adventure-npm-cache npm install --prefix /tmp/adventure-voice @echogarden/espeak-ng-emscripten@0.3.5
    ESPEAK_MODULE=/tmp/adventure-voice/node_modules/@echogarden/espeak-ng-emscripten/espeak-ng.js node scripts/generate-encounter-voice.mjs --interludes

FFmpeg must be installed. The development-only eSpeak engine is GPL-3.0; no engine
code ships in the game. The generator writes four MP3 files and leaves the prior
approach/challenge/Saul recordings unchanged. Guidance is synthetic, not a human
voice performance. Supplied music stays quiet and ducks for guidance and effects.

## Verification

New timeline tests cover caption/shot order, continuation gates, cue crossings,
replay isolation and narration timing. Audio tests verify finite, bounded,
non-silent cached buffers and mute/pause/cancellation. `scripts/interlude-input.mjs`
extends the full-story check with actual keyboard/touch input, early skip rejection,
local replay, pause freeze, all language modes, phone bounds/touch sizes, unchanged
timers/rewards and exactly two stomps/one laugh. It observes only read-only QA state.
Actual captures are `qa/100-jesse-*.png` and `qa/100-goliath-*.png`.
