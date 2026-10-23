# David’s Big Adventure — background music and UI sound · 1.9.2

23 October 2026. Baseline `0dd469544f8956a9f7b15030d39c7d378bdb7763`.
The supplied music replaces the generated melody and loops quietly across the game,
with narration/victory ducking. UI buttons now pop across mouse, touch, keyboard and
paused menus. Gameplay, visuals, objectives, timers and collision geometry remain.

## Validation

- TypeScript and production/offline build passed.
- 46 unit tests passed, including music lifetime across mission cancellation,
  music/global mute controls, speech/victory mixing and stale local-voice callbacks.
- **Six focused browser checks passed:**
  - Full story: all five genuine mission wins in about 84 seconds; exactly one
    background source throughout, five victory recordings, four sheep calls,
    three narration clips and the giant impact. The 58-second track loops into
    the final screen without restarting between chapters.
  - Music/UI: correct recording decoded, first-gesture landing playback, 0.14
    normal gain, 0.035 guidance duck/restore, independent music/global mute,
    one pop per mouse/touch/keyboard activation, held action/directional buttons,
    dynamic pause/teacher buttons, silent disabled buttons and phone landscape.
  - PWA: failed-cache retry, actual service-worker offline reload, real offline
    maze win, new offline tab, update activation and keepsake persistence.
  - Sling: weak/strong misses, genuine collision, once-per-landing impact,
    pause/resume, replay and mute.
  - Arabic audio/brook: bundled offline guidance, pause/mute, touch collection,
    jagged rejection, five unique stones and one victory recording.
  - UI/offline: bundled bilingual fonts, scaled touch at 1920/1024, EN/AR,
    sound unlock/mute, focus cancellation and captured sling release.
- Evidence: `qa/story-1.9.2.log`, `qa/music-ui-1.9.2.json`,
  `qa/pwa-1.9.2.log`, `qa/landing-1.9.2.log`, `qa/audio-brook-1.9.2.log`,
  `qa/offline-1.9.2.log` and `qa/unit-1.9.2.log`.
- Offline HTML tests stream the large local HTML over loopback to avoid the
  browser-debugger's large route.fulfill/base64 payload limit, then disable
  networking before all interactions. No external hosts are allowed. PWA tests
  additionally verify cold offline launches from the actual saved cache.
- The supplied MP3 is preserved byte-for-byte; SHA-256 provenance is recorded in
  `qa/music-provenance-1.9.2.json`. All game/audio dependencies are bundled locally.
- The earlier full 17-script regression is historical 1.9.0 evidence. This audio
  patch uses focused checks and the full-story test; previous reports are retained
  under `docs/VALIDATION_1_9_0.md` and `docs/VALIDATION_1_9_1.md`.

## Limits and preview

Browsers need a first user gesture before audible playback. Music starts with the
first tap, click or key press on the landing page. Pause freezes music; resume
continues the same loop. Global mute includes button feedback.

Chromium browser automation is available here; physical Safari/iOS and Android
hardware have not been tested. Managed-browser policy blocks direct file://
navigation, so self-contained production HTML is exercised with networking disabled.
Extract the offline ZIP before opening index.html on your computer. For editable
source: npm ci, then npm run dev; npm test and npm run build validate the project.
