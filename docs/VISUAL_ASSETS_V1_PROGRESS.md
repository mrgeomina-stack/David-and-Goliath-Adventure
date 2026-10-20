# Visual library integration — partial working implementation

All seven required documents have been received and read. No new PNG image has
been received. `qa/visual-assets-inventory.json` reports **0/89 candidate PNGs**,
with 28 provisional poses and 24 source/reference entries excluded from automatic
replacement. This is not a completed visual asset replacement or art acceptance.

Implemented in the existing game:

- `src/visual-assets.ts`: existing Phaser preload and Vite inline packaging load
  local images, validate dimensions, preserve pixel pivots and uniform scaling.
  Helpers support mirrored attachment coordinates and aligning Goliath's supplied
  forehead/feet to the existing target without changing the collider.
- `scripts/import-visual-assets.mjs`: reconstruct canonical manifest paths from
  individual files. Refuse ambiguous duplicate basenames and invalid dimensions;
  write an explicit inventory. Run `node scripts/import-visual-assets.mjs PATH`.
- World background roles use supplied images when present; the generated maze
  stays above its ground plate and keeps all graph-based collision rules. Current
  artwork remains in place while files are missing.
- `src/food.ts`, `src/hero.ts`, `src/world.ts`: David carries one separate basket
  while walking. The four-second delivery animation transfers that basket to the
  brother's visible hand, then releases David's grip. No second basket/baked bag
  or extra transferred loaves are rendered. The receiving sprite's existing arms
  remain intact; new arms are not layered over its baked arms.
- Strong existing sheep carry, armour fall/removal/recovery, kneeling and sling
  articulation remain. The supplied provisional poses have not replaced them.
- `src/model.ts` is unchanged: four actual sheep entries, maze collisions, four
  correct armour drops, five unique stones, ballistic misses/hit, retry and story
  transitions remain authoritative. Bilingual strings stay editable in code.

## Verification

The production build and all 32 unit tests passed. All 11 browser regression
scripts passed before the final basket/hand-position visual refinement. After
that refinement, the production build, all 32 unit tests, the targeted real-input
food-delivery check and the complete mobile check passed again. These exercise
the actual game; no model or collision rule changed.
`qa/food-integration-results.json` records the direct-disk check separately.
The direct file:// launch was attempted with networking disabled and blocked by
managed Chromium with ERR_BLOCKED_BY_ADMINISTRATOR; it was not passed and no
browser policy was bypassed. The self-contained networking-disabled runtime is
covered separately by the existing browser suite. Physical Safari/iOS/Android
remain unverified.

Actual game screenshots63–65 show carried-food locomotion, handover and the
receiver holding the basket. These show the current illustration fallback and
Canvas basket, not the missing new PNG artwork. See the current QA JSON records
for exact executed results; candidate-image alignment is still untested.

## Remaining blocker

The manifest supplies file paths and geometry, not image pixels or download URLs.
The existing repository connection still exposes the older committed tree; direct
GitHub API access was refused. The partial library's large ZIP exceeds the upload
transfer limit, so its contents could not be extracted here.

The next useful upload is **backgrounds.zip** and **sprites.zip**, each under 30 MB,
containing the actual runtime images. A folder ZIP preserves repeated basenames
such as David/Goliath idle.png. UI/effects can arrive in another small ZIP. Source
sheets and the inspector need not be resent to begin the visible replacements.

Until those images are available, full new-art integration, supplied armour fit,
new Goliath forehead/release alignment, final new-art screenshots and the final
replacement-art game/source packages remain unfinished.
