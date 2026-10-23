# Cloudflare Pages / mobile preparation test report

Date: 23 October 2026. Existing gameplay/graphics baseline: `821ef38`.
Final folder: **141 files**, largest **3,884,313 bytes (3.70 MiB)**; zero files
above the 25 MiB limit. Upload archive CRC and byte-for-byte folder contents
verified. No public deployment was performed. Tests use the real production web bundle
served from disk over loopback HTTP, not an asset inspector or simulated slides.

## Verified

- `npm test`: **64 tests across 12 files passed** (maze connectivity/collisions,
  four timed sheep deliveries and fifth-lamb encounter, stone collection, armour,
  narration/audio, timer, mobile coordinate mapping and Goliath's forward fall).
- `npm run build:pages`: TypeScript and Vite succeed. Local JavaScript, CSS,
  fonts, recordings and illustrations are emitted as separate static files.
  The build rejects any file larger than **26,214,400 bytes (25 MiB)** and any
  deployment above 20,000 files. The packaging step additionally checks the
  dashboard's conservative 1,000-file upload ceiling and ZIP integrity.
- `scripts/mobile-check.mjs` against the web build: native Chromium touch input
  at **568×320, 667×375, 844×390, 915×412, 1024×768, 1180×820 and 1366×1024**.
  Navigation and 44 CSS-pixel controls fit; real maze swipes/arrows and delivery
  celebration work; correct/incorrect armour drops and gesture cancellation work;
  multi-touch movement/lift delivers sheep physically; portrait pauses and
  landscape resumes; finger sling hold/release makes a genuine hit; jagged stones
  are rejected and five unique smooth stones are collected at the moving ring.
- `scripts/story-check.mjs` with `GAME_OFFLINE_OPT_IN=1`: the entire **five-level
  story passed with networking disabled** in 136.491 seconds, using real keyboard,
  mouse and touch inputs. Four regular sheep plus the fifth-lamb lion rescue,
  both animated interludes (including bilingual phone captions), real maze food
  transfer, return to Saul, all four armour pieces and collapse, five unique
  timed stone pickups, genuine sling hit and final victory all completed. Five
  completion sounds, one sling release and one giant impact were observed; bundled
  speech played without installed voices. No page errors. This is automated
  solver-assisted validation, not a classroom/child timing study.
- `scripts/sling-check.mjs`: underpowered and overpowered throws miss; ideal
  ballistic collision wins; pausing freezes flight; one whoosh per release.
- `scripts/pages-layout-check.mjs`: existing large cover retained at full and
  short desktop/tablet sizes; readable Arabic cover; nine sheep and left-facing
  David preserved; decorative art does not intercept the CTA buttons.
- `npm run test:pages`: **optional** offline saving (no worker or offline cache
  before the explicit choice), manifest/maskable icons, subdirectory scope,
  interrupted asset download does not claim readiness, manual retry, complete
  asset cache, offline reload, real offline maze success, offline new-tab launch,
  keepsake persistence, waiting update without interruption, explicit acceptance,
  old-version cleanup and retained keepsakes. **Zero external runtime requests**
  and zero page errors were observed.

The existing interlude test checked bounds immediately after changing viewport
size. It now waits for the browser's responsive resize to finish before measuring
and for the Continue button's normal DOM update before tapping;
no gameplay, layout design or interlude animation was changed for that correction.

## Preserved

Only `src/main.ts` (offline UI wording and optional startup) and `src/pwa.ts`
(availability/remembered opt-in) changed in game runtime code. Responsive fitting,
safe-area handling, gesture capture, collision geometry, all five mission models,
30-second challenges/untimed Free Play, difficulty, original character animations,
the corrected Goliath defeat, artwork files, audio files, bilingual story content,
scoring and victory transitions are unchanged. No production dependency was added.

The normal standalone `npm run build` path remains separate. Its deliberately
large embedded HTML should not be uploaded to Cloudflare Pages.

## Environment and remaining device checks

Automated browser coverage uses installed **Chromium with native emulated touch**.
It is not a physical iPhone/iPad/Android test or a Safari certification. Before
classroom rollout, check current iOS Safari and Android Chrome on actual devices:
rotate, drag armour, make a sling throw, hear audio after a gesture, install to the
Home Screen, save offline inside that installed app, then reopen in airplane mode.
Safari installation UI, orientation locking and storage eviction are controlled
by the device/browser. Cloudflare account creation, production upload and live
headers were deliberately not exercised because public deployment requires your
approval.

Detailed machine-readable results and actual-game screenshots are under
`qa/pages/`. The upload folder's exact inventory and limits are in
`pages-dist/build-report.json`.
