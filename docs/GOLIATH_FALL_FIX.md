# Goliath forward-fall correction

Baseline: `a1b20578dd66ce0e92dffc93aafefe30e1482fce` (existing 1.12.0).
This is a scoped visual fix; package/dependency versions are deliberately unchanged.

## What changed in the game

Only three game files are involved:

1. **Modified `src/world.ts`**: load/configure the one defeat atlas; route only a
   successful sling hit to the new renderer; align the existing giant impact
   sound with ground contact; shorten the forehead flash and replace the old
   backward dust placement. Existing victory timing/logic is unchanged.
2. **Added `src/goliath-defeat.ts`**: defeat-only timeline and Canvas renderer.
   Existing upright/hit artwork is kept. The connected painted hit mesh freezes
   in shock, sways briefly with three small dazed stars, then bends forward.
   Six forward/prone poses replace the backward sequence for successful hits.
3. **Added `src/assets/goliath-defeat/forward-fall-atlas.png`**: a transparent
   six-pose atlas matching the existing helmet, beard, bronze armour, red tunic,
   bracers, shin guards and sandals. Crops/pivots keep each pose complete and on
   the same ground plane. The final two poses show the armour's back uppermost,
   chest against the ground and face lowered into the forearms/earth.

The attached ZIP did not transfer successfully: both attempts disconnected the
workspace. It was not imported. These replacement poses were generated from the
existing game's idle/hit art to implement the supplied written forward-fall
specification. No claim is made that they are the exact prepared images in the ZIP.
The old original/provisional artwork remains untouched; the successful sling
sequence no longer uses its backward-fall frames.

## Sequence (seconds after the genuine hit)

| Time | Action |
| --- | --- |
| 0.00–0.10 | Forehead flash and visible hit reaction |
| 0.10–0.26 | Shock pose held still |
| 0.26–0.86 | **0.60-second** dizzy sway / small star swirl |
| 0.86–1.05 | Connected torso/head pitch forward; feet stay planted |
| 1.05–1.18 | Forward lean, arms reaching |
| 1.18–1.30 | Knees buckle / stumble |
| 1.30–1.44 | Airborne forward fall |
| 1.44–1.56 | Face-first descent |
| 1.56–1.62 | Near-ground prone descent |
| 1.62 onward | Stable face-down pose, brief soft dust and existing impact |

The existing victory recording still starts at 1.65s. The completion panel and
final victory transition keep their existing timing and behavior. No new sound
file/cue or sound-system change was introduced; only the existing impact hook
moved from 1.00s to actual ground contact at 1.62s.

## What did not change

No UI, controls, difficulty, scoring, timers, stone charge/trajectory, collider,
David animation, background, other activity, story interlude, final victory-screen
logic, package dependency, build configuration or existing asset manifest changed.
`qa/goliath-fall/scope.json` records the baseline and matching hashes for critical
unchanged files. The only pre-existing game file in the diff is `src/world.ts`;
its changes are confined to loading and rendering this defeat and its impact cue.

## Validation

- **64 unit tests pass** (12 files), including three new defeat-contract tests:
  fixed shock hold, 0.6s stun, stage order, forward pitch, landing gate and a
  non-looping final prone hold. All prior model/audio/mobile/story unit tests pass.
- TypeScript and the production/offline build pass.
- Real offline browser defeat: a genuinely colliding stone triggers the full
  sequence; exactly one launch whoosh, one ground impact and one completion track
  start. No early impact. Continue still reaches the existing victory screen.
- Existing sling regression passes: weak and overpowered throws miss, an ideal
  throw really hits, pause freezes flight, and victory still works. Three real
  releases produce exactly three whooshes.
- **844×390 native touch check passes**: finger hold/release hits, pausing at
  0.345s freezes the dizzy phase for 0.5s without an impact, resume completes the
  forward fall, final prone pose is visible, one impact/one victory and normal
  Continue transition. No page errors.
- Before/after images and recordings were inspected for direction, anatomy,
  feet/ground alignment, readable stun and an unmistakable face-down final pose.

Browser evidence uses Chromium with networking disabled after the self-contained
production HTML loads over loopback. Direct file:// is blocked by this managed
browser; no physical Safari/iOS/Android device or supervised child playtest was
available. The videos are silent visual captures; audio checks observe real
source starts/timing rather than recording speaker output.

## Evidence and supporting files

- `qa/goliath-fall/comparison.gif` / `comparison.mp4`: synchronized before/after.
- `qa/goliath-fall/after.gif` / `after.mp4`: new fall alone (MP4 shows the full game).
- `qa/goliath-fall/before.gif` / `before.mp4`: original backward/face-up fall.
- `qa/goliath-fall/sequence.png`: eight actual in-game poses, not an asset inspector.
- `qa/goliath-fall/resting-before-after.png` and final-before/final-after PNGs.
- `qa/goliath-fall/phone/`: native touch and dizzy pause evidence.
- `qa/goliath-fall/{before,after}/recording/`: uninterrupted browser recordings and
  read-only frame timestamps. Diagnostic screenshots were not taken during these
  recordings, so intermediate poses are not lost to screenshot capture overhead.
- `qa/goliath-fall/clip-timing.json`, build/test/regression logs and scope audit.
- `tests/goliath-defeat.test.ts`: new timeline regression tests.
- `scripts/goliath-fall-check.mjs`: actual gameplay and phone/pause validation.
- `scripts/capture-goliath-fall.mjs`: uninterrupted real-game recording.
- `scripts/export-goliath-fall.py`: FFmpeg/Pillow export from the real recordings.
- `qa/goliath-fall/changed-files.json`: complete file inventory, including artifacts.

## Deliverables

- `Davids_Big_Adventure_Goliath_Fall_Fix.zip`: full offline game with this fix.
- `Davids_Big_Adventure_Goliath_Fall_Source.zip`: full editable source with this fix.
- `Goliath_Fall_Before_After.zip`: focused visual evidence and this report.

Previous release ZIPs are preserved unchanged; use the new **Goliath_Fall_Fix** ZIP.
Extract fully, open index.html, choose the sling mission, and use the normal
hold/release controls. The fall plays only on a real head hit. Source preview:
`npm ci`, `npm run dev`. Checks: `npm test`, `npm run build`, then
`GAME_URL=http://localhost:4179/ node scripts/sling-check.mjs` against the build.
The recording checks additionally need Playwright's FFmpeg or the installed system
FFmpeg; this environment used a temporary Playwright-path symlink to system FFmpeg.
No FFmpeg, Pillow, recording tool or synthesis engine ships in the playable game.
