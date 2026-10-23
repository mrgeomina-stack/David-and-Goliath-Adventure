# Joystick update test report

The right-side concentric-circle controls are integrated into the actual five
activities, with single-tap nearby sheep lifting. No artwork or sound files,
collision shapes, time limits, movement speeds, victory logic or sling ballistics
were replaced. Existing Cloudflare/Wrangler configuration is unchanged.

Passed:

- 67 automated tests across 13 files, including target-specific nearby pickup,
  unchanged pickup reach, dead zone and normalized diagonal steering.
- Native Chromium touch at seven phone/tablet sizes, with 44px minimum targets.
- All five joystick interactions: physical sheep delivery; real maze completion;
  cursor pickup, rejected wrong armour placement, four correct drops and collapse;
  five unique timed stones; cancelled charge and genuine sling collision.
- Independent fingers, touch cancellation, pause reset, rotation, retained direct
  armour dragging, direct stone taps and action-button hold/release.
- Complete five-level story offline in 135.475 seconds using real input events
  and read-only solver feedback; both interludes, five celebration recordings,
  original armour crash and corrected giant fall remained intact. This is automated
  validation, not a child/classroom difficulty study.
- Optional PWA caching, interrupted download/retry, offline joystick maze, waiting
  update, accepted reload and retained keepsakes.
- Final brook layout at seven sizes leaves kneeling David unobstructed. Transparent
  target marker leaves stones/ring visible; native timed pickup succeeds.
- Standalone production HTML with networking disabled: included bilingual fonts,
  1920/1024 scaled touch, language switching, sound, focus cancellation and pointer
  release outside the held action button. Direct file:// launch is blocked by the
  cloud browser policy; this test serves that same disk-backed HTML over loopback
  and disables networking before gameplay.
- Both production builds and both ZIP CRC checks; Cloudflare folder matches its
  archive byte for byte, with 141 files and largest asset 3,884,313 bytes (<25 MiB).

The transparent hand and brook placement received a final targeted visual/native
input check after the full story test; the game models were unchanged by that
visual adjustment. Earlier screenshots are replaced with current mobile captures.

Physical iPad/iPhone Safari and Android checks remain to be done. Tests use native
emulated touch in Chromium and do not claim physical-device certification.
