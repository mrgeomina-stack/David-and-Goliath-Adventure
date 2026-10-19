# Storybook visual update — 1.1

This iteration establishes the new art direction in the **title screen, David's
character, food-delivery maze and delivery cinematic**. The five playable missions
and story order remain intact. The sheep, armour, brook and finale benefit from
the shared character/UI updates; their complete environment illustration passes
are future milestones, not claimed as completed here.

## Art direction

Warm afternoon light, olive/sage greens, sandstone, linen, woven materials, deep
teal and restrained brass. Rich backgrounds frame uncluttered gameplay spaces.
English display type uses the local Georgia serif; Arabic uses system Tahoma/Arial
with shaped RTL captions. No hosted fonts or runtime network dependencies.

- **Cover:** specifically generated painterly countryside and transparent David
  illustrations, locally bundled. Character artwork and scenery stay separate,
  with subtle breathing and natural light particles.
- **Playable David:** editable articulated Canvas rig with curved linen, folds,
  embroidery, dimensional skin, detailed eyes/curls, blinking, waving cloth,
  moving satchel and a visible bag opening. This matches the cover's costume,
  palette and identity while keeping the gameplay character poseable.
- **Brothers:** taller adult proportions, distinct cloth palettes, mature eyes,
  beards on two brothers, and welcoming arm poses.
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
`index.html` self-contained. Phaser preloads both before enabling Start/practice.

`src/scenery.ts` bakes static maze scenery once per maze seed. Characters, flag,
hint, food and particles remain separate animated layers. Only one cached maze
is retained. Painted title/maze frames skip the unused procedural background draw.

Gameplay anchors and geometry remain in logical 1280×720 coordinates. A short
mouse or touch press on a maze arrow registers a step immediately; holding still
repeats at the original movement cadence. World scaling does not change collision.
The diagnostic overlay remains development-only and disabled by default.

## Next illustration passes

1. Sheep hillside: original illustrated sheep/lion, animated olive grove and pen.
2. Armour tent: layered fabrics, richer bronze/mail materials and Saul's identity.
3. Brook: water transparency/refraction, bank foliage and more dimensional stones.
4. Valley: a bespoke Goliath rig, battlefield depth, banners and stronger impact
   staging. Preserve the precise forehead collider and physically computed shots.

Future asset replacements should use transparent layered sprites at twice their
logical display size, preserve the current body/drop anchors, and keep textures
bundled. The product specification remains `docs/GAME_BLUEPRINT.md`.
