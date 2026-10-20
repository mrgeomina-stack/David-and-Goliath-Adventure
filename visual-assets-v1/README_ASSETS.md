# David's Big Adventure — visual library, iteration 1

## Read this status before integration

This is a tangible asset library for the existing five-level game, not a new game. It is **not production-complete**. It contains five backgrounds, 56 separated generated character/prop sprites, four blank UI sprites, 24 effect frames, and 28 **provisional** articulated David frames. The current Codex game was unavailable, so source-specific replacement mapping and all in-game acceptance tests remain pending.

The generated backgrounds are supplied at exactly 1920×1080. Their native generation resolution was 1672×941; the delivery images are modestly resampled, not native Full HD artwork. Native originals are retained in `source/`.

The accepted reference design is consistent across David's generated movement and food poses. Further David action-sheet attempts were rejected by the generation service. The supplied articulated cutout renderer is an alternative animation implementation allowed by the handover, but its collecting, dressing, tumble, sling and celebration poses need further artistic work. These are explicitly tagged `provisional` in every manifest entry and animation record. Do not silently promote them to accepted final animation.

## Contents

- `backgrounds/`: five opaque scene plates, no embedded text. Maze corridors and walls are runtime geometry.
- `sprites/`: individual true-alpha PNGs, separated by actual component boundaries, not a blind grid cut.
- `ui/`, `effects/`: blank text-free interface shapes and three eight-frame effects.
- `asset_manifest.json`: pixel sizes, pivots, provenance, status and useful anchors.
- `animations.json`: ordered frame IDs, frame rates/timing, triggers and status.
- `source/`: original image sheets, native backgrounds, articulated rig and reusable cutout pieces.
- `preview/index.html`: offline asset inspector. Double-click to inspect; it is not the game.
- `integration/`: role mapping, scale references, adapter code and honest QA checklist.

Keep English/Arabic strings in existing game code. All files are local; no CDN, online font, fetch call or API is needed for the inspector or asset adapter. Treat backgrounds as pictures only: decorative rocks in the brook are not collectible objects. Runtime stones are separate sprites with unique gameplay IDs.

## Biblical art notes

Ancient Near Eastern styling is illustrative, not archaeological reconstruction. The sling uses cord and pouch, never an elastic Y-frame. Armor is represented as bronze scale equipment. David's comic armor collapse is a teaching exaggeration, not a biblical factual claim. Do not add blood, decapitation, a depiction of God, magical projectile guidance, or a cross on Old Testament costumes.

## Remaining production gates

1. Polish/replace the provisional David action animations, including a convincing seated tumble and true kneeling pickup.
2. Complete carried-food locomotion: the standalone carry pose and walk poses are supplied, but no accepted basket-carry walk cycle exists. Keep the game's existing basket/arm animation or attach the separate basket during movement.
3. Refine armor openings and attachments. The loose helmet contains a shaded interior, not a fully cut-through face aperture; the provisional rig composites the face over it. Final production rig should use a proper foreground rim/cheek layer and background shell.
4. Inspect current game's graphics, then build an actual KEEP/ENHANCE/REPLACE audit. This library cannot establish what should be retained without the source or screenshots.
5. Integrate and test all five existing levels offline, including physics, incorrect drops, misses, retries, bilingual UI and classroom projection.

No tests of the existing game's behavior, collisions, scoring, controls or physics are claimed.
