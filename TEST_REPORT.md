# David’s Big Adventure — validation report · 1.6.1

20 October 2026. This release fixes the disconnected David rendering using one cohesive painted
character and textured limb animation across the existing five-level game and
cover. The supplied visual-assets-v1 integration remains intact. The gameplay model is unchanged from the
previous release `d3a3c28`; controls, story order, scoring, collision rules, maze
generation, retries, timings and bilingual editable text remain intact.

## Build and automated checks

Linux x64, Node 24.19.0, npm 11.9.0; Phaser 3.90.0, TypeScript 5.9.3,
Vite 7.3.1, Vitest 4.0.18 and Playwright 1.58.2. System Chromium 154,
headless Canvas. Tests use keyboard, pointer and native emulated touch inputs.
Logical resolution: 1280×720. Phone/tablet viewports include 568×320, 667×375,
844×390, 915×412, 1024×768, 1180×820 and 1366×1024; desktop 1280×720 and
1920×1080; phone portrait 390×844.

| Command / check | Result |
| --- | --- |
| `npm run build` | Typecheck and production offline/PWA build passed. |
| `npm test` | 36 tests passed, no failures or skips. |
| `npm run test:browser` | 13 passed in the full run; the offline input check passed its targeted rerun after replacing a fixed-delay assertion with an actual shot-outcome wait. All 14 final outcomes are recorded in `qa/browser-final-results.json`; the original run is retained in `qa/browser-results.json`. |
| `node scripts/import-visual-assets.mjs` | 64 valid candidates, 24 absent optional effect frames, one quarantined damaged background, zero ambiguous/invalid active files. |
| ZIP integrity | Packaging validates CRC; final archive verification compares playable HTML with the tested build. |

The runner starts its own server at port 4174 and uses two browser workers.
Set `BROWSER_WORKERS=1` for sequential execution; do not run two copies at once.
The read-only QA inspector cannot move actors, equip armour or force a win.

Four added character-skin tests verify bind-pose identity, connected elbow/hand
anchors during reach, finite overreach and continuous bending through a joint.
The character browser check captures actual game actions and verifies a real
sheep lift, stone collection and ballistic hit. Artistic quality is reviewed from
screenshots; automated state checks alone cannot judge a drawing. The short
headless frame samples measured approximately 52–60 fps across the five missions
in this run (`qa/visual-results.json`); this does not certify sustained physical
device performance.

## Gameplay exercised

- **Sheep:** Four distinct sheep, nearby-only pickup, actual lift/carry/set-down
  through the pen opening, keyboard and multi-touch carry. Distant pickup is
  rejected. Easy/Normal remain 40 seconds; warnings, pause, lion catch and fresh
  retry are exercised with the actual game clock. Free Play remains untimed.
- **Maze:** Connected seeded 9×7 graph, actual wall rejection, real-input route,
  hints, scaled touch/swipes and four-second celebration. David walks with one
  separate basket. Shared support changes to brother ownership after David lets
  go; the receiver's baked basket is masked to prevent duplicates.
- **Armour:** Actual pointer/finger drags, wrong-zone return, cancelled drag,
  separate body attachment anchors, no payoff at 3/4; all four correct drops
  trigger the 6.5-second step/wobble/gentle fall, helmet slip, visible removal and
  recovery. Helmet back/front layering keeps David's eyes visible.
- **Brook:** Jagged rejection, tap and timed SPACE inputs, five unique IDs,
  cooldown, kneeling hand-to-water and pickup-to-pouch motion. Exactly five
  smooth stones unlock completion; scenery rocks do not count.
- **Sling:** Short/overpowered throws genuinely miss; hold/release produces a
  real ballistic object, and swept forehead collision triggers the reaction.
  Pause in flight and focus cancellation are exercised. No trajectory correction.
  The drawn forehead is `(1000,259)` and the fixed launch is `(184,513)`;
  `v1-integration-results.json` compares actual drawn/model projectile positions.
- **Flow:** Real-input sheep → maze → walk toward Goliath / return to Saul →
  armour → brook → sling → victory, plus practice return, replay, restart and
  persistent earned keepsakes. Automated solver feedback measures no child play
  time; see `qa/story-result.json` for the actual automated run duration.
- **UI/mobile:** English/Arabic/bilingual layouts, colourful instruction bounds,
  native emulated touch, multi-touch, rotation pause/resume, screen fit,
  music/voice toggles, mute/unlock, focus pause and release outside controls.

## Artwork audit

