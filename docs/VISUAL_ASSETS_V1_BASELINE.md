# Visual asset integration baseline

Baseline: `715181850ceae33f29e29a59e3af15450959268f` (mobile/PWA edition 1.5).
Local tag: `baseline/visual-assets-v1-7151818`.
A copy of the existing source ZIP is saved outside the checkout at
`/workspace/shared/downloads/Davids_Big_Adventure_Pre_Asset_Upgrade_Source.zip`.
The application files were clean at inspection. No game code or artwork was changed.

## Input availability — blocking

The user supplied `Davids_Big_Adventure_Visual_Assets_v1_PARTIAL.zip`.
The upload download tool rejected it with:
`file exceeds the executor transfer limit of 32 MiB`.
No archive contents were transferred or read. The separately uploaded README_ASSETS.md
was subsequently received and read, and preserved at visual-assets-v1/README_ASSETS.md.
All six remaining documents were subsequently supplied as separate attachments,
read and saved with their original paths. All seven required documents are now
available. The PNG artwork remains unavailable; the manifest inventory reports
0/89 integration-candidate PNGs. No supplied artwork is claimed integrated.

Searched the checkout, workspace attachments/library/shared folders, and the fetched
current `main` tree. No `visual-assets-v1`, `README_ASSETS.md`, `asset_manifest.json`,
`animations.json`, or matching asset ZIP was present there. `main` was inspected
without checking it out or merging it into the working game branch.

To unblock: provide independent ZIPs smaller than 30 MB each, with the seven text/
JSON integration documents in the first ZIP, or commit the complete
`visual-assets-v1` folder to this repository. Do not compress away transparency or
re-export provisional animation as approved artwork to reduce the upload size.

## Existing implementation inspected

- TypeScript + Phaser 3.90 + Vite; renderer explicitly Phaser.CANVAS.
- One 1280×720 CanvasTexture (`painted-world`) refreshed by `World.render()`;
  Canvas drawing functions implement scenes and articulated characters.
- Vite imports PNGs as URLs; Phaser preload loads them, then `configurePainted`
  creates alpha-trimmed and baked local atlases. Existing sheets use explicit cuts
  for optical layouts. Supplied pivots must be preserved separately from any trim.
- Vite inlines artwork into its IIFE bundle; `scripts/offline.mjs` embeds JavaScript
  and CSS into dist/index.html. The PWA build additionally caches install metadata.
  Keep the offline embedding path when adding supplied assets.
- David's `drawHero(c,x,y,scale,pose,time)` origin is the ground contact between his
  feet. Body landmarks are local offsets above that origin; drawHero transforms
  articulated limbs, illustrated face/linen, sit, tilt, walk and carry poses.
- Native captured Pointer Events normalize actual canvas bounds into 1280×720;
  generous touch targets and HTML controls remain independent of scene art.
- Editable Arabic/English strings live in TypeScript/HTML. Keep them out of artwork.

## Per-level keep / replacement boundary

| Activity | Keep exactly | Artwork integration boundary |
| --- | --- | --- |
| Sheep | Four identities, nearby pickup, lift/carry/set-down, fence/gate tests, 40-second Easy/Normal timer, untimed Free Play, lion pursuit/catch and retry | Replace suitable meadow/animal/pen surfaces only after checking supplied roles and pivots. Keep the articulated lift/carry; rendered feet must align with collision positions. |
| Maze / food | Seeded 9×7 edges, 59px cells at (215,192), actual movement/collisions, hint and goal gating | Preserve generated wall/path drawing. A new background must sit behind it. Keep procedural walk and delivery timing; audit the handover to draw exactly one basket with explicit ownership rather than duplicate objects. |
| Armour | Four separate draggable objects, separate model drop regions, 4/4 gating, 6.5-second payoff and retry | Fit supplied pieces to existing attachment anchors. Retain the rig's step/wobble/gentle fall/helmet slip/removal/recovery; do not substitute an inferior provisional frame. |
| Brook | Unique stone IDs, jagged rejection, exactly five pickups, cooldown and moving-ring controls | Retain kneeling articulation and pickup timing. Fit stones around their existing centers; any new character hand/bag endpoint must preserve the scoring event. |
| Sling / encounter | Interactive approach/return, hold/release, charge, ballistic trajectory, genuine swept head collision, weak/strong misses and ending | Fit Goliath's forehead to the existing target. Align visible release/follow-through to the fixed flight origin through artwork offsets, not changes to the trajectory or collider. |

