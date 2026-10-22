# David’s Big Adventure — validation report · 1.8.0

22 October 2026. This release adds the uploaded sheep/victory recordings,
periodic synthesized lion growls, faster two-dimensional brook-circle movement,
seeded scattered stones, and an explicit spoken Goliath → volunteer to Saul →
armour story bridge. Narration starts enabled. The interlude has bundled synthetic
English/Arabic fallback speech, so it does not depend on installed system voices.
The 30-second Easy/Normal activity bars and untimed Free Play remain.

## Validation

Node 24.19.0, TypeScript 5.9.3, Phaser 3.90.0 Canvas, Vite 7.3.1,
Vitest 4.0.18, Playwright 1.58.2 and system Chromium. Logical scene 1280×720.

- Typecheck and production build: passed.
- Unit tests: **43 passed**. New checks cover offline speech selection/cancellation,
  immediate pause/mute audio behavior, and 100 seeded scattered-stone layouts with
  five genuine ring pickups inside 27 simulated seconds. The seeds also verify separated finger targets.
- Browser regression checks: **16 final outcomes passed**, including five clean
  final-build checks (story/audio counts, Voice controls, offline Arabic audio/touch,
  mobile regression and disconnected HTML). See `qa/browser-results.json` and the release result
  index for original outcomes and final reruns. The initial run exposed an old
  test assuming Voice started disabled; the test now verifies both toggle states.
  A pre-final harness metadata read overlapped a rebuild; a clean final-build rerun
  is indexed separately. Neither issue was a failed gameplay interaction.
- Full-story input test: real sheep carries, maze walls/route, explicit approach/
  return/Speak interaction, all four armour drops and recovery, five keyboard ring
  pickups, and a genuine ballistic hit. Completion-audio counts are checked after
  all five missions; the maze cue follows actual food transfer. Read-only QA
  feedback guides automation; it cannot change game state or force outcomes.
- Offline phone audio/touch test: no installed speech voices, Arabic fallback,
  audio pause/mute, both supplied recordings decoded, faster 2D ring movement,
  jagged rejection, five unique touch pickups and exactly one completion track.
- Existing regression coverage includes low/high sling misses, failure/retry,
  restarts, timed/untimed activities, touch armour, rotation, responsive bounds,
  service-worker cache failure/retry, offline play and offline relaunch.

Actual integrated-game screenshots 90–95 show the story instructions, Saul armour
transition, moving-circle pickups, Arabic phone guidance and scattered phone brook.
The screenshots and machine-readable logs are included in the separate QA archive.
See `docs/AUDIO_AND_ENCOUNTER.md` for audio provenance, generation and editable
scripts. The original uploaded sheep file is retained; the victory MP3 is unchanged.

## Practical limits and unchanged asset gaps

These are headless Chromium tests with emulated phone/tablet touch, not physical
iPhone/iPad/Android or Safari certification. No human listening or child classroom
playtest is claimed. The fallback speech is synthetic rather than an actor recording;
a professional recording remains an optional production improvement. Other chapters
still need an installed local voice for speech, with bilingual captions always present.

Managed Chromium blocks direct `file://` navigation in this environment. Offline
checks therefore load the self-contained production HTML with networking disabled;
this does not certify every desktop file-opening policy. The ZIP contains a classic
inline script and inline artwork/audio, without module/CDN/runtime internet imports.
Phones/tablets should use the HTTPS/PWA setup in `docs/MOBILE_PWA.md`.

The supplied art pack still has one damaged meadow background, 24 absent optional
effect frames and provisional character frames. Those remain quarantined or replaced
by the better existing painting/procedural animation. No asset inspector replaces the
game. David’s coherent painted rig, lateral facing, food handover, sheep pen physics,
armour drop geometry, exactly five stones, sling ballistics and real Goliath forehead
collision remain. Earlier validation detail is retained in docs/VALIDATION_1_7_0.md.

## Reproduce

```
npm ci
npm test
npm run build
BROWSER_PORT=4175 npm run test:browser
npm run package
```

The browser runner defaults to port 4174; override BROWSER_PORT if occupied.
It uses two workers (BROWSER_WORKERS=1 for sequential runs). Do not run duplicate
suites concurrently. npm run preview -- --port 4173 previews the production game;
GAME_URL=http://localhost:4173/ node scripts/audio-brook-check.mjs runs the focused
sound/touch check. Extract the complete offline ZIP before opening index.html.
