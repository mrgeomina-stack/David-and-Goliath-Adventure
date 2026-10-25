# Continuous David versus Goliath encounter

A real ballistic miss now triggers the existing locally bundled Goliath laugh recording and a short animated taunt. After 1.1 seconds the sling automatically readies another stone with zero charge and a clean trail. The scene remains in play: there is no retry popup, mission reset, score/progression reset, or attempt limit. A later miss restarts the laugh rather than stacking several recordings.

The final sling activity is untimed in Easy, Normal and Free Play, so a deadline cannot interrupt repeated throws. Its existing status shows infinity. Other levels retain their own time limits. Keyboard SPACE, the action button and native touch joystick all retain hold/release charging. Cancelling a drag does not release a projectile. Pausing freezes both the taunt and sound.

All flight constants, charge strengths, forehead collider and weak/strong miss trajectories are unchanged. No projectile is launched while the brief miss reaction is playing. The standing target returns before the next charge, retaining the real visual/collision alignment. A genuine forehead collision stops the laugh and runs the existing stunned, forward-fall, face-down, impact and victory sequence.

Changed runtime files: `src/model.ts` (automatic miss recovery), `src/world.ts` (final-stage timer, miss reaction and hit routing), `src/main.ts` (no miss popup and untimed status), `src/audio.ts` (one laugh source, stoppable on hit), and `src/strings.ts` (editable bilingual help). No new assets, dependencies or services.

Evidence: `qa/sling-retry/`; unit tests cover repeated weak/strong misses followed by a genuine hit and retain hit state. Browser checks exercise three misses in one attempt, automatic recharge, no popup, taunt pause/resume, continued Normal play beyond 30 seconds, keyboard and native touch controls, then the actual winning collision and victory transition. The standalone offline landing check also covers impact timing, pause, replay and mute.
