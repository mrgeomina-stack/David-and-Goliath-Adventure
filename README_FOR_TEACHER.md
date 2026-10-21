# David’s Big Adventure — teacher guide

For ages 5–8 · 1 Samuel 17 · Arabic + English captions by default.
Version 1.7.0: a cohesive high-resolution painted David with connected anatomy and textured animation across every activity and the cover. Supplied visual-assets-v1 artwork, mechanics, mobile controls, offline PWA, keepsakes, colourful instructions and the 30-second activity challenges are included.
Screenshots are in the separate QA ZIP; the playable ZIP contains the game.

**Phones and tablets:** Open the hosted HTTPS game in Safari (iPhone/iPad) or Chrome
(Android), then turn the device sideways. Use the large direction/action buttons,
swipe the maze, drag armour with a finger and tap stones. Sheep carrying supports
two fingers. Portrait rotation pauses a phone game safely. Use Safari Share → Add
to Home Screen, Chrome Install app, or the ＋ toolbar button. Open the installed app
online and wait for **Book → Offline ready** before going offline. See
[mobile/PWA instructions](docs/MOBILE_PWA.md). The Web ZIP needs an HTTPS static host;
the downloaded ZIP itself is not an installable game address.

**Start on a desktop:** Extract the offline ZIP completely and open `index.html` in Chrome or
Edge. Choose Easy, Normal or Free play, then **Let’s begin**. The game needs no
account, installation or internet. Rehearse on your classroom laptop first.

| Mission | Controls and goal |
| --- | --- |
| 1. Sheep | Arrows / WASD or big arrow buttons move David. Get close and press SPACE / **Lift sheep**. David raises one sheep into both hands; run through the opening on the pen’s right. He gently sets it down automatically. Repeat for all four. |
| 2. Maze | Follow real corridors using arrows / WASD, finger swipes or arrow buttons. Reach the flag beside the brothers’ camp and watch the food delivery. **Hint** reveals one next step. |
| Goliath’s challenge | Walk right to hear the giant, then return left to Saul’s tent. |
| 3. Armour | Drag each piece onto David: tunic and mail → chest, helmet → head, sword → waist. Alternatively, tap a piece, then its body part. Wrong drops return safely. Watch the full tumble and recovery. |
| 4. Brook | SPACE / **Scoop** when the moving ring reaches a smooth stone, or tap a smooth stone. Collect exactly five; jagged rocks do not count. |
| 5. Sling | Hold SPACE / **Hold-release** to whirl the two-cord sling; release to throw. Try a little past halfway. Too little or too much power misses. Only forehead/head contact wins. Retry freely. |

**Teacher controls:** Continue appears after each success animation. **Pause** / ESC
freezes play and offers mission replay; losing focus pauses safely. **Restart** asks
before returning to the title. **ع / EN** cycles bilingual → English → Arabic.
**Sound** mutes everything; audio starts after a click. Use fullscreen / F11 for a
projector. **?** opens help; **Choose a mission** opens practice from the title.

**Participation:** Make six teams of five. Everyone coaches, counts and cheers;
nominate one operator per mission. Five minutes is a classroom target, not a
measured typical duration or enough time for all thirty to touch the controls.
Easy and Normal give 30 active seconds in every activity. The shrinking bar begins green, fades to orange at 20 seconds and red below 10. David turns with left/right arrows, including when carrying. The maze includes several forks and detours that end later; turn back and try another route. The opening instruction card does not consume rescue time; moving dismisses it and begins the timer. David walks at 245px/s and runs at 290px/s while carrying. Completed armour equipment and the final brook pickup freeze the timer while their animations finish. A stone released before zero can complete its real flight. Other time-outs offer a fresh retry. At zero, the lion pursues an unprotected sheep; reaching one triggers a child-friendly catch and retry. Sheep already inside the pen stay safe. Pause freezes the countdown. Free Play shows ∞ and has no deadline or catch. The 30-second limit is the requested challenge; human difficulty calibration still needs supervised playtesting.

**Story:** The lion catches an unprotected sheep after the rescue deadline, without injury or graphic imagery. The armour fall is playful embellishment:
David was **unfamiliar with Saul’s armour**, not weak (17:39). Sling misses are game
retries; a real hit unlocks the canonical ending. Emphasize **“The battle is the
Lord’s” — 17:47** and trusting God. Read captions aloud; there is procedural sound,
optional narration uses installed local device voices, with captions always available. Muted play works.

**Before class:** Windows/Edge, speakers, projector readability and direct file
launch need rehearsal. This cloud browser blocks `file://`, so direct double-click
launch is unverified here; the bundled HTML passed a networking-disabled test.
If your school blocks local HTML, ask IT to permit it or serve the extracted folder
on an approved local server. See `TEST_REPORT.md` for evidence and limitations.

**The adventure book:** Open **Book** to pause and explore the illustrated chapter map. Real chapter completion adds a keepsake. Keepsakes persist locally when browser storage permits; the game still works without storage. Select a chapter for practice or close the book to resume. The book also contains the separate Music toggle.

**Voice:** The toolbar Voice button enables optional narration in the selected language (English for bilingual mode). Only installed local voices are selected. If none is available, a notice appears and captions remain. Sound off also stops narration. Narration quality and Arabic pronunciation depend on the installed device voice and should be checked before class.

**Child playtesting:** The teacher help menu includes an observation guide. The full printable worksheet is in `docs/CHILD_PLAYTEST.md`. No supervised sessions with children have been conducted by this development agent. Automated checks cover inputs, bounds, real completion, rewards, timer behavior and offline operation; they do not measure child comprehension or comfort.
