# Codex integration instructions — existing game only

Read `README_ASSETS.md` and `asset_manifest.json` first. This pack is a partial visual upgrade; its provisional animation is not an accepted final production result.

## 1. Audit the real project before edits

Identify Canvas/DOM/Phaser renderer, logical resolution, image loader, current visual bounds, feet origins, drag targets and projectile/head colliders. Save a baseline commit and one screenshot per level. Make a KEEP/ENHANCE/REPLACE table with actual source references. Do not replace the working game with `preview/index.html`: that file only inspects artwork.

## 2. Load local images without changing gameplay

Copy this directory's runtime folders into the existing relative asset directory. Load PNGs with `new Image()` and relative URLs. For double-click `file://` operation, use the provided classic-script `asset_data.js`; do not fetch JSON at runtime or introduce ES-module imports. Keep an existing working loader if it already supports local files. `integration/asset_runtime.js` provides a small optional Canvas adapter.

Background IDs and role mappings are in `ROLE_REPLACEMENT_MAP.json`. These are semantic roles; no exact game source identifiers have been invented. Keep all existing state transitions, keydown/keyup rules, hold timing, gravity, launch speed, scoring, fail/retry behavior and hit tests unchanged.

## 3. Respect pivots and camera

Manifest pivots are pixels, not fractions. A standard draw is:

```js
ctx.drawImage(image, x - pivot.x * scale, y - pivot.y * scale,
              image.width * scale, image.height * scale);
```

Use uniform scale. Keep current collision footprints independent of the picture's rectangular bounds. For left-facing motion, mirror about the feet pivot with a saved context; mirror attachment x coordinates too. Do not crop transparency without updating pivots and all anchors.

Draw a 1920×1080 background at the existing 1280×720 logical bounds, then let the game's existing letterboxing handle the viewport. Do not stretch the world to a non-16:9 window. Physical and pointer coordinates stay in original game units.

## 4. Level-specific integration

**Sheep:** use the meadow plate, David idle/walk/call, sheep variants and lion. Place fence/gate pictures on existing collider segments; tile/stretch between existing endpoints without changing the pen opening. Use a separate ground shadow if desired. Images never decide whether a sheep is inside.

**Maze:** preserve every generated/authored maze cell and wall collider. Background is a clean ground plate. Draw wall blocks on existing blocked cell edges, leaving junctions readable. Brother positions remain tied to the current goal zone. David's food pose and separate basket are provided; the carried walk cycle is incomplete. Preserve/extend the existing carried-food render rather than removing food while walking. During success, use `food_offer`, move a SINGLE separate basket between measured hand anchors, then switch to brother receiving pose. Hide any basket already baked into pose art during the actual transfer to avoid duplicates; a clean body/hand overlay is needed for a polished final result. Trigger only on the existing goal-zone event.

**Armor:** keep four independent draggable object IDs. Render tunic below mail; helmet above head; belt/sheathed sword above torso equipment. Preserve generous current drop zones and correct order-independent layering. Attachment references are provisional, not universally fitted to all David poses. The supplied runtime rig demonstrates pose-specific transforms and outputs 28 PNGs. Do not use the provisional animation unchanged as a final acceptance claim. Keep the existing completed armor animation until an improved replacement is reviewed. Only FOUR actual correct drops may trigger the payoff. Gear removal must be visible and keep the full cutscene duration.

**Brook:** use separate smooth-stone sprites for 8–10 logical stone instances (reuse three art variants), each with its own current unique gameplay ID. Exactly five unique smooth collections succeed. Jagged sprite never increments. Keep water moving via existing effects or these splash frames. Painted shoreline/submerged rocks in the background are decoration, not gameplay items. The kneeling rig is provisional; keep the working existing pickup animation while refining the replacement.

**Sling:** before throwing, align Goliath's manifest `forehead` art anchor with the existing visible target/head position; use feet height to choose a uniform scale and solve actor translation. Do not move a collider independently to chase the art. If both cannot fit, refine the art or its render offset. Display collider debug overlay during QA, then disable it. The reference sling PNG is a static equipment illustration; for actual spinning, draw TWO cords between the current hand and rotating pouch, keeping one retention cord on release. It is not a rigid loop to rotate as a single sprite. Preserve the existing release angle and launch origin. Per-pose `slingHand` is an art anchor; pose translation can align the hand/pouch with the existing physics launch origin. On keyup, the projectile is drawn from the existing authoritative physics object, never an animated precomputed guaranteed hit. Trigger `goliath_defeat` only after the current swept collider confirms a hit. Preserve real low/high charge misses.

## 5. UI and effects

Use blank panels/buttons only where they improve current UI. Retain editable Arabic/English DOM/Canvas strings, proper RTL shaping, large labels and accessible pointer targets. Effects are decorative: no particle callback is allowed to award score, collect an item or force a hit. Existing audio remains unchanged.

## 6. Required review before calling integrated build complete

Test each level at start, gameplay, mistake/failure, success, restart and transition. Test 1280×720, 1920×1080 and letterboxed windows; Arabic/English; mouse/touch scaled drag; focus loss while charging; pause mid-flight; low/ideal/high power; exact five stones; fewer-than-four armor drops; maze branches; sheep pen crossings. Open the final game directly from disk with internet disabled. Capture actual game screenshots; asset preview composites are not evidence of gameplay tests. Compare baseline mechanics tests and finish a real full playthrough. Package updated game separately from this reusable art library.
