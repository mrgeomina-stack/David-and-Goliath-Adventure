# David’s Big Adventure

An original illustrated five-mission Bible adventure for ages 5–8, built with
TypeScript, Phaser 3 and Vite. Arabic + English captions, mouse/keyboard/touch,
teacher controls, fully bundled illustrated artwork, supplied recordings and procedural audio.

## Mobile/tablet and Cloudflare Pages Free

Build the hosted game with `npm run build:pages` and deploy **pages-dist/**.
The web edition keeps the existing art and mechanics, uses locally bundled files
under Cloudflare’s 25 MiB limit, and offers optional offline saving in **Book**.
It needs only static hosting: no paid services, backend, database or external API.
The **Davids_Big_Adventure_Cloudflare_Pages.zip** archive contains the ready-to-upload
folder contents. Nothing has been publicly deployed.

See [step-by-step free publishing instructions](docs/CLOUDFLARE_PAGES_FREE.md),
[mobile controls and installation](docs/MOBILE_PWA.md), and
[measured test coverage](docs/PAGES_TEST_REPORT.md).

## Animated story interludes · 1.12.0

The full adventure now includes two story moments using the supplied reference
illustrations. After the sheep celebration, Jesse gives David food and sends him
to check on his brothers (1 Samuel 17:17–20). After the maze's actual food delivery,
Goliath stomps, laughs and challenges the army. David then returns to Saul to
volunteer; the old extra walk-right/listen step is no longer repeated.

Jesse's scene has four directed poses, subtle connected basket/hands motion and
camera movement. Goliath has one continuous painted mesh with alternating foot
lifts, synchronized ground contacts/dust, breathing and laughter movement, plus
original reference close-ups. Local stomp/laughter effects and bundled English/
Arabic narration work offline. Captions remain editable text. Both scenes freeze
activity timers, offer local Replay and require Continue/SPACE after the story.
The landing UI and all five activities retain their established design and rules.
See [story implementation and artwork provenance](docs/STORY_INTERLUDES.md).

## Fifth-lamb rescue, moving stone target and new effects · 1.11.0

Rescue all four regular sheep within the existing 30-second countdown, then save
an additional fifth lamb in the lion encounter. The checkpoint freezes the timer
and preserves all four safe sheep through unlimited local retries. The counter
changes from four to five when the new lamb appears. Free Play remains untimed.

The brook ring now moves continuously through every waypoint with no arrival
pause. Press SPACE or tap a smooth stone as the ring passes it; an early or late
attempt misses without removing the stone. Five unique pickups still complete it.
Each actual sling release has an air-sweep whoosh. David's armour landing has a
layered body thud and metallic clatter, synchronized with ground contact. Both
sounds are generated locally, cached, muted/paused with the game and work offline.
The large landing UI, nine decorative cover sheep and other levels are preserved.

## Protect the Sheep encounter + large landing UI · 1.10.0

After three physical sheep deliveries, the remaining lamb wanders away and is
seized by the lion. Two forgiving, genuinely interactive timing challenges let
David rescue it and defend with his staff, before he carries it through the pen
entrance. Early or missed timing can be retried locally without losing the three
safe sheep. Keyboard SPACE, on-screen touch/click, and standard gamepad A/Cross are
supported. The uploaded lion roar replaces the generated growl and occasionally
plays during rescues, with no overlapping roar recordings.

The large landing-page title, reading text, selector and buttons have been restored.
Desktop and large-tablet windows keep the large cover even when browser chrome
reduces available height; the nine sheep walk behind the DOM buttons. Phone
controls retain their compact touch layout. This supersedes the smaller desktop
cover spacing in 1.9.3. Other mission mechanics are unchanged.

## Living cover flock · 1.9.3

Nine larger sheep casually walk around the left-facing David on the landing page.
The existing supplied walking artwork, smooth staggered paths, soft turning,
ground shadows and dynamic front/back ordering keep the scene alive without a new
animation dependency. Desktop title spacing leaves the lower meadow visible; phone
and tablet controls retain their existing layout. The rescue still has four sheep.

## Background music and button audio · 1.9.2

The supplied `magnific-buttons-and-pins.mp3` replaces the generated background
melody. It loops from the first landing-page gesture across all missions and the
final celebration at a quiet level, ducking further beneath narration and victory
sounds. Buttons share a soft pop for mouse, touch and keyboard activation, including
paused menus. Music and global mute controls remain independent. Audio is bundled
for offline play. Browser autoplay rules require the first tap/click/key press.

## Celebration and giant landing fix · 1.9.1

The sheep celebration now features David and his rescued flock without the extra
adult figure. Goliath's genuine defeat has a layered ground-impact thud and earth
rumble at the landing frame; the victory track follows it. Everything is generated
locally and works offline. Pause, mute, misses and replay retain their behavior.

## Playful game UI · 1.9.0

A reusable vector/CSS design system brings raised coral action buttons, teal
control chips, gold medallions, sky instruction cards and layered popup frames.
Nunito and Noto Sans Arabic variable fonts are bundled for offline play. Longer
bilingual text is independently shaped in RTL/LTR blocks; teacher help scrolls
without losing its action buttons. Gameplay, hit geometry, timers and story order
remain unchanged. See [design system and changed components](docs/UI_DESIGN_SYSTEM.md).
The separate UI Before/After ZIP contains five actual-game comparison pairs.

## Audio, scattered stones and spoken story · 1.8.0

Your sheep recording plays on successful lifts; occasional gentle synthesized lion
calls add urgency. Your victory recording plays once after each completed mission.
The faster stone circle travels in two dimensions through shuffled routes over
separated, randomly scattered stones. The Goliath interlude explains David’s courage
and asks the child to return and press Speak to volunteer to Saul. English/Arabic
story guidance has bundled synthetic speech, with installed voices preferred.
See [audio and encounter details](docs/AUDIO_AND_ENCOUNTER.md).

## Direction, branching maze and countdown · 1.7.0

David faces left/right with keyboard, swipe and touch-arrow movement, including
while carrying a sheep or the food basket. He keeps that facing when he stops.
The maze starts with two open choices and guarantees six forks along the solution,
including at least three detours continuing three or more cells before dead ends.
Every Easy/Normal activity has a 30-second shrinking bar: green → orange at 20 →
red below 10. Free Play stays untimed. Instructions, pause/book and committed
completion animations do not consume action time; retries start a fresh timer.

The supplied art is integrated into the existing five-mission game. Four new
backgrounds, sheep, lion, brothers, Saul, Goliath, stones, separate armour pieces,
food basket, pouch and scenery use manifest pivots and uniform scale. David now
uses one high-resolution painted character across the cover and all levels. His head, neck, torso, hands and legs share one illustration and a
continuous textured rig for running, carrying, kneeling, tumble/recovery and sling
motion. See [character correction](docs/DAVID_CHARACTER_RIG.md). One basket visibly
changes ownership.

All seven supplied integration documents and original PNGs are retained under
`visual-assets-v1/`. **64 valid candidate images load**. The supplied meadow PNG is
incomplete, so the existing meadow remains. The 28 provisional David poses stay
out of the runtime; missing optional effect frames retain existing animated effects.
See [integration decisions](docs/VISUAL_ASSETS_V1_PROGRESS.md) and
[test evidence and limitations](TEST_REPORT.md).

Responsive landscape play, finger gestures and offline PWA installation remain.
Use `Davids_Big_Adventure_Cloudflare_Pages.zip` on Pages Free for phones/tablets. See
[mobile and PWA instructions](docs/MOBILE_PWA.md).

## Storybook presentation

The five chapters now share an illustrated adventure map, earned keepsakes,
colourful instruction cards, a poseable illustration-based David, layered scenery,
action particles and cinematic payoffs. Soft instrumental music, environmental
sound and initially enabled narration support the captions. Goliath/Saul guidance includes bundled English/Arabic synthetic speech when no installed voice is available.

The sheep rescue has a **30-second limit** in Easy and Normal. At zero the lion
pursues an unprotected sheep and a gentle catch leads to retry. Other activities
show a gentle time-up/retry card at zero. A sling stone released before zero may
finish its genuine flight. Free Play remains untimed. Space or **Lift sheep** raises
one sheep into David’s hands; entering the pen triggers a gentle set-down.

![The illustrated chapter map](qa/50-storybook-map.png)
![Colourful illustrated instructions](qa/51-colourful-instructions.png)
![Earned keepsakes](qa/53-keepsake-book.png)

**Book** pauses play while open. A chapter earns its keepsake only after its real
completion and celebration; progress is saved locally when browser storage is
available. **Voice** uses an installed local English or Arabic voice. Captions stay
available if no voice is installed. **Music** can be toggled separately in the book.

Human child playtesting has not been conducted here. A supervised worksheet and
observation guide are included in [docs/CHILD_PLAYTEST.md](docs/CHILD_PLAYTEST.md)
and in the teacher help menu.

## Storybook artwork

All five games now share richer illustrated settings: the olive meadow, food maze,
royal armour tent, clear brook and wide battlefield. Sheep and lion use the supplied sprites and animation sequences; David uses the same coherent painted anatomy and textured poseable rig in every activity. Goliath, Saul, the brothers, armour and mineral stones have
original artwork. See [visual design notes](docs/VISUAL_DESIGN.md).

![Storybook title screen](qa/01-title.png)
![Interactive food-delivery maze](qa/02-maze-start.png)
![Sheep meadow](qa/21-sheep-start.png)
![Royal armour tent](qa/07-armor-start.png)
![Brook stones](qa/25-brook-start.png)
![Goliath in the valley](qa/14-sling-start.png)

## Play

Extract `Davids_Big_Adventure_Offline.zip` and open `index.html` in Chrome or Edge.
No installation, account or internet connection is needed by the distribution.
See [README_FOR_TEACHER.md](README_FOR_TEACHER.md) for controls and classroom guidance.

## Develop

Node.js 22.12+ (tested with 24.19.0), npm:

```sh
npm ci
npm run dev
```

Open the address Vite prints (default port 5173). The development server listens on
all interfaces for hosted previews and tablet testing on a trusted local network.

```sh
npm test
npm run build
npm run preview
npm run test:browser
```

Visual/QA screenshots are packaged separately in `Davids_Big_Adventure_QA.zip`;
the playable ZIP contains the complete game without the screenshot bundle.

Browser checks require Chromium. In this environment it is `/usr/bin/chromium`.
Set `CHROMIUM_PATH` to another installed Chromium binary when running elsewhere.
`npm run test:browser` starts its own temporary HTTP server on port 4174, tests the
production bundle using real input events, writes evidence into `qa/`, and stops
that server. It also checks the self-contained HTML with networking disabled.
The runner uses two independent browser workers. Set `BROWSER_WORKERS=1` on smaller machines. Do not run two copies of the browser suite concurrently.

`dist/index.html` contains all CSS, original art, audio code and the Phaser bundle
in a classic script. Gameplay needs no runtime imports or CDN assets. Hosted over
HTTPS, the included service worker saves the entire game and install icons for
offline play. File-mode play skips PWA registration. `npm run build` regenerates
the standalone distribution. Use `npm run build:pages` for Cloudflare Pages; no application backend is needed.

## Source map

- `src/model.ts`: deterministic gameplay and collision models.
- `src/world.ts`: authoritative mission/phase state machine, Phaser loop/input,
  scene rendering and staged success animations.
- `src/art.ts`, `src/hero.ts`, `src/costume.ts`, `src/npcs.ts`: supplied art and articulated Canvas rendering.
- `src/visual-assets.ts`, `visual-assets-v1/`: manifest pivots, animation timing and original supplied images.
- `src/scenery.ts`, `src/assets/`: cached maze painting and locally embedded cover illustrations.
- `src/strings.ts`: narrative strings and localization.
- `src/main.ts`, `src/style.css`: responsive accessible HTML UI and teacher controls.
- `src/touch.ts`, `src/mobile.ts`: captured finger gestures, coordinate mapping and screen fit.
- `src/pwa.ts`, `public/`: install manifest, icons, complete offline caching and explicit updates.
- `src/audio.ts`: gesture-initialized Web Audio effects and stingers.
- `tests/`: automated gameplay model tests.
- `scripts/`: self-contained build, browser gameplay tests and delivery packaging.
- `docs/IMPLEMENTATION.md`: milestones, architecture and final illustration specs.
- `TEST_REPORT.md`: exact evidence and remaining platform/human checks.

Append `?qa` to enable a **read-only** state inspector for browser tests. It cannot
skip missions, move characters, equip pieces or force success. It is absent by
default. Settings and game progress do not require browser storage.

The armour tumble is a playful dramatization: David was unfamiliar with Saul’s
armour, not inherently weak. The sling has two cords and a pouch. Only a physical
forehead/head collision unlocks the canonical victory.

Version 1.8 adds supplied sheep/victory recordings, occasional gentle lion growls, faster shuffled brook routes and scattered stones, plus an explicit spoken Goliath → volunteer to Saul → armour story bridge. See [audio and encounter implementation](docs/AUDIO_AND_ENCOUNTER.md).
