# David’s Big Adventure — UI redesign validation · 1.9.0

23 October 2026. Presentation-only update from baseline
`aa4993cd4aef88479d5555fb77e4d9a5812b91c4` (1.8.0): rounded bilingual typography,
raised coral buttons, teal control chips, framed game cards, gold badges and clearer
Arabic/English reading blocks. All five levels, controls, scoring, difficulty,
collisions, animations, audio, progression and educational text remain.

## Results

| Check | Outcome |
| --- | --- |
| TypeScript + production offline build | Passed. Compiled CSS includes both data-URL WOFF2 fonts and the full theme. |
| Unit tests | **43 passed**, eight files, no failures or skips. |
| Browser suite | **17/17 scripts passed in one batch**. See `qa/browser-results.json` and `qa/ui-browser-1.9.log`. |
| Final visual polish | UI screenshot/bounds and disconnected-font checks rerun after replacing the decorative pause glyph with CSS bars. The JavaScript bundle hash is identical to the full regression run. |
| Before/after evidence | Five requested actual-game pairs, plus hover/focus, scrolled teacher help and English/Arabic phone/tablet popup captures. |
| Offline fonts | Both Nunito and Noto Sans Arabic verified with networking disabled; no external font host or runtime text-image assets. |

The browser suite covers: real maze collision and delivery; all four armour drags,
wrong drops and complete tumble/recovery; four physical sheep carries and pen
entry; five unique stones and jagged rejection; underpowered/overpowered sling
misses and genuine forehead collision; full-story transitions; restart and retry;
pause; 30-second bar warnings and expiry; untimed Free Play; source-art alignment;
mobile touch/swipes/multitouch and rotation; audio; PWA cache failure/retry, offline
play and offline relaunch. The story audio check still records four sheep calls,
periodic lion calls and exactly five completion tracks.

The dedicated UI check captures home, mission selection, pause, teacher corner and
instruction cards. It checks bundled font readiness, actual keyboard focus/hover,
teacher-body scrolling, visible footer actions and popup bounds at 568×320,
844×390, 1024×768 and 1180×820 in English and Arabic. The existing mobile suite
also exercises 667×375, 915×412 and 1366×1024, plus portrait rotation protection.

`src/model.ts`, `src/touch.ts`, `src/activity-timer.ts`, `src/audio.ts`,
`src/narration.ts` and the hero rig are unchanged. Changes in `src/world.ts` only
replace drawing calls for existing card surfaces. `src/main.ts` changes UI classes,
decorative icons, language presentation and popup visual metadata.

## Deliverables and review

Extract `Davids_Big_Adventure_UI_Before_After.zip`, then open its `index.html`.
It contains five paired comparisons, original full-size screenshots, an overview,
and extra phone/tablet captures. Game screenshots are from the integrated build;
the comparison page is a review gallery, not a replacement game.

The editable design system and file/component map are in
`docs/UI_DESIGN_SYSTEM.md`. Font notices are in `docs/NUNITO_OFL.txt` and
`docs/NOTO_ARABIC_OFL.txt`; they ship in the playable/Web/source archives.
The offline ZIP includes the self-contained game, fonts, artwork and recordings.
The source and QA ZIPs are supplied separately.

## Limits

Validation used Node 24, Phaser 3.90 Canvas, TypeScript 5.9, Vite 7.3, Vitest 4
and Playwright 1.58 with headless Chromium and emulated native touch. Physical
Safari/iPad/iPhone/Android and classroom child playtesting were not performed.
Managed Chromium blocks direct `file://` navigation; the actual self-contained
HTML was tested with networking disabled instead. No claim of physical-device
certification or human audio listening is made.

The original asset-pack gaps remain handled by existing fallbacks: one damaged
meadow background, absent optional effects and provisional character frames.
No art pack or gameplay rebuild was introduced. Earlier release validation is
retained in `docs/VALIDATION_1_8_0.md` and `docs/VALIDATION_1_7_0.md`.

## Reproduce

```
npm ci
npm test
npm run build
BROWSER_PORT=4215 npm run test:browser
node scripts/ui-comparison.mjs
npm run package
```

The browser runner defaults to port 4174; the UI capture script uses 4211.
Run one suite at a time. The read-only QA inspector cannot move actors or force wins.
