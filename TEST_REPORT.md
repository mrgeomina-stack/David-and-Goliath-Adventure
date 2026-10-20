# David’s Big Adventure — validation report · 1.4

Packaged: 20 October 2026. Version 1.4 adds an illustrated chapter map, earned keepsakes, colourful instruction/celebration cards, a shared animated David rig, scenic depth, action particles, instrumental music, environmental sound and optional installed-local-voice narration. Timed sheep rescues use exactly 40 seconds, with an untimed Free Play option. Human child/classroom acceptance testing has not been conducted.

## Environment and commands

- Linux x64, Node 24.19.0, npm 11.9.0; TypeScript 5.9.3, Phaser 3.90.0,
  Vite 7.3.1, Vitest 4.0.18, Playwright 1.58.2.
- System Chromium 154.0.8037.57, headless, software Canvas rendering.
- Keyboard, mouse dragging and emulated touchscreen inputs; logical 1280×720.
- Physical viewports: 1280×720, 1920×1080, and letterboxed 1024×768.
- No cloud services, accounts, tokens or external game assets are required.

| Check | Observed result |
| --- | --- |
| `npm test` | **21 passed**, 0 failed, 0 skipped. |
| `npm run build` | Typecheck and Vite production build passed; single-file offline HTML produced. |
| `npm run test:browser` | All nine browser scripts passed against the production distribution. Results: `qa/browser-results.json`. |
| Visual/touch check | EN/AR title layouts, widescreen/tablet bounds, full maze solved by brief touchscreen taps, cinematic and replay. |
| Sheep/brook browser check | Included in the complete production browser suite. |
| Final `node scripts/ui-offline-check.mjs` | Passed on the final self-contained HTML with networking disabled. |
| Countdown/catch | Current Normal-mode countdown, pause, 30s/15s warnings, lion catch, clean retry and untimed label exercised with the actual browser clock. `qa/sheep-countdown-results.json`. |
| Premium presentation | Illustrated map at three viewports, colourful card bounds, real completion earns a keepsake, persistence after reload, music/voice controls, book pause/resume and the playtest guide. `qa/premium-results.json`. |
| ZIP packaging | CRC and extracted-entry comparisons checked by the packaging script and final verification. |

The browser suite starts an HTTP server on port 4174, runs two independent browser workers, and closes it afterwards. `BROWSER_WORKERS=1` selects sequential execution.
Targeted HTTP checks use a running `npm run preview -- --port 4173` instance.
`CHROMIUM_PATH` can select another installed Chromium executable. The countdown
test advances the browser clock while exercising the actual game loop;
it does not inject a win, move characters or alter the model.

The complete nine-script production run covers the visual upgrade and short
touch-press handling. No failing check remains in that run. The countdown/catch test now validates the current rescue rules. Direct-file/platform/human checks
below remain unverified.

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
- **Sheep:** Four separate lifts and physical carries to the pen via keyboard and emulated tablet touch; lift animation progresses before walking, one sheep at a time, no distant pickup, no following shortcut. Thirty seeded model routes rescue all four within the 40-second limit. Actual countdown warnings, pause, lion pursuit after zero, catch and retry are exercised by the timeout browser check.

- **Brook:** Both direct tapping and moving-ring + SPACE collection tested.
  Jagged stones and misses do not score, pickups are unique, and exactly five
  unlock completion. The full-story run used timed SPACE pickups for all five.
- **Flow:** A real-input run completed sheep → maze → walk toward Goliath to hear
  him → return to Saul → armour → brook → sling → victory. The QA inspector only
  reads state and cannot force success, move characters or equip items.
- **Visual update:** Illustrated character textures, shaded limbs and idle motions,
  distinct adult brothers, shaded/mossy maze walls, animated flag and footsteps,
  bag opening/bread lift/handover, delayed music, and a gentle cinematic camera
  settle. All five settings use embedded painted backgrounds. Animal components and prop surfaces are cached once. The visual check samples 120 browser frames in the maze and 60 in each other mission; actual observations are recorded in `qa/visual-results.json`. These short headless samples do not certify sustained performance on classroom hardware.
- **UI:** Language modes and equipment labels, scaled touch anchors, pause/replay,
  restart, sound unlock/suspend, focus cancellation and muted continuation.
  Original Web Audio cues were scheduled without runtime errors; no human
  listening/speaker test was performed.

The recorded optimal automated story run took **65.336 seconds** (`qa/story-result.json`).
It used a solved maze route and position feedback. This is **not** a six-year-old’s
play time or evidence of a typical five-minute classroom session.

