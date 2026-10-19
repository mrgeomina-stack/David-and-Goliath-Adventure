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
The user’s four-sheep carry-and-countdown request supersedes the original two-sheep following mechanic in GAME_BLUEPRINT.md. `SheepModel` owns one-at-a-time pickup, 0.55s lift, 220px/s carrying run, 0.4s pen set-down, four protected pen slots, countdown and physical lion pursuit/catch. Walking remains 190px/s. Pickup radius is 90px. Easy starts at 120s, Normal at 90s; Free Play uses a null deadline. A catch can only happen after zero, and saved sheep cannot be prey. David can finish a rescue while the lion approaches after zero. Game pause stops all model updates and the timer. The timer is a DOM element that scales with the stage and changes text and colour at 30s/15s. No model mutation or forced victory is used by browser tests.
