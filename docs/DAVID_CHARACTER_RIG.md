# David character correction · 1.6.1

The previous version combined a cropped painted head with a geometric body. The
neck, shoulders, arms, clothing and legs had different proportions and material
styles. This version replaces that renderer across all five levels and the cover.

`src/assets/david-rig.png` is a new 1024×1536 transparent production illustration,
created from the supplied David design. The same curly hair, warm skin, ivory
linen, embroidered teal vest, terracotta sash and leather sandals are painted as
one full character. All original user-supplied artwork remains unchanged.

`src/hero.ts` uses one continuous head/neck/shoulder/torso surface, with painted
arms and legs isolated at runtime from the same illustration. There is no separate
portrait perched on a flat body. All skin, clothing and lighting share one source.
Textured triangle skinning bends the limbs continuously across their joints.
Two-bone IK makes the hands meet the existing prop grip positions. Sleeves cover
upper-arm roots; forearms are layered above clothing. Hands above sheep fleece
and food baskets use the same painted material. No flat oval mitten overlays.

The source is preloaded by Phaser, then runtime alpha masks/mesh topology are
cached once. The ordinary torso uses a direct high-quality image draw; posture
mesh deformation is needed only for the crouch/tumble/kneel. Arms and legs use
small alpha-occupied mesh cells. Whole-character breathing/bob, alternating gait,
arm swing, lift/carry, shared basket support/release, kneeling, armour tumble and
sling reach/follow-through use the same skeleton and proportions. The cover also
uses this rig instead of another David image.

Feet retain the existing world origin. Explicit prop grips remain world-relative:
body settling cannot move the hand away from a sheep/basket/sling attachment.
No gameplay model, maze, collision, timer, scoring, drop-zone, physics, story or
control rule is changed. English/Arabic text and mobile/PWA behavior are retained.
The 1.6.1 character correction left the model unchanged. Version 1.7.0 adds
persistent lateral facing to this rig, introduces branching maze generation and
sets all timed activities to 30 seconds; Free Play remains untimed.

`src/character-skin.ts` contains the pure two-bone transform. Tests check bind-pose
identity, exact elbow/hand attachment, finite overreach and continuity through a
bending joint. Browser QA exercises actual game poses, errors, completion, replay,
scaled touch and offline caching. `qa/david-before/` records the prior rendering;
current screenshots come from the rebuilt game, not a posed concept sheet.

The geometry and materials are consistent in every pose. Human animation/art
approval and physical-device performance still require review; automated checks
are not a substitute for those observations. See TEST_REPORT.md for executed
results and the managed browser's direct-file testing limitation.
