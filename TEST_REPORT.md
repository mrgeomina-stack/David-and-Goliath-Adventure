# David’s Big Adventure — validation report

Date: 19 October 2026. This is a playable five-mission implementation with original
procedural artwork, not a claim of completed human classroom acceptance testing.

## Environment and commands

- Linux x64, Node 24.19.0, npm 11.9.0; TypeScript 5.9.3, Phaser 3.90.0,
  Vite 7.3.1, Vitest 4.0.18, Playwright 1.58.2.
- System Chromium 154.0.8037.57, headless, software Canvas rendering.
- Keyboard, mouse dragging and emulated touchscreen inputs; logical 1280×720.
- Physical viewports: 1280×720, 1920×1080, and letterboxed 1024×768.
- No cloud services, accounts, tokens or external game assets are required.

| Check | Observed result |
| --- | --- |
| `npm test` | **15 passed**, 0 failed, 0 skipped. |
| `npm run build` | Typecheck and Vite production build passed; single-file offline HTML produced. |
| `npm run test:browser` | All six browser scripts passed against the production distribution. Results: `qa/browser-results.json`. |
| Final targeted armour check | Passed after distinct head/chest/waist zones were tightened. |
| Final targeted sheep/brook check | Passed after celebration drawing refinements. |
| Final `node scripts/ui-offline-check.mjs` | Passed on the final self-contained HTML with networking disabled. |
| `GAME_URL=http://localhost:4173/ node scripts/timeout-check.mjs` | Passed: 101 seconds of simulated browser time yielded a gentle retry, no auto-win, and a clean reset. |
| ZIP packaging | CRC and extracted-entry comparisons checked by the packaging script and final verification. |

The browser suite starts an HTTP server on port 4174 and closes it afterwards.
Targeted HTTP checks use a running `npm run preview -- --port 4173` instance.
`CHROMIUM_PATH` can select another installed Chromium executable. The optional
timeout test advances the browser clock while exercising the actual game loop;
it does not inject a win, move characters or alter the model.

The complete six-script run was followed by targeted checks for the final anatomy,
localization and celebration refinements. No failing required automated check
remains. Direct-file/platform/human checks below remain unverified.

## What was exercised

- **Maze:** 200 generator seeds; connected tree graphs with unique solutions,
  branches/dead ends and 16–22-step routes. Real keyboard navigation to the goal,
  harmless wall rejection, arrival gating, intermediate movement and four-second
  visible handover. The solver is used by tests and the one-step Hint, never to
  move David automatically.
- **Armour:** Real pointer drags, a visible piece during dragging, invalid drop
  return, correct separate anchors, three-piece non-completion, all four pieces,
  one 6.5-second step/wobble/gentle fall/helmet-slip/removal/recovery sequence.
  Extra unit assertions reject sword-on-chest, tunic-on-waist and helmet-on-torso.
- **Sling:** Short and overpowered shots genuinely miss; a centered charge hits
  through swept collision against the visible upper head. Analytic trajectories
  agree at equal times at 30/60/120 fps. The tested hit window is 0.3–0.5 seconds.
  Pause during flight preserves launch power; loss of focus cancels windup.
  Pointer capture supports release outside the hold button. No midair correction.
- **Sheep:** Distant calls fail, nearby calls initiate following, David guides
  both through the physical gate, and only actual pen entry scores. Unit checks
  cover fences, harmless lion startle/retreat and no premature victory.
- **Brook:** Both direct tapping and moving-ring + SPACE collection tested.
  Jagged stones and misses do not score, pickups are unique, and exactly five
  unlock completion. The full-story run used timed SPACE pickups for all five.
- **Flow:** A real-input run completed sheep → maze → walk toward Goliath to hear
  him → return to Saul → armour → brook → sling → victory. The QA inspector only
  reads state and cannot force success, move characters or equip items.
- **UI:** Language modes and equipment labels, scaled touch anchors, pause/replay,
  restart, sound unlock/suspend, focus cancellation and muted continuation.
  Original Web Audio cues were scheduled without runtime errors; no human
  listening/speaker test was performed.

The recorded optimal automated story run took **65.827 seconds** (`qa/story-result.json`).
It used a solved maze route and position feedback. This is **not** a six-year-old’s
play time or evidence of a typical five-minute classroom session.

## Offline evidence and its limits

`dist/index.html` embeds the classic JavaScript bundle and CSS; artwork is drawn
locally and sound is synthesized locally. It has no runtime module imports, CDNs,
fetch dependencies, accounts, service workers or external font requirements.

The final HTML was supplied as the initial document using Playwright routing with
browser networking disabled. It started, accepted inputs, rendered and played a
successful sling attempt without any external asset requests or page errors.
This demonstrates a self-contained runtime, **not** a direct `file://` launch.

The installed browser is managed: its URL policy blocks `file://`, returning
`ERR_BLOCKED_BY_ADMINISTRATOR`. That direct-file check was **blocked**, not passed.
No browser policy was bypassed or modified. Double-click launch in Windows Chrome
and Edge still needs a rehearsal. Fullscreen is also restricted by this managed
browser; use the target laptop to verify the fullscreen button or F11.

## Visual evidence

39 actual PNG screenshots are in `qa/` and included in the offline ZIP. They cover
starts, gameplay, mistakes and completion across all five missions. Representative
start, interaction and payoff images were inspected visually, including:

| Evidence | Files |
| --- | --- |
| Title and maze navigation | `01-title.png`, `02-maze-start.png`, `03-maze-wall.png`, `04-maze-middle.png` |
| Food delivery | `05-maze-handover.png`, `06-maze-success.png` |
| Dragging and armour mistakes | `07-armor-start.png`, `07b-armor-dragging.png`, `08-armor-wrong.png`, `09-armor-three.png` |
| Fully dressed, falling, removal and recovery | `10-armor-dressed.png`, `11-armor-fall.png`, `12-armor-removal.png`, `13-armor-recovered.png` |
| Physics misses, flight, hit and victory | `14-sling-start.png` through `20-victory.png` |
| Sheep following and pen completion | `21-sheep-start.png` through `24-sheep-success.png` |
| Brook error, airborne pickup and completion | `25-brook-start.png`, `26-brook-jagged.png`, `26b-brook-pickup.png`, `27-brook-success.png` |
| Interactive giant encounter / full story | `28-encounter-start.png` through `31-story-victory.png` |
| Scaled touch and languages | `32-touch-1920.png`, `32-touch-1024.png`, `33-english.png`, `34-arabic.png` |
| Genuine timeout/retry | `35-sheep-gentle-retry.png` |

Snapshots show moments in animations, not substitute animations. The full sequences
were also exercised by the browser tests. Screenshots are generated by automated
headless gameplay, not claimed as human hands-on classroom play.

## Remaining acceptance work

- Direct Windows `file://`, Chrome/Edge compatibility and actual tablets.
- Speaker sound quality, native-speaker copy review and back-of-class readability.
- Human difficulty/play-time calibration, operator rotation and touch comfort.
- Sustained frame-rate measurements on the intended classroom laptop.
- Final commissioned illustration review, if desired: current art is original,
  editable procedural Canvas illustration. Replacement rig/asset requirements are
  documented in `docs/IMPLEMENTATION.md`.

All five core game mechanisms are implemented. The evidence supports the tested
browser workflow; it does not certify final classroom readiness or the untested
platforms above.
