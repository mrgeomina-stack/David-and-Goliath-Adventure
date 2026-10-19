# Illustration assets

These PNGs were generated specifically for this game's storybook visual update
using OpenAI image generation. They are embedded locally by Vite; no runtime CDN.

- `countryside.png`: 1672×941, original RGB PNG. Warm ancient Israel countryside,
  olive tree and camp at right, quiet sky at left for title typography.
- `david-hero.png`: 1024×1536, original RGBA PNG. Cover illustration of the young
  shepherd, cream embroidered linen, teal headcloth, terracotta belt, woven food
  bag, wooden staff and sandals. Transparent edges preserve the painted light.

The cover illustration is separate from the articulated `art.ts` gameplay rig.
See `docs/VISUAL_DESIGN.md` for palette, layering and subsequent asset requirements.

Version 1.2 adds original 1672×941 RGB backgrounds: `meadow.png`,
`royal-tent.png`, `brook.png`, `valley.png`.

- `animals-atlas.png`: 1448×1086 RGBA; fleece body, sheep head and legs, lion body/head/legs/tail, fleece tuft, grass and jug. The authored component rectangles live in `painted.ts`; they do not use uniform grid cropping.
- `props-atlas.png`: 1448×1086 RGBA, 4×3; tunic, mail, helmet, sheathed sword/belt; five smooth mineral pebbles; three angular rocks.
- `cast-atlas.png`: 1536×1024 RGBA, 3×2; standing, startled and seated Goliath; two adult brothers; Saul.

All nine original PNGs are embedded in the offline HTML. Runtime sprite caching does not modify the source artwork.
