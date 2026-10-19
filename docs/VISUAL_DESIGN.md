# Storybook visual update — 1.2

All five missions now use locally bundled illustrated settings and detailed character or object textures. Gameplay models, maze geometry, forgiving input regions and story order are preserved.

## Art direction

Warm afternoon light, olive/sage greens, sandstone, linen, woven materials, deep
teal and restrained brass. Rich backgrounds frame uncluttered gameplay spaces.
English display type uses the local Georgia serif; Arabic uses system Tahoma/Arial
with shaped RTL captions. No hosted fonts or runtime network dependencies.

- **Cover:** specifically generated painterly countryside and transparent David
  illustrations, locally bundled. Character artwork and scenery stay separate,
  with subtle breathing and natural light particles.
- **Playable David:** editable articulated Canvas rig with curved linen, folds,
  embroidery, shaded limbs, illustrated eyes/curls, waving cloth,
  moving satchel and a visible bag opening. This matches the cover's costume,
  palette and identity while keeping the gameplay character poseable.
- **Brothers:** distinct full-body adult illustrations and welcoming arm poses.
- **Maze:** textured sand, individual shaded sandstone blocks, cap highlights,
  moss, soft directional shadows, camp table/vessels, animated goal flag and
  footstep dust. Every wall follows the existing graph, without concealed paths
  or decorative obstacles inside corridors.
- **Delivery:** an inset cinematic with a gentle camera settle, bag opening,
  bread lifting to David's hand, hand-to-hand transfer and sharing, then stars
  and music. Actual goal entry gates the scene; the celebration sound follows
  the visible handover. The complete four-second payoff still gates Continue.
- **Interface:** layered cream panels, brass mission badges, restrained gradients,
  tactile teal buttons, revised type hierarchy, and a reduced-motion alternative
  for the title entrance. Teachers retain all previous controls.

## Runtime and asset contract

`src/assets/countryside.png` and `src/assets/david-hero.png` were generated
specifically for this project with OpenAI image generation; they do not depend on
an external image host. The original generated PNGs are retained in editable
source. Vite embeds them into the classic script, keeping the delivered
`index.html` self-contained. Phaser preloads all nine PNGs before enabling Start/practice.

`src/scenery.ts` bakes static maze scenery once per maze seed. Characters, flag,
hint, food and particles remain separate animated layers. Only one cached maze
is retained. Painted title/maze frames skip the unused procedural background draw.

Gameplay anchors and geometry remain in logical 1280×720 coordinates. A short
mouse or touch press on a maze arrow registers a step immediately; holding still
repeats at the original movement cadence. World scaling does not change collision.
The diagnostic overlay remains development-only and disabled by default.

## Completed mission illustration passes

- Sheep: painted olive meadow, cream fleece, expressive animal faces, independently moving legs, lion mane and swaying tail. Pen fences still match the collision model.
- Armour: painted royal tent with embroidered fabrics, rugs and lamps; textured linen, chain links, bronze patina and leather sword/belt. The same item artwork appears in trays and on David. David retains his staged struggle, fall, removal and recovery.
- Brook: painted clear stream and lush banks, animated water highlights, five distinct smooth stone surfaces and three angular rock surfaces. Pickup and collection icons use those textures.
- Valley and encounter: detailed landscape and an original broad adult Goliath with bronze scale armour, shield, spear, startled and seated poses. Supporting brothers and Saul have separate adult illustrations.
- David: the approved hero illustration supplies his curls and face and the tunic texture. His articulated limbs, clothing, satchel and equipment preserve movement, collapse and food delivery. Limbs use shaded Canvas drawing rather than a newly generated pose sheet.

`src/painted.ts` trims cast cells by alpha once, uses explicit animal and prop component rectangles, then caches individual sprite surfaces. Original PNGs remain unmodified. The atlas frames are separate from gameplay hit regions. Goliath's forehead stays near the model's (1000,259) target; his spear is decoration.

The source retains editable illustrations, typed rendering helpers, and procedural fallbacks. Final human art review and physical-device performance testing remain useful release acceptance steps. The product specification remains `docs/GAME_BLUEPRINT.md`.

## Carry animation and countdown — 1.3
The sheep mission now has four sheep and replaces following with actual carrying. David bends both arms as the nearby sheep rises over 0.55s, his hands render in front of the fleece, and the sheep moves with him while running. Inside the pen, the sheep lowers over 0.4s to one of four visible slots. A separate timer card keeps the playfield clear and uses amber at 30s, terracotta at 15s, and explicit warning text. Catch staging is non-graphic. These mechanics follow the user’s later request; see IMPLEMENTATION.md for model rules.