## Offline evidence and its limits

`dist/index.html` embeds the classic JavaScript bundle, CSS and all ten generated PNG
illustrations. Artwork renders locally and sound is synthesized locally. It has no runtime module imports, CDNs,
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

45 actual PNG screenshots are in `qa/` and in the separate `Davids_Big_Adventure_QA.zip`. The playable ZIP omits screenshot evidence to keep the download small. They cover
starts, gameplay, mistakes and completion across all five missions. Representative
start, interaction and payoff images were inspected visually, including:

| Evidence | Files |
| --- | --- |
| Title and maze navigation | `01-title.png`, `02-maze-start.png`, `03-maze-wall.png`, `04-maze-middle.png` |
| Food delivery | `05-maze-handover.png`, `06-maze-success.png` |
| Dragging and armour mistakes | `07-armor-start.png`, `07b-armor-dragging.png`, `08-armor-wrong.png`, `09-armor-three.png` |
| Fully dressed, falling, removal and recovery | `10-armor-dressed.png`, `11-armor-fall.png`, `12-armor-removal.png`, `13-armor-recovered.png` |
| Physics misses, flight, hit and victory | `14-sling-start.png` through `20-victory.png` |
| Four sheep, carrying and pen completion | `21-sheep-start.png` through `24-sheep-success.png` |
| Brook error, airborne pickup and completion | `25-brook-start.png`, `26-brook-jagged.png`, `26b-brook-pickup.png`, `27-brook-success.png` |
| Interactive giant encounter / full story | `28-encounter-start.png` through `31-story-victory.png` |
| Scaled touch and languages | `32-touch-1920.png`, `32-touch-1024.png`, `33-english.png`, `34-arabic.png` |
| Countdown warnings and lift/carry | `46-sheep-countdown-warning.png`, `47-sheep-countdown-urgent.png`, `48-sheep-lift.png`, `49-sheep-carried.png` |
| Current lion catch/retry | `35-sheep-gentle-retry.png` |
| New map, cards, keepsakes and playtest guide | `50-storybook-map.png` through `54-playtest-guide.png` |
| New storybook title/layouts | `36-title-english.png`, `37-title-arabic.png`, `38-title-1920.png`, `39-title-tablet.png` |
| All-mission art and short frame samples | `42-rich-sheep.png` through `45-rich-sling.png`; per-mission samples in `visual-results.json`. |
| New maze and delivery at tablet size | `40-maze-tablet.png`, `41-delivery-tablet.png` |

Snapshots show moments in animations, not substitute animations. The full sequences
were also exercised by the browser tests. Screenshots are generated by automated
headless gameplay, not claimed as human hands-on classroom play.

## Remaining acceptance work

- Direct Windows `file://`, Chrome/Edge compatibility and actual tablets.
- Speaker sound quality, native-speaker copy review and back-of-class readability.
- Human difficulty/play-time calibration, operator rotation and touch comfort.
- Sustained frame-rate measurements on the intended classroom laptop.
- Human art and animation review. All five environments now have original painted backgrounds; David keeps his articulated Canvas limbs with illustrated face and linen texture. See `docs/VISUAL_DESIGN.md` for the implemented asset contract.

All five core game mechanisms are implemented. The evidence supports the tested
browser workflow; it does not certify final classroom readiness or the untested
platforms above.

## Scope of the eight requested upgrades

1. David uses a shared illustration-based articulated rig with idle/blink, run, bend/lift/carry, kneel, throw, wave, armour collapse/recovery and food handover poses.
2. Pickups, running, water collection, armour landing and impact produce distinct animated feedback and sound textures.
3. Scenery adds cloud drift, light, background parallax and independently moving foreground foliage; collision geometry stays fixed.
4. Food handover, armour collapse, sheep rescue, water pickup and Goliath impact have staged payoffs; flight slows near the real target without changing the computed trajectory or collider.
5. Soft instrumental music, ambient sound and optional installed local English/Arabic narration accompany captions. Automated tests verify voice selection and mute behavior. Human listening/voice quality remains unverified.
6. The illustrated map and keepsake book save genuinely earned chapter rewards locally. Storage failure does not prevent play.
7. Shared original icons, per-chapter colours, colourful cards, focus outlines and local Arabic/English typography support the interface. Short keyboard taps now register immediately in the maze. Human Arabic copy review remains outstanding.
8. Automated usability checks and an in-game/printable supervised child-playtest guide are included. Actual sessions with children require a supervised setting and have not been conducted. No child observations are invented.
