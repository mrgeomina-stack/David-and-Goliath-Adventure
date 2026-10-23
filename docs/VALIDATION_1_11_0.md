# David’s Big Adventure — fifth lamb, continuous ring and effects · 1.11.0

23 October 2026. Baseline `7fc009020ab233143005e6c8442f4d05c4e9af91`.

## Changes

- Four regular sheep must physically enter the pen within the existing 30-second
  deadline. Only then does a fifth lamb appear for the existing lion mini-boss.
  The counter changes from /4 to /5. The checkpoint freezes the countdown and
  preserves four safe sheep through unlimited retries. Both timing successes and
  the fifth lamb's physical return are still required. Free Play stays untimed.
- The brook ring moves continuously at the existing 320/410 px/s, consuming the
  remaining travel budget immediately after each waypoint. No arrival pause or
  automatic pickup remains. SPACE and touch/mouse taps require ring proximity;
  missed attempts leave stones available for another pass. Existing random layout,
  shuffled routes, 58px pickup radius, 0.4s cooldown, kneeling animation and exactly
  five unique smooth pickups are preserved. Instructions/hints remain editable in
  English and Arabic and explain the timing rule.
- Every actual sling release plays a 0.48-second air whoosh/string snap, including
  misses. It replaces the generic pitched launch cue. Projectile physics and real
  head collision are unchanged.
- David's armour ground contact at fallTime 2.8s plays one 1.55-second body thud
  with staggered metallic crashes/rattle. The four correct drops, struggle,
  tumble, gear removal and recovery are unchanged. Effects are generated/cached
  locally, share mute/pause/cancellation and require no network dependency.

The large cover UI, nine decorative sheep, left-facing cover David, other levels,
30-second activity timers and existing supplied music/voice/recordings are retained.

## Validation

- **55 unit tests passed** across 10 files. New checks cover four-rescue admission,
  one fifth lamb, five safe sheep, no waypoint dwelling or discarded travel,
  missed off-ring taps, five unique pickups and real ring pickup reachability for
  100 seeds within the countdown. Audio tests check non-silent finite bounded
  waveforms, durations, reuse, cancellation, mute and pause.
- TypeScript and production/offline build passed.
- Dedicated offline lion browser check passed: four physical deliveries, fifth
  lamb, early miss, timeout, unlimited local retries, keyboard, touch and emulated
  standard Gamepad, held-button protection, pause, both green windows, safe pen
  return, five sheep recordings, one victory and transition to the maze.
- Armour browser check passed: wrong-zone reset, 3/4 gating, four real drags,
  no premature crash, exactly one landing crash, removal and recovery.
- Sling browser check passed: underpowered and overpowered misses, real head hit,
  flight pause/resume, victory, exactly three release whooshes for three throws.
- Offline 844×390 touch check passed: Arabic fallback guidance, pause/mute,
  supplied recording decoding, moving ring, jagged/off-ring rejection, five timed unique
  touch pickups and one completion recording.

- Full-story regression passed through real inputs: all five missions and story
  bridges in 97 seconds, four timed deliveries plus fifth-lamb encounter, real
  maze route, four armour drops, five ring-timed SPACE pickups, ballistic hit and
  final victory. Audio-start instrumentation recorded five sheep lifts, five
  completion recordings, one armour crash, one release whoosh, one giant landing,
  three guidance clips and one persistent background music loop. The scripted
  route uses simultaneous arrows within the existing movement rules; this is
  automation timing, not a measured child completion time.

See `qa/*-1.11.0.log`, `qa/lion-encounter-1.11.0.json`,
`qa/audio-brook-results.json` and actual-game screenshots `qa/99-lion-*.png` and
`qa/10-armor-dressed.png` through `qa/13-armor-recovered.png`.
Previous release validation is preserved in `docs/VALIDATION_1_10_0.md`.

## Preview and limits

Extract the offline ZIP completely and open index.html. Tap/click once to enable
sound. For editable source use npm ci, npm run dev. Checks: npm test, npm run build;
GAME_URL=http://localhost:4179/ node scripts/lion-encounter-check.mjs (the focused
lion check loads the local production HTML itself); other checks accept GAME_URL.

Chromium tests use keyboard, native touch gestures and an emulated standard
Gamepad API. Physical iOS/Android devices and a physical controller were not
available. Direct file:// navigation is blocked by the cloud browser: offline
checks load the self-contained production HTML from local disk over loopback,
then disable networking before gameplay. Actual double-click launch should be
rehearsed on the classroom device. No child playtesting or subjective listening
on classroom speakers has been conducted; automated audio checks verify waveform
and real source starts, not perceived loudness or sound quality on every device.
