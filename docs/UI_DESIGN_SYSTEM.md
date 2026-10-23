# Adventure UI system · 1.9.0

The theme is implemented in `src/ui-theme.css`. `src/style.css` retains logical
1280×720 placement, responsive scaling and native-size touch targets. The new theme
loads last, so future changes can tune colours and materials without editing game
models or hit geometry. This release changes presentation only.

## Components

| Component | Reusable classes / selectors | Treatment |
| --- | --- | --- |
| Primary action | `.ui-button`, `.ui-button--primary`, `.primary` | Coral gradient, cream highlight, dark outline and raised lower edge. |
| Secondary action | `.ui-button--secondary`, `.text-button` | Pale teal gradient and darker teal depth. |
| Popup / card | `.ui-panel`, `#modal`, `#message`, `#tutorial` | Teal outer frame, cream inner frame, accent cap, highlight and soft shadow. |
| Status / scripture | `.ui-chip`, `#progress`, `#sheep-clock` | Pill framing; gold for rank/emphasis, sky blue for counters. Timer colours retain their gameplay meaning. |
| Instruction | `.tutorial-art`, `.tutorial-copy` | Gold vector medallion, sky reading surface and clear heading/body hierarchy. |
| Mission map | `.chapter-art`, `.chapter-label`, `.chapter-copy`, `.chapter-tick` | Raised icon tiles, chapter numbers, SVG arrows/checks, independent language blocks. |
| Teacher help | `#modal-content`, `#modal-actions` | Scrollable reading area with controls remaining visible. |
| Canvas label | `gameCard()` in `src/art.ts` | Matching vector frame for story text, scripture, armour trays and sling status. Positions stay unchanged. |

Tokens include `--ui-font`, `--ui-ink`, palette accents, radius tokens,
`--ui-lift` and `--ui-inset`. Buttons define default, hover, pressed, keyboard focus
and disabled treatments. Touch hover and reduced-motion preferences are respected.
Use the existing logical layout classes for geometry and the theme classes for skin.

## Typography and languages

Bundled variable WOFF2 fonts: Nunito Latin (Fontsource 5.3.0) and Noto Sans Arabic
(Fontsource 5.3.0). Both use the SIL Open Font License; complete notices are in
`docs/NUNITO_OFL.txt` and `docs/NOTO_ARABIC_OFL.txt`. Arabic and English stay editable
in TypeScript. Long bilingual paragraphs and mission names have separate isolated
RTL/LTR spans; Arabic uses no Latin letter spacing. English/Arabic-only modes remain.

`src/main.ts` imports the theme after the layout stylesheet. `scripts/offline.mjs`
embeds the Vite-built CSS, including the theme and data-URL fonts, in production HTML.
The game needs no external font host or rasterized text assets.

## Files changed

- `src/ui-theme.css`: new shared design system and responsive visual overrides.
- `index.html`: reusable component classes; no structural game-flow changes.
- `src/main.ts`: theme import, bilingual presentation spans, modal visual kind,
  component classes and decorative SVG status icons.
- `src/art.ts`: shared vector card and matching Canvas text font stack.
- `src/world.ts`: drawing calls for existing label/card surfaces only.
- `scripts/offline.mjs`: embed compiled CSS so font assets remain self-contained.
- `scripts/ui-redesign-check.mjs`: required screen captures, bilingual popup bounds,
  font readiness, teacher scrolling and footer visibility.
- `scripts/ui-comparison.mjs`: browsable before/after gallery and paired screenshots.
- `scripts/ui-offline-check.mjs`: checks that both bundled fonts load offline.

The baseline is commit `aa4993cd4aef88479d5555fb77e4d9a5812b91c4` (v1.8.0).
`qa/ui-redesign/before` contains actual baseline captures. The corresponding `after`
captures, phone/tablet variants and gallery are in the same directory. Extract the
UI comparison ZIP and open `index.html` to browse all five requested pairs.
