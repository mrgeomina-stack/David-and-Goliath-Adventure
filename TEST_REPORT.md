# David’s Big Adventure — living cover flock · 1.9.3

23 October 2026. Baseline `2174d40f3ff5bba52b586f98dc4b3255b97ff590`.
The cover now has nine larger wandering sheep, with the supplied walking frames,
individual paths, gentle footfall bob, soft turns, ground shadows and dynamic depth
sorting around David. David and his staff face left. Desktop title spacing leaves
room for the flock while retaining all labels and actions. No new engine, CDN,
bitmap art or runtime dependency was added; rendering uses the existing Phaser/
Canvas pipeline. Sheep keep the same appearance when stopping to idle.

## Verification

- TypeScript and production/offline build passed.
- 48 unit tests passed. Two new tests cover 120 seconds of bounds, clear space,
  nine actors, minimum turning width, continuous movement, both walking directions,
  depth transitions and left-facing David.
- Cover browser check passed with networking disabled, nine moving actors,
  correct depth layers, left-facing David, a single background loop, reachable
  actions at desktop/tablet/phone sizes, and four rescue sheep on mission entry.
  Desktop/phone captures and the large Arabic-only heading were reviewed after softening turn widths and
  clearing the menu from the meadow. A fresh recording captures this final build.
- Music/UI regression passed: quiet loop, narration ducking, music/global mute,
  exactly one pop for mouse/touch/keyboard controls, paused menus and disabled states.
- Actual-browser results are recorded in `qa/title-flock-1.9.3.log` and
  `qa/title-flock-1.9.3.json`, with music/UI regression in
  `qa/music-ui-1.9.3.log`.
- Actual-game cover captures: `qa/98-title-flock-desktop.png`, walking capture,
  Arabic-only cover, and 1180×820, 844×390 and 667×375 tablet/phone captures. Motion preview:
  `qa/98-title-flock-motion.webm` (recorded from the actual game, not a mockup).
- Game models, maze, collision rules, timers, rescue count, difficulty, progression
  and sound design are unchanged. Cover-to-rescue navigation checks that only four
  gameplay sheep spawn, and the existing offline music remains active.
- Previous all-five-level, audio, PWA and offline-relaunch checks are retained as
  1.9.2 baseline evidence in `docs/VALIDATION_1_9_2.md`; not claimed as rerun here.

## Preview and limits

Extract the offline ZIP and open index.html. Tap or click to start the music.
Editable source: npm ci, npm run dev. Validation: npm test, npm run build.
Run `node scripts/title-flock-check.mjs` for the cover check; set
`RECORD_TITLE_VIDEO=1` to record it (requires Playwright's FFmpeg, or a configured
system FFmpeg). The supplied animation artwork remains editable via the manifest.

Chromium automation is available here. Physical Safari/iOS and Android hardware
have not been tested. Browser policy blocks direct file:// navigation, so the
production HTML is loaded from local disk over loopback and networking disabled
before interactions. No external host is allowed during this check.
