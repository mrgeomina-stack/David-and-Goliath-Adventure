# Worn armour alignment

The worn pieces now use body-specific layouts rather than centered tray-prop scaling. The tunic and coat of mail begin at David’s shoulder/neckline and leave the tunic hem visible. Empty neck and armhole cavities are masked out only in the cached worn copy, showing David’s real painted shirt and arm beneath the rims. The original tray artwork stays unchanged.

Worn clothing uses the same torso compression and body settling as David’s painted body, including the struggle and tumble. The belt follows his waist. The helmet is resized around his actual head, retaining the existing brief slip during the collapse. Saul’s equipment remains deliberately oversized.

Runtime changes: `src/costume.ts`, `src/hero.ts`. No changes to drop acceptance, controls, timer, scoring, collapse duration, sounds, story, or other levels.

Validation: 69 unit tests; production and standalone builds; real mouse and emulated touch dragging including wrong/cancelled drops, four correct drops, collapse and success. `scripts/armour-fit-check.mjs` captures each attachment and the strain/tumble/removal/recovery sequence through actual game inputs. Comparison screenshots and results: `qa/armour-fit/before/` and `qa/armour-fit/after/`.
