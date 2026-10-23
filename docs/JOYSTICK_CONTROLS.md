# Right-side touch joystick

The four on-screen arrow buttons are replaced by a large, two-circle thumb
joystick on the right side of the game. Drag the gold inner circle in any direction;
release it to return to centre. Action buttons sit beside or above the circle on the right.
The joystick stays at least 100 CSS pixels across on phones, with an inner target
over 44 pixels. It works with touch, a stylus or a mouse, with no new dependency.

## Each activity

- **Sheep:** steer David with the circle. When close enough, tap a sheep once to
  trigger the existing lift animation, then steer back through the pen entrance.
  David puts it down automatically inside. A distant tap never teleports a sheep
  into his hands. The Lift button and keyboard SPACE still work. A second finger
  can tap a sheep while another finger owns the joystick.
- **Maze:** the same drag selects the nearest horizontal/vertical corridor direction;
  holding continues to walk, and releasing stops. Walls, maze branches, movement
  cooldown and the actual basket-delivery celebration are unchanged. Swipes and
  keyboard arrows/WASD remain available.
- **Armour:** the joystick moves a visible hand. Steer to a tray, tap **Pick piece**,
  steer the piece over David's matching body part, then tap **Place piece**. Wrong
  placements return it to its tray. All four correct pieces are still required
  before the original collapse/recovery. Direct finger dragging and tap-piece /
  tap-body placement remain available.
- **Stones:** steer the hand over a smooth stone and tap **Scoop** as the existing
  moving ring passes it. Early/late attempts miss; exactly five unique stones are
  still required. Direct stone taps and keyboard SPACE retain their timing rules.
- **Sling:** pull the inner circle, hold, then release to throw. Charge depends on
  holding time, with the same ballistic path, weak/strong misses and real forehead
  collision. Cancelling a touch cancels charging rather than releasing a stone.
  The action button and SPACE also retain hold/release behaviour.

The fixed-position armour, brook and sling activities keep their original game
models; steering controls their existing interaction rather than adding unrelated
walking or moving their collision targets. During the lion mini-boss, the same
right-side action button handles the two timing challenges and unlimited local
retries; the movement circle is hidden until normal walking resumes.

## Safety and preservation

Pointer capture keeps a drag attached to its original finger even outside the
circle. Other fingers cannot hijack it. Release, pointer cancellation, lost
capture, blur, orientation/viewport changes, pause, replay and mission transitions
reset input. A small centre dead zone prevents jitter. Full walking speed and
normalized diagonal speed remain unchanged. No artwork, collision shapes, timers,
level order, physics, scoring, music or story animation was replaced.

## Validation

- `npm test`: 67 tests, including joystick direction/dead-zone tests, targeted
  nearby sheep pickup and rejection outside the original 90-unit reach.
- `GAME_URL=http://127.0.0.1:4182/ node scripts/joystick-check.mjs`: native Chromium
  emulated touch at seven phone/tablet sizes; all five joystick interactions,
  single-tap pickup and actual pen delivery, independent fingers, cancelled input,
  pause reset, maze completion, direct armour drag, incorrect/correct cursor drops,
  armour collapse, five timed stone pickups and a real sling hit.
- `GAME_URL=http://127.0.0.1:4182/ GAME_OFFLINE_OPT_IN=1 node scripts/story-check.mjs`:
  complete existing story and both interludes from the cached production build.
- `scripts/cursor-check.mjs`: seven-size brook layout, unobstructed kneeling David,
  transparent cursor/timing-ring visibility, and an actual timed pickup.
- `scripts/ui-offline-check.mjs`: standalone HTML with networking disabled, embedded
  fonts, scaled touch placement, audio, focus cancellation and pointer release.
- `npm run test:pages`: optional save, partial-download failure/retry, offline
  joystick maze completion, update acceptance and persistent keepsakes.

The existing touch regression drivers also use the replacement joystick. Actual
screenshots and measured results are in `qa/joystick/`. Browser tests emulate native
touch in Chromium; physical iPad/iPhone Safari and Android device checks still need
to be performed. `npm run build:pages` keeps every hosting asset below 25 MiB.

## Updated downloads

`npm run package:pages` produces `Davids_Big_Adventure_Cloudflare_Pages.zip` for
static HTTP(S) hosting and installable/offline mobile use. `npm run package:offline`
produces `Davids_Big_Adventure_Offline.zip` with a self-contained desktop HTML.
Extract the latter completely before opening it. Its deliberately large embedded
HTML must not be uploaded to Cloudflare; use the modular Pages ZIP for hosting.
Existing installed copies may offer **Book → Update adventure** after the hosted
site receives the new build. Both formats include the new controls.