Final keep/enhance/replace decisions for individual supplied files remain pending
actual inspection of their manifest, role map, scale anchors, animation status and
pixels. The asset inspector will not replace the game.

## Fixed geometry and animation anchors

- Sheep field walk bounds: x95..1170, y220..594. Fence rectangle starts (128,410),
  size200×158; right entrance y458..538. Interior scoring x146..305, y428..550;
  collision tests and actual carried-sheep entry must remain authoritative.
- Armour tray centers: tunic(220,280), mail(1045,280), helmet(220,482),
  sword(1045,482). Attachment anchors: tunic/mail(650,395), helmet(650,227),
  sword(691,441). Chest zones (550,340,200,80), head (550,162,200,130),
  waist (605,421,180,104); existing touch tolerance remains in the view/input layer.
  Standing armour David has feet at (650,590), scale2.4.
- Brook stones retain model centers and IDs. Kneeling David is currently drawn at
  (1112,586), scale0.8. Pickup visual flies to the bag near (1141,550).
- Sling David feet (130,597), scale1.05. Model flight origin (184,513),
  target/forehead center (1000,259), radius43, gravity900, launch angle52°.
  The currently animated ready-state pouch orbits a separate visual pivot; review
  the final charge/release transition to avoid a visible discontinuity while
  leaving the model unchanged.
- Current food handover opens David's bag, draws a transferred loaf, then additional
  loaves for other brothers. This is an existing animation requiring special review
  for the newly requested single-basket handover; do not claim it already meets that
  requirement. The four-second maze celebration gate must remain unchanged.

## Validation status

No new integration build or regression run was warranted because no assets were
accessible and no application files were changed. The baseline's recorded evidence
is 27 unit tests and 11 browser checks, with physical Safari/iOS/Android unverified.
The managed Chromium baseline previously blocked file:// with
ERR_BLOCKED_BY_ADMINISTRATOR. The requested final direct-disk test must be attempted
and reported separately after actual integration; HTTP/offline routing is not a
substitute for that test.


## Separately uploaded README — confirmed library status

README_ASSETS.md describes five 1920×1080 background deliveries resampled from
1672×941 native originals, 56 separated character/prop sprites, four blank UI
sprites, 24 effect frames and 28 explicitly provisional articulated David frames.
This is a partial asset library, not an accepted final animation set. Preserve
better existing carry/walk, kneel, tumble/removal/recovery and sling animation.
Attach a separate basket to walking David rather than substitute an inferior
static carry pose. The helmet needs shell/rim/face layering; its supplied shaded
interior is not a transparent face aperture. Background rocks are decoration;
collectible stones retain separate runtime IDs. Keep all bilingual strings in
code and all gameplay models authoritative. The README contains no external
asset download URL. Remaining documents and images are still needed to integrate.


## Metadata integration progress

All 141 manifest records were parsed, including every status, source rectangle,
size, pivot and available attachment. All animation frame IDs resolve. Candidate
assets total89, provisional David frames28 and reference records24. The importer
validates dimensions and refuses ambiguous flattened names (David and Goliath both
have idle.png, for example). The seven received documents are saved unchanged.

The existing Vite/Phaser loader now discovers local runtime PNGs under
visual-assets-v1 and embeds available candidate images in the offline HTML. It
rejects mismatched dimensions, preserves pixel pivots and uniform scaling, and
excludes provisional/reference assets from replacement. Five supplied background
roles and the separate food basket have view-only hooks with existing art fallback.
Actual sprite/animal/NPC/armour fitting awaits inspection of the missing images.

A single separate Canvas basket now accompanies David's walking rig in the maze.
The delivery scene moves that same basket to the existing brother's hand, removes
David's grip, and keeps it with the receiver. It does not draw the old extra loaves
or a second bag. The existing four-second success gate, scene transitions, actor
control and all of src/model.ts remain unchanged. Image-based basket alignment
must be reviewed when the supplied PNG arrives.

See docs/VISUAL_ASSETS_V1_PROGRESS.md for current verification and blockers.
