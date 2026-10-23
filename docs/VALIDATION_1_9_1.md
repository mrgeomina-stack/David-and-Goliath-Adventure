# David’s Big Adventure — celebration and landing patch · 1.9.1

23 October 2026. Baseline `c60ab7493580750cb633d708375e64c50b365ff8`.
Removed the unrelated adult figure from the sheep success drawing. Added a locally
synthesized, layered giant ground impact at the supplied animation's landing frame,
followed by the existing victory recording. Gameplay geometry and objectives are unchanged.

## Validation

- TypeScript and production/offline build passed.
- 44 unit tests passed, including impact buffer headroom, decay, reuse, cancellation,
  mute and pause checks.
- Offline landing browser check passed: real weak/strong misses, genuine hit, pause
  before landing, impact at 1.0s, victory at 1.65s, one impact per run, new-run reset,
  muted on-screen hold/release and no stale impact on unmute.
- Sheep/brook browser check passed: four real carries, keyboard/touch lifting,
  physical pen entry, distant pickup rejection, jagged rejection and five unique stones.
- Disconnected production UI check passed: no external gameplay asset requests,
  bilingual bundled fonts, 1920/1024 scaling, touch, focus cancellation and mute.
- Actual-game screenshots: `qa/97-sheep-celebration-no-extra-character.png` confirms
  David and all four sheep without the adult; `qa/96-giant-ground-impact.png` captures
  the landing. Visual alignment reviewed.
- Results: `qa/landing-1.9.1.json`, `qa/landing-1.9.1.log`,
  `qa/sheep-brook-1.9.1.log`, `qa/offline-1.9.1.log`, `qa/unit-1.9.1.log`.
- The 17-script full regression results from 1.9.0 are historical baseline evidence;
  this patch uses focused regression checks. See `docs/VALIDATION_1_9_0.md`.

## Limits

Browser automation uses Chromium. Physical iPhone/iPad Safari and Android devices
have not been tested here. Managed-browser policy blocks direct file:// navigation;
the self-contained production HTML is exercised with browser networking disabled.
Extract the offline ZIP before opening index.html on your computer.
