# Visual library integration · 1.7.0

The three uploaded ZIPs were extracted into canonical manifest paths. All seven
required documents were read first and are preserved unchanged. This is an
upgrade of the existing Phaser Canvas game, not the asset inspector or a rebuild.

## Baseline and architecture

The pre-art commit is `1a4277c` (tag `baseline/pre-visual-v1-1a4277c`); original
screenshots of all five levels are in `qa/baseline-v1/`. The earlier mobile/PWA
baseline is `7151818`. The old offline HTML is backed up outside the checkout at
`/workspace/shared/downloads/Davids_Big_Adventure_Pre_Visual_v1.html`.

Phaser.CANVAS renders a 1280×720 CanvasTexture. David's origin is between his feet;
PNG pivots stay in original pixel coordinates. Uniform scale and rendering offsets
fit art to the existing geometry. Native pointer/touch mapping still uses the
actual canvas bounds. Editable English/Arabic strings remain in TypeScript/HTML.
Vite embeds images and classic JavaScript in the offline HTML, without a CDN.

## Per-level art decisions

| Scene | Replaced or enhanced | Kept |
| --- | --- | --- |
| Sheep | Three sheep appearances across four separate sheep; hop/lion-walk sequences; carried sheep and fingers; fence and gate surfaces; cohesive David rig/pouch | Existing meadow, articulated lift/carry/set-down, real pen entrance and collisions, 30-second timer and lion/retry behavior |
| Maze / delivery | Ground plate, texture within original wall segments, camp brothers, one separate basket, receiving hands masked from supplied artwork | Seeded graph, corridor width, wall rejection, hints, locomotion and four-second celebration gate |
| Armour | Tent, Saul, four separate tray/worn props; layered helmet preserves David's face and slips during tumble | Correct body regions, wrong-drop reset, 4/4 gate, 6.5-second step/wobble/fall/removal/recovery |
| Brook | Brook background, three smooth-stone appearances across five unique IDs, jagged rocks, pouch, articulated ground knee and hand-to-water pickup/stow | Stone centers, IDs, ring/tap controls, rejection, cooldown and exactly-five success |
| Sling / encounter | Battlefield, giant taunt/hit/stumble/fall sequences, soldier; cohesive David rig/pouch and articulated follow-through | Interactive approach/return, original charge, gravity, launch origin and swept collision; weak/strong misses |
| Shared UI | Supplied stars and victory medal | Better existing responsive bilingual panels/buttons, chapter map, touch controls, focus states and procedural effects |

## Animation and alignment

No provisional David frame replaces an existing animation. Version 1.6.1 replaces
the mismatched painted-head/geometric-body rig with one coherent 1024×1536 David
illustration and continuous textured limb skinning. Head, neck and torso remain
one connected surface, and the same painted hands support sheep and baskets.
The hips follow the torso during the tumble/kneel. Helmet and clothing follow the
same body transform; the helmet rim is fitted above his eyes, and worn neck
openings reveal his painted shirt. See DAVID_CHARACTER_RIG.md.

The receiver's baked basket is masked and his original hands layer over the one
moving prop. Food ownership remains David → shared support → brother. Brother
cheers/claps use supplied poses. All original supplied PNGs are preserved unchanged.

Manifest dimensions, pixel pivots and uniform scale are validated. Goliath's
forehead anchor maps exactly to the unchanged `(1000,259)` collision center;
standing feet are at y590. The release point remains `(184,513)`. Read-only QA
compares the actual drawn projectile with the model position in flight. Artwork
alignment changes no model physics. The subsequent 1.7.0 update changes maze generation and the activity deadline
per the user’s request; see README.md and TEST_REPORT.md.

## Partial library handling

- 93 supplied PNGs: 92 decode fully; one damaged original is retained unchanged.
- 64 of 89 candidate images are valid and loaded (four backgrounds, 56 sprites,
  four UI images). 24 optional effect images are absent; existing procedural
  effects remain. No guessed replacement files are synthesized.
- `backgrounds/level01_shepherd_hills_1920x1080.png` has an incomplete PNG stream
  and IDAT CRC failure. Some browsers display only its upper rows. It is excluded
  from runtime packaging/preloading; the existing meadow remains.
- 28 provisional David PNGs are retained for reference and excluded from preload.
  Source/reference records are not runtime assets. No provisional work is
  relabeled as final animation.
- `scripts/png-check.mjs` checks chunk CRC, IEND and decoded row lengths;
  `node scripts/import-visual-assets.mjs` writes the inventory. Supplied artwork
  files are unchanged; all fitting/masking happens in rendering code.

## Validation and delivery

See `TEST_REPORT.md`, `qa/browser-results.json`, `qa/food-integration-results.json`
and `qa/v1-integration-results.json` for executed checks. The final production
suite exercises real inputs across all five games; the inspector only reads state. Character screenshots75–83 show
the new cover, idle, walk, actual carry, phone size, kneel, pickup and sling poses.
Screenshots 67–74 show the integrated game and explicit alignment overlay;
63–65 show basket carry and transfer. Original baseline screenshots are separate.

The offline/source/web/QA ZIPs are regenerated from the final build. Direct
`file://` testing was attempted with networking disabled but is blocked by managed
Chromium (`ERR_BLOCKED_BY_ADMINISTRATOR`). Self-contained offline HTTP and actual
service-worker offline reload are tested separately. Physical iOS/Safari/Android,
human child playtesting and sustained device performance remain unverified.
