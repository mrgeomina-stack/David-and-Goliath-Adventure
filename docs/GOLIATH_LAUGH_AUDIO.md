# Goliath interlude laugh replacement

The uploaded `dragon-studio-evil-laugh-with-reverb-423668.mp3` is bundled locally
as `src/assets/audio/goliath-laugh.mp3`, byte for byte with no transcoding or
trimming. Source SHA-256:
`d30374e783280face758376e4c6a97992cdb5584a2842774e9e039d457f01ccd`.

The existing `giantLaugh` cue at 4.5 seconds now plays this recording instead of
synthesizing laughter. It uses the existing effects gain, mutes/pauses/stops with
the scene, reuses the decoded buffer on replay, and ducks background music for
the recording's actual duration. Stomps retain their original generated waveform.
Narration, interlude length, animation cues, all five activities and controls are
unchanged. The recording is included in the modular site's offline cache and in
the self-contained desktop HTML.

Validation: 68 unit tests pass, including recorded-buffer selection (no generated
laugh fallback), reuse, scene reset, mute and pause. Both production formats build;
the complete story is checked offline using real inputs and read-only QA state.
Build logs and measured results are under `qa/goliath-laugh/`.
