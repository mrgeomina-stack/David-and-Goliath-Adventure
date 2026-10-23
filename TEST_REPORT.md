# David’s Big Adventure — animated story interludes · 1.12.0

23 October 2026. Baseline `f2f7d0a2dfe92a7b0d878844796a89a1460fa473`.

## Delivered

Two story-only stages connect the existing activities. After the sheep success
celebration, Jesse gives David food, asks him to visit his brothers at the army
camp and bring news, then waves him off (1 Samuel 17:17–20). Four supplied poses
have directed camera motion, subtle connected basket/hands motion, drifting seeds
and clean cuts without doubled faces. After the maze's actual basket transfer and
celebration, Goliath appears alone in the foreground. His continuous painted mesh
lifts alternate feet and stomps twice with synchronized thuds, ground dust and
camera response. Low mocking laughter and torso/head movement lead into the
challenge, with close-ups from the supplied artwork. David then returns to Saul's
tent to volunteer; the redundant extra walk-right/hear challenge is removed.

Editable English/Arabic captions use the bundled fonts and intentional directions.
Installed local voices remain preferred; four bundled synthetic guidance clips
support offline play. Laughter ends before challenge guidance starts. Stories
pause timers, preserve rewards, support pause/mute, offer local Replay and wait
for Continue/SPACE after their animation (17s Jesse / 22s Goliath). Practice
chapters retain direct completion behavior. Reduced motion removes camera and
mesh movement while retaining the story. Source assets/hashes, generated
background/cutout derivatives and audio details are in docs/STORY_INTERLUDES.md.

All five activity models, 30-second deadlines/untimed Free Play, four-plus-fifth
sheep flow, actual maze collisions/basket ownership, four correct armour drops,
five unique ring-timed stones, sling trajectory/head hit and miss rules are
preserved. The landing layout, nine wandering cover sheep and existing music,
recordings, armour crash, sling whoosh and giant-fall impact remain intact.

## Checks

- **61 unit tests passed**, 11 files: five new story-timeline tests and one new
  sound test, plus all previous gameplay/audio/mobile/model checks. They verify
  shot/caption order, continue gates, two contacts/one laugh, narration separation,
  replay isolation and finite bounded cached sounds with mute/pause/cancellation.
- TypeScript and production/offline build passed.
- Full five-level playthrough passed offline through real controls with both
  interludes in 136.657 seconds (automated route, not child completion time).
  Focused story assertions cover early SPACE rejection, story replay, pause freeze,
  English/Arabic/bilingual blocks, 844×390 phone bounds, at least 44px touch button
  heights, unchanged activity timers, no extra victory recordings, exactly two
  stomp sources and one laughter source, keyboard and touch continuation, and the
  return-left/Speak transition to Saul and armour.
- PWA check passed: incomplete cache fails honestly, retry saves all assets,
  scoped install manifest/cache, actual offline reload and maze completion,
  offline new-tab launch/progress persistence, non-disruptive update activation
  and old-cache cleanup. See qa/pwa-1.12.0.log and qa/pwa-results.json.
- Cover regression passed at desktop, short desktop, tablet and phone sizes:
  large title/buttons, nine sheep, left-facing David, Arabic and foreground UI.

See qa/unit-1.12.0.log, qa/build-1.12.0.log, qa/story-1.12.0.log,
qa/interlude-jesse-1.12.0.json, qa/interlude-goliath-1.12.0.json and
qa/cover-size-1.12.0.log. Actual integrated-game captures are qa/100-jesse-*.png
and qa/100-goliath-*.png, including Arabic and phone examples. The QA ZIP contains
curated current screenshots plus test logs; older screenshots remain in the repo
and the separate UI Before/After ZIP. Previous report: docs/VALIDATION_1_11_0.md.

## Preview and limits

Extract the offline ZIP completely and open index.html. Tap/click to unlock audio.
Source preview: npm ci, npm run dev. Validation: npm test, npm run build;
GAME_URL=http://localhost:4179/ node scripts/story-check.mjs with a local production
server. The full-story check disables networking after loading bundled HTML.

Tests use Chromium keyboard and native touch gestures. No physical iOS/Android
devices or physical gamepad were available. The cloud browser blocks file://;
the bundled production HTML is loaded from disk over loopback, then tested with
networking disabled. Actual double-click launch should be rehearsed on the target
device. No child playtest or classroom-speaker listening session was performed.
Fallback speech and character laughter are synthetic; audio instrumentation checks
source starts and bounded waveforms, not voice acting or perceived quality on
all speakers. No runtime synthesis engine or external network service is shipped.