All seven supplied documents were read and retained unchanged. The source ZIP
includes every supplied PNG. 92 of 93 decode fully. The meadow background
`level01_shepherd_hills_1920x1080.png` fails IDAT CRC/full decoding and is retained
unchanged but excluded from the runtime; the existing meadow remains.
Four new backgrounds, 56 candidate sprites and four UI images load successfully.
Missing 24 optional effect frames use the existing procedural effects.
28 provisional David frames do not replace better existing animations.
David now uses one new 1024×1536 illustration made from the supplied design.
His face, neck, torso, hands, clothing and legs share one painted material and
continuous textured rig. The head/torso are connected, limbs bend without
separating cutouts, and hips/gear follow the torso through crouch and recovery.
The cover uses the same rig. See `docs/DAVID_CHARACTER_RIG.md`.

Uniform scaling and pixel pivots are used. Goliath's forehead is fitted to the
existing collider, stones retain their model centers, armour retains its drop
regions, and maze-wall texture is clipped within original geometry.
`docs/VISUAL_ASSETS_V1_PROGRESS.md` records per-level keep/enhance/replace choices.
Source art is unchanged; masks, crops and layers are implemented in rendering code.

## Offline evidence and limits

`dist/index.html` embeds classic JavaScript, CSS and gameplay artwork. There are
no runtime module imports, CDNs, accounts, external fonts or asset fetches.
Networking-disabled runtime checks exercise the self-contained HTML. The actual
service-worker check separately caches the hosted game, disconnects networking,
reloads, completes a real maze offline and tests new-tab offline relaunch. Partial
cache failure never claims readiness; retry and controlled updates preserve
keepsakes. File mode skips PWA registration; installation requires HTTPS.

The final direct `file://` launch was attempted with networking disabled. Managed
Chromium blocks it with `ERR_BLOCKED_BY_ADMINISTRATOR`: **blocked, not passed**.
No browser policy was changed. Direct disk launch still requires rehearsal on the
recipient's computer. The offline HTTP test does not certify that launch method.

## Actual-game visual evidence

`qa/baseline-v1/` contains five pre-art screenshots; `qa/david-before/` records
the prior mixed-material David. Current representative
screenshots are packaged with JSON results in `Davids_Big_Adventure_QA.zip`:

| Evidence | Files |
| --- | --- |
| New cohesive David across cover, gait, carry, phone, kneel and throw | `75-david-cohesive-cover.png` through `83-david-cohesive-release.png` |
| Integrated title and five activities | `67-v1-title.png` through `72-v1-sling.png` |
| Forehead / fixed launch overlay and genuine reaction | `73-v1-forehead-release-alignment.png`, `74-v1-goliath-reaction.png` |
| Basket carry, shared support, receiver ownership | `63-food-carried-walk.png` through `65-brother-holds-basket.png` |
| Armour dressed, tumble, removal and recovery | `10-armor-dressed.png` through `13-armor-recovered.png` |
| Kneeling pickup / sheep lift and carry | `26b-brook-pickup.png`, `48-sheep-lift.png`, `49-sheep-carried.png` |
| Phone touch and cached offline play | `55-phone-maze-celebration.png` through `62-phone-brook.png` |
| Language and instruction layouts | `33-english.png`, `34-arabic.png`, `51-colourful-instructions.png` |

These are captures from the running game, not the asset inspector. The alignment
image adds a temporary read-only SVG overlay; ordinary screenshots contain no
geometry debug marks. Full animation sequences are exercised by the tests;
single screenshots only show moments. Additional evidence remains in `qa/`.

## Unfinished acceptance work

- Physical iPhone/iPad Safari and Android Chrome, Home Screen installation,
  notch/safe-area behavior and sustained device performance need hardware tests.
  WebKit installation was blocked by HTTP 403 on the official mirrors; Safari
  execution was not performed. Chromium emulation does not certify Safari.
- Direct Windows/macOS disk launch is unverified because of the cloud browser's
  policy block. Target-laptop fullscreen and speaker testing remain.
- Supervised child usability/difficulty/timing sessions have not been conducted.
  Native-speaker Arabic review, human art/animation approval and narration quality
  remain acceptance tasks. No child observations or platform results are invented.
- One damaged meadow background and missing optional FX are explicitly retained
  as fallback decisions, not represented as completed supplied artwork.

## Preview and deliverables

Use Node 22.12+; run `npm ci`, then `npm run dev` and open the printed address
(default localhost:5173). For the tested production version: `npm run build`,
then `npm run preview -- --port 4173`. `npm run package` regenerates offline,
web, editable-source and focused screenshot/QA ZIPs. The web package can be hosted
on any static HTTPS host; see `docs/MOBILE_PWA.md`. No site was published here.
