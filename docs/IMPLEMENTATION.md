# David's Big Adventure implementation

Source of product requirements: DAVIDS_BIG_ADVENTURE_CODEX_BLUEPRINT.md, v1.0.
User-selected stack: TypeScript, Phaser 3, Vite. No runtime network dependencies.

## Architecture
- `model.ts`: seeded maze graph/BFS, movement, collisions, equipment anchors,
  sheep steering/pen, unique stone pickups, analytic ballistic flight and swept hit test.
- `art.ts`: original layered Canvas illustrations and articulated character drawing.
- `world.ts`: Phaser scene, frame-independent simulation, rendering, scene-owned payoff clocks.
- `main.ts`, `style.css`, `strings.ts`: accessible scaled teacher/input controls, localization, audio.
- `audio.ts`: gesture-initialized procedural sound; no recordings or network requests.
- Vite produces a classic IIFE, embedded into dist/index.html for file:// operation.

## Vertical milestones and validation gates
1. Maze: seeded, branching 9x7 graph; BFS; wall blocking; tactile movement;
   food passes from David to brothers during 4s animated cinematic.
2. Armour: four independent draggable pieces, generous anatomical anchors;
   correct layers; 6.5s staged step/wobble/sit/remove/walk sequence.
3. Sling: two-cord sling, hold/release, analytic gravity, swept forehead collision,
   genuine misses and retry. Check low/ideal/high charges at multiple frame rates.
4. Sheep then brook: four individual pickups/carries, protected pen delivery, timed lion pursuit and five unique smooth stone pickups.
5. Story flow, original art/sound, Arabic/English, touch, pause/focus, packaging,
   offline automated browser checks and screenshots. Report unverified human QA honestly.

Required: model tests, typecheck, production build, browser gameplay and offline checks.
Optional/unavailable: physical projector readability, Windows/Edge and human classroom timing.

## Final illustration specifications
Current assets combine locally embedded original generated cover illustrations
and editable procedural Canvas character rigs and scenery. The version 1.2 title,
maze and delivery treatment is described in VISUAL_DESIGN.md. Other environment
illustration passes now cover all five settings, animals, adult cast, armour and stones.
Maintain David's blue headcloth, cream tunic, rust belt, brown sandals and woven bag
across all poses; expressive eyes/brows/mouth. Use honey light, sage/forest foliage,
ocher sandstone, turquoise water, navy UI, bronze equipment. Logical scene 1280x720.
Future replacement assets: layered transparent 2x sprites (David 180x280; brothers
180x280 each; giant 300x620), separate head/upper/lower arms/legs and equipment;
walk/call/carry/handover/kneel/sling/fall/recover poses. Backgrounds 2560x1440,
keep targets unobstructed; overhead maze tiles 132x132, walls align to graph edges.
No Y-shaped slingshot, medieval armor/castles, gore, divine personification or beams.

## Sheep rescue update — 1.3
The user’s four-sheep carry-and-countdown request supersedes the original two-sheep following mechanic in GAME_BLUEPRINT.md. `SheepModel` owns one-at-a-time pickup, 0.55s lift, 290px/s carrying run, 0.4s pen set-down, four protected pen slots, countdown and physical lion pursuit/catch. Walking is 245px/s. Pickup radius is 90px. Easy and Normal both start at 30s; Free Play uses a null deadline. A catch can only happen after zero, and saved sheep cannot be prey. David can finish a rescue while the lion approaches after zero. Game pause stops all model updates and the timer. The timer is a DOM element that scales with the stage and changes text and colour at 20s/10s. No model mutation or forced victory is used by browser tests.

## Storybook presentation — 1.4

- `hero.ts`: illustration-based articulated David, with idle breathing/blinking, alternating run, pickup bend, two-handed carry, kneel, one-arm throw, wave/celebration, armour strain/collapse/recovery and handover. Gameplay feet and drop regions are unchanged. The approved portrait and linen material remain locally bundled; limbs, hands, sandals, clothing folds and expressions render as layered Canvas art.
- `effects.ts`: bounded dust, water and sparkle particles, scenic cloud drift and warm light, foreground foliage, short cinematic framing. Only scenery shifts with the subtle background camera; hit geometry remains fixed. Sling flight slows slightly near the actual target while retaining the model’s computed trajectory and collision.
- `audio.ts`: soft pentatonic instrumental score, filtered environmental sound, footsteps, cloth/water textures and action cues. Music has a separate book toggle; Sound mutes all audio. Pausing fades the score and ambience.
- `narration.ts`: optional Web Speech narration restricted to installed local voices. Captions remain usable when the API/voice is unavailable. No remote narration service is used.
- `journal.ts`: typed chapter metadata, original SVG motifs and validated local keepsake persistence with storage-denial fallback. Only real completion followed by its payoff earns a keepsake.
- `main.ts` / `style.css`: illustrated chapter-map dialog, collected keepsake shelf, focus handling, per-chapter colourful instruction and celebration panels. Book opening pauses the game and closing resumes its prior pause state.
- `docs/CHILD_PLAYTEST.md`: supervised observation guide. Automated usability checks are implemented; human child sessions remain outstanding.

The explicit later user request replaces the previous two-minute/90-second limits with 30 seconds. The timer waits while the opening instruction is shown. Thirty seeded input-driven model rescues complete within 27 seconds. This does not establish a typical child completion time.


## Mobile / PWA milestone · 1.5

The logical world and deterministic mission models remain unchanged. Native Pointer
Events now normalize actual canvas bounds, capture armour drags and independent
held buttons, cancel interrupted gestures and add single-step maze swipes. Compact
HTML controls remain finger-sized independently of world scaling; landscape fit,
visualViewport changes and safe areas protect the complete scene. Portrait phones
pause with an optional rotation reminder. Existing mouse/keyboard paths remain.

The static production build adds scope-relative install metadata, original branded
icons and a content-versioned service worker. All embedded artwork/game code and
install assets must cache successfully before readiness is advertised. An explicit
update flow protects active play and preserves keepsakes. Build/package/preview
steps are in docs/MOBILE_PWA.md; exact browser evidence is in TEST_REPORT.md.

## Version 1.7.0: facing, maze choices and activity deadlines

The latest user request sets every Easy/Normal activity to 30 active seconds,
with green→orange at20→red below10 progress bars. Free Play stays untimed.
The shared ActivityTimer pauses with instructions/menus and committed completion
animation; released sling shots finish real flight. Other expired rounds retry
from a fresh timer; sheep still physically enter the pen and the lion catches
unprotected sheep after zero. Maze generation now guarantees two initial choices,
a start detour ≥3 cells, six forks on an 18–26-step solution, and at least three
detours continuing ≥3 cells before later dead ends. Walls remain real collisions.
David's whole painted rig and supporting hands mirror with persistent left/right
facing, including brief taps and carrying. These requirements supersede earlier
timer and maze-generation descriptions in the project history.
