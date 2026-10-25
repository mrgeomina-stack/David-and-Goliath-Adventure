# David’s Big Adventure — teacher guide

For ages 5–8 · 1 Samuel 17 · Arabic + English captions by default.
Version 1.12.0: a cohesive high-resolution painted David with connected anatomy and textured animation across every activity and the cover. Supplied visual-assets-v1 artwork, mechanics, mobile controls, offline PWA, keepsakes, colourful instructions and the 30-second activity challenges are included.
The supplied music loops quietly after the first tap or click, with automatic volume reduction during voice guidance. UI buttons have soft pop feedback; global mute silences all audio. Pause also pauses the music.
Screenshots are in the separate QA ZIP; the playable ZIP contains the game.

**Phones and tablets:** Open the hosted HTTPS game in Safari (iPhone/iPad) or Chrome
(Android), then turn the device sideways. Use the right-side two-circle joystick and action buttons,
tap a nearby sheep once to lift it, drag armour with a finger or steer the hand,
and select stones as the ring passes. Sheep carrying supports
two fingers. Portrait rotation pauses a phone game safely. Use Safari Share → Add
to Home Screen, Chrome Install app, or the ＋ toolbar button. Open the installed app
online, choose **Book → Save for offline play**, then wait for **Offline ready**. See
[mobile/PWA instructions](docs/MOBILE_PWA.md). The Web ZIP needs an HTTPS static host;
the downloaded ZIP itself is not an installable game address.

**Start on a desktop:** Extract the offline ZIP completely and open `index.html` in Chrome or
Edge. Choose Easy, Normal or Free play, then **Let’s begin**. The game needs no
account, installation or internet. Rehearse on your classroom laptop first.

| Mission | Controls and goal |
| --- | --- |
| 1. Sheep | The joystick or arrows / WASD move David. Get close and tap a sheep once, or press SPACE / **Lift sheep**. David raises one sheep into both hands; run through the opening on the pen’s right. He gently sets it down automatically. Repeat for all four before the timer expires, then rescue a fifth lamb in the lion encounter. |
| 2. Maze | Follow real corridors using arrows / WASD, finger swipes or the joystick. Reach the flag beside the brothers’ camp and watch the food delivery. **Hint** reveals one next step. |
| Goliath’s challenge | Watch Goliath stomp, laugh and challenge the army. Then guide David left to Saul’s tent and press SPACE / Speak to volunteer. Spoken guidance is on initially. |
| 3. Armour | Drag and drop each piece onto David: tunic and mail → chest, helmet → head, sword → waist. Wrong drops return safely. Watch the full tumble and recovery. |
| 4. Brook | Steer the hand and **Scoop**, or press SPACE when the moving ring reaches a smooth stone, or tap a smooth stone while the ring passes it. The circle moves continuously without pausing over scattered stones. Collect exactly five; jagged rocks do not count. |
| 5. Sling | Pull and hold the circle, or hold SPACE / **Hold-release** to whirl the two-cord sling; release to throw. Try a little past halfway. Too little or too much power misses. Only forehead/head contact wins. Retry freely. |

**Teacher controls:** Continue appears after each success animation. **Pause** / ESC
freezes play and offers mission replay; losing focus pauses safely. **Restart** asks
before returning to the title. **ع / EN** cycles bilingual → English → Arabic.
**Sound** mutes everything; audio starts after a click. Use fullscreen / F11 for a
projector. **?** opens help; **Choose a mission** opens practice from the title.

**Participation:** Make six teams of five. Everyone coaches, counts and cheers;
nominate one operator per mission. Five minutes is a classroom target, not a
measured typical duration or enough time for all thirty to touch the controls.
Easy and Normal give 36 active seconds for the four sheep, 30 seconds for the maze, armour and brook, and unlimited time for the final sling encounter. The sheep bar begins green, fades to orange at 24 seconds and red below 12; the maze, armour and brook bars use 20 and 10 seconds. David turns with left/right arrows, including when carrying. The maze includes several forks and detours that end later; turn back and try another route. The opening instruction card does not consume rescue time; moving dismisses it and begins the timer. David walks at 245px/s and runs at 290px/s while carrying. Completed armour equipment and the final brook pickup freeze the timer while their animations finish. A stone released before zero can complete its real flight. Other time-outs offer a fresh retry. At zero, the lion pursues an unprotected sheep; reaching one triggers a child-friendly catch and retry. Sheep already inside the pen stay safe. Pause freezes the countdown. Free Play shows ∞ and has no deadline or catch. The 30-second limit is the requested challenge; human difficulty calibration still needs supervised playtesting.

**Story:** The lion catches an unprotected sheep after the rescue deadline, without injury or graphic imagery. The armour fall is playful embellishment:
David was **unfamiliar with Saul’s armour**, not weak (17:39). After a sling miss, Goliath laughs and the sling readies automatically without a retry popup; a real hit unlocks the canonical ending. Emphasize **“The battle is the
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

**New sound:** Successful sheep lifts play your sheep recording. The lion gives occasional gentle growls. Your victory recording plays once after each completed mission. Voice starts on; English/Arabic Goliath and Saul guidance has bundled synthetic fallback speech when a local voice is unavailable. Sound mutes all audio; Voice controls speech separately. See [audio and encounter notes](docs/AUDIO_AND_ENCOUNTER.md).

**New interface:** Coral buttons are the main actions; teal controls are secondary actions. Framed blue instruction cards and gold chapter badges share the same visual style. Teacher help scrolls inside its card while Resume and guide buttons stay visible. Arabic and English have separate reading blocks; both fonts are included offline. The touch joystick is documented in [the controls guide](docs/JOYSTICK_CONTROLS.md).


**Lion encounter:** Deliver four sheep normally. An additional fifth lamb's rescue has two
large green timing windows. Press SPACE, tap the action button/the playfield, or
press the standard gamepad south button (A/Cross) while the marker is green. On
Easy the green window lasts 2.1 seconds; Normal allows 1.7 seconds. Misses offer
unlimited retries of that part. The rescue timer pauses at this checkpoint, and
four safe sheep remain in the pen. Holding a button cannot clear both challenges.
A standard controller's left stick or D-pad moves David during normal rescues.
The story is a gentle dramatization inspired by 1 Samuel 17:34–37; the lion is
defeated and retreats without blood or graphic injury. All text stays editable.


**New story scenes:** After the sheep celebration, Continue opens Jesse’s food
handover. Watch the request, handover and farewell, then choose **Deliver the food**
or press SPACE. After the maze delivery, Continue opens Goliath’s solo challenge.
The two stomps and low boastful laugh precede his spoken challenge. Choose
**Return to Saul** or press SPACE, then guide David left to the tent and Speak.
Each scene has **Replay**, English/Arabic captions, bundled fallback narration,
pause and mute. The scenes never use the 30-second gameplay allowance or award
extra keepsakes/victory tracks. The first Continue becomes available after 17
seconds; the giant scene allows 22 seconds so the longer Arabic guidance can
finish. Waiting longer is fine. Practice chapters keep their direct return to the
book/title, without forcing story scenes. Scene artwork follows the supplied
illustrations; small motion and camera shake respect reduced-motion preferences.
