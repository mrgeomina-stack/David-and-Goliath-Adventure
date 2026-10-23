# David’s Big Adventure — sheep mini-boss and large cover · 1.10.0

23 October 2026. Baseline `7e36d240a147795d3d714a6d7a03403940c910d3`.
This update adds the requested lion encounter to Protect the Sheep and restores
the large landing-page typography and controls. The nine wandering cover sheep
remain behind the buttons and David still faces left. Desktop-sized windows no
longer receive tiny cover typography just because browser bars reduce height.

## Encounter

Three sheep are rescued through the existing lift/carry/pen controls. The remaining
lamb wanders, is seized, and David approaches with a smoothly eased 12% camera
zoom. Two real timing challenges require separate successful inputs: rescue, then
staff defense. Easy offers 2.1 seconds of green time; Normal offers 1.7 seconds in
a 4.2-second attempt. Early input or expiry gives unlimited local retries. The
second checkpoint retains the rescued lamb. A held input cannot pass both stages.

The scripted return follows the existing open pen entrance; sheep four scores only
after the lamb is placed at its own pen position. Victory plays once, followed by
the normal maze transition. The rescue countdown pauses when three sheep are safe;
there is no countdown penalty while learning the encounter. Free Play remains
untimed overall. Keyboard SPACE, a large touch button/playfield tap, and standard
Gamepad south button (A/Cross) act; the left stick/D-pad move during herding.

The supplied `Lion roar sfx.mp3` is preserved byte-for-byte under
`src/assets/audio/lion-roar.mp3` and embedded in offline HTML. Roars are spaced
apart and cannot overlap each other. A soft staff contact cue, timing chime, sheep
recording and victory recording support the scene. Pause/mute remain effective.
The defeat uses the supplied retreat artwork with a non-graphic recoil. Editable
English/Arabic captions cite 1 Samuel 17:34–37 as the inspiration, not a literal
illustration of every detail. David keeps the existing unified rig and scale.

## Results

- TypeScript + production/offline build passed.
- **52 unit tests passed** (10 files). New tests cover checkpoint admission,
  countdown preservation, 25 local early retries, expiry, second-stage checkpoint,
  two required successes, real fence-safe return coordinates, final pen placement,
  green-window lengths and smooth camera bounds.
- Dedicated offline lion browser check passed: three real deliveries, early miss,
  timeout, retries, pause, keyboard, touch and emulated standard Gamepad input,
  held-button protection, both challenges, physical return, four saved sheep,
  four sheep recordings, uploaded roar playback, one victory and maze transition.
- Cover check passed at 1280×720, 1366×650, 1180×820 and 844×390: large desktop
  reference typography, large reachable buttons over the sheep, nine cover sheep,
  left-facing David, and Arabic. See `qa/cover-size-1.10.0.json`.
- **Full-story regression passed:** all five missions and story bridges completed
  through actual inputs in approximately 95 seconds. Exactly five victory
  recordings, one background loop, four sheep calls, the supplied roar, one staff
  contact cue, three bundled guidance clips and the final giant impact were heard
  by the audio-start instrumentation. See `qa/story-1.10.0.log` and
  `qa/story-result.json`.
- Actual-game evidence: `qa/99-lion-*.png` and `qa/99-cover-restored-*.png`.

Game models and mechanics for maze, armour, brook and sling are unchanged. Shared
Canvas camera transforms are applied only during this sheep encounter; shared
sound changes add only the supplied roar/staff cue. UI input and focus handling
are scoped to sheep, and the cover-only layout correction does not resize other
activities. Previous validation is retained under `docs/VALIDATION_1_9_3.md`.

## Limits and preview

Browser tests use Chromium with keyboard, native touchscreen gestures and an
emulated standard Gamepad API. A physical controller and physical Safari/iOS or
Android hardware were not available. Browser policy blocks direct file://
navigation; self-contained production HTML is streamed from local disk over
loopback, then networking disabled before all encounter/cover interactions.
Extract the offline ZIP, open index.html and tap/click to enable audio. Editable
source: npm ci, npm run dev. Checks: npm test, npm run build;
node scripts/lion-encounter-check.mjs; node scripts/cover-size-check.mjs.
