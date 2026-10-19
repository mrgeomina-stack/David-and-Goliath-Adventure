# DAVID'S BIG ADVENTURE — CODEX MASTER BLUEPRINT

**Document version:** 1.0 — 19 October 2026  
**Status:** Authorized implementation specification; supersedes and discards every version of the previous game.  
**Project:** Five distinct, arcade-quality mini-games retelling David's encounter with Goliath for a Coptic Orthodox Sunday School class.  
**Owner's instruction:** Build the real playable game, not a clickable story, template, quiz, mockup, or technical demo.  
**Primary audience:** Thirty children, approximately six years old, projected classroom screen, one instructor-operated Windows laptop.  
**Desired run time:** Approximately five minutes for a successful run; retries may extend it.  
**Implementation target:** Fully offline, downloadable browser game; desktop Chrome/Edge; primarily 16:9 display.

---

## 0. COPY/PASTE INTO CODEX — EXECUTION BRIEF

You are the lead game developer, technical artist, game designer, and QA engineer. Create a **complete, polished, offline-browser game** called **David's Big Adventure** from the attached master specification. You must implement **all five fully playable mini-games** in the prescribed story order. The user rejected a prior version for fake gameplay, repeated questions, and obvious static goals; **none of those patterns may return**.

Start by inspecting the available development environment. Set up the project, implement real input/collision/physics mechanics, build original and visually consistent animated art, add sound, provide bilingual Arabic and English interface text, and run automated plus hands-on browser tests. Perform screenshot and gameplay verification for every level at start/middle/success/failure. Fix issues before reporting the project as complete. Do not claim visual, audio, gameplay, or offline testing unless you have actually performed it.

**Required output:** A working game launched by opening `index.html` offline, a ZIP containing the entire distribution, `README_FOR_TEACHER.md`, `TEST_REPORT.md`, and editable source. Deliver playable code and files, not just a plan. Do not stop after scaffolding or the first mini-game. If an image or audio generation capability is unavailable, use polished self-contained SVG/Canvas illustrations and procedural audio rather than silently omitting art or sound. No CDNs or network-dependent assets.

**Critical specifics:** Level 2 is a genuine maze to David's brothers with a cinematic food-delivery payoff. Level 3 uses mouse drag-and-drop of Saul's distinct clothing/armor pieces onto anatomically correct regions of David; after dressing, he visibly struggles and **falls gently in a comic dramatization**, removes the gear and walks freely. Level 5 is an original physics-based sling game with **hold SPACE to charge and RELEASE SPACE to fire**, real parabolic flight, real collision and real misses; correct contact with Goliath's forehead wins, missing loses that round. It should have the energetic satisfaction of a child-friendly projectile game **without copying Angry Birds' artwork, level design, UI or branding**. Preserve the other three full mini-games too. Design and test for six-year-olds.

Follow the remaining blueprint as binding acceptance criteria. Do not substitute a quiz, predetermined hit animation, fake choice, autoplay victory, auto-success after time-out, or a reused mini-game with cosmetic changes. Prioritize actual playability, accurate story order, and visual polish over optional features.

---

## 1. EXPERIENCE, NON-NEGOTIABLES, AND CLASSROOM REALITY

### Player experience

The audience must feel as though they control David's adventure: move, navigate a real maze, dress a character by dragging armor, make skill-based pickups, and judge the precise moment to release the sling. Reward the right actions with **immediate visual and sound feedback**. Every level must have an authentic challenge, visible progress, and a celebratory payoff. Story narration is concise and mostly handled by on-screen illustrations and optional spoken guidance from the teacher.

### Absolutely required

1. Five different mechanics across five levels; **zero repeated Q&A prompts**.
2. No recycled target position or staged reward that a child can simply click every time.
3. Original colorful, rich, cohesive, cartoon game art; expressive characters and readable animation.
4. Real interactions with **observable consequences**. Correct input causes success; wrong input can cause failure, not a scripted automatic win.
5. Responsive 16:9 composition designed first for 1280 × 720, scaled to 1920 × 1080 and classroom projection.
6. One consistent young shepherd David; giant, clearly recognizable but not frightening Goliath.
7. No gore, blood, death imagery, decapitation, jump scares, or ridicule directed at children. Goliath can fall dramatically but non-graphically.
8. Works completely offline using local resources; no accounts, API keys, telemetry, CDNs, service worker requirement, or installation.
9. Teacher can pause/resume, mute/unmute, toggle language, restart, and go fullscreen.
10. All five levels must be completable by genuine inputs and must be play-tested, including failure paths and repeat plays.

### Honest time/participation constraint

Thirty individual keyboard or mouse turns across five actual mini-games **cannot be guaranteed in a five-minute whole-class session** with one projector and one input device. Default to a **cooperative classroom mode**: six teams of five participate by coaching, voting, cheering, and counting, while one rotating representative physically controls the screen for each mission (about five primary operator turns per playthrough). Teachers can select a different child on replay. Make **untimed/free-play mode** available for extended rotating turns. Do **not** falsely advertise that all 30 each receive a physical control turn in the five-minute mode. Avoid forcing children to walk up to the projector and exchange seats repeatedly.

### Timing envelope (target, not hard cutoffs)

| Segment | Successful target |
|---|---:|
| Title + how to play | 12 seconds |
| 1. Protect the Sheep | 43 seconds |
| 2. Food Delivery Maze | 55 seconds |
| 3. Saul's Heavy Armor | 47 seconds |
| 4. Five Stones from the Brook | 43 seconds |
| 5. David vs. Goliath | 72 seconds |
| Transitions and final celebration | 25 seconds |
| **Total** | **297 seconds (~5 minutes)** |

A child may take longer; never fake success, silently skip a failure, or interrupt a cutscene mid-payoff merely to meet the timer. Transitions should be brisk (typically 1–3 seconds). In-class mode: a teacher can choose **Easy / Normal** difficulty and press a clear **Hint** button if needed, without taking away the child's meaningful final move. Do not put per-level countdowns in the child's face unless mechanically relevant.

---

## 2. BIBLICAL EDITORIAL POLICY — IMPORTANT

**Primary source:** 1 Samuel 17, especially verses 12–20, 22–23, 32–40 and 48–50; David's account of protecting sheep is in verses 34–37.

**Narrative order:**

1. David has experience protecting his father's sheep (brief playable flashback or prologue).
2. Jesse sends David with food to his brothers; David leaves sheep with a keeper and travels to the Israelite camp.
3. Goliath challenges Israel; David speaks with Saul, and Saul gives him armor.
4. David tries Saul's tunic/coat of mail, bronze helmet and sword, but rejects this unfamiliar equipment.
5. David chooses **five smooth stones** from a brook, carrying his shepherd's bag and a **cord-and-pouch sling**.
6. David faces Goliath trusting God, casts **one stone**, and it strikes **Goliath's forehead**. The ending emphasizes God's help and courage, not violence.

**Critical correction — armor:** The passage does **not** say David was inherently weak or could not support the sheer weight. It says he was **not used to / had not tested** the armor and could not walk with it. The user's specifically requested comic collapse must remain, but frame it unmistakably as **playful visual exaggeration**, not a historically claimed event. The on-screen line is: **"This armor isn't right for me!" / «الدرع ده مش مناسب ليا!»** followed by **"David wasn't used to Saul's armor." / «داود ماكانش متعود على درع شاول.»** Never state “David was too weak.”

**Critical correction — sling:** A period-appropriate shepherd's sling is **two cords and a pouch**, whirled and released. It is **not a rubber elastic Y-shaped slingshot**. Honor the user's intention—hold-to-charge, skill-based trajectory and powerful satisfying shot—by animating increasing sling rotation and angular speed while SPACE is held; SPACE release opens one cord and launches the stone at a controlled release angle. Model the projectile with real gravity, not a predetermined arc. A subtle elastic-feeling power meter is permitted as UI, **not** an anachronistic rubber weapon. Keep the game original, not an Angry Birds clone.

**Historical and Coptic sensitivities:** Ancient Israel costumes and landscapes, no medieval European castles, no modern clothing, no historically anachronistic crosses in Saul's camp, no attempt to depict God as a person, no invented divine light beam physically steering the stone, no unnecessary violence. The takeaway is **"The battle is the Lord's" (1 Samuel 17:47)** and **"God gives us courage when we trust Him."** Use a prayerful, warm tone suitable for a Coptic Orthodox primary class, but do not introduce invented quotations as Scripture.

**Helpful source links for editorial verification:**
- Bible Gateway, NKJV 1 Samuel 17: https://www.biblegateway.com/passage/?search=1%20Samuel%2017&version=NKJV
- Biblical Archaeology Review, *Taking a Sling*: https://library.biblicalarchaeology.org/article/taking-a-sling/

---

## 3. COMPLETE LEVEL-BY-LEVEL SPECIFICATIONS

### LEVEL 1 — PROTECT THE SHEEP!
**Narrative:** David cared for his flock long before facing the giant. His courage and care are established. A friendly, non-graphic lion at a distance increases urgency, evoking his account of protecting sheep.

**Scene:** Sunny hillside with flowers, gently moving grass, an open sheepfold at lower left, a distant tree, sheep roaming with independent movement, David by the hillside path. Rich hand-built/illustrated elements and subtle parallax; the **camera remains stable enough for gameplay**.

**Controls:** ARROW KEYS or WASD to move David. SPACE when near a sheep to call it; called sheep follows David, slowing or wandering when blocked. On-screen directional buttons and CALL button for mouse fallback. Never use a random highlighted “golden sheep.”

**Real gameplay:** Two or three sheep are loose at randomized, fair reachable spawn points. David must approach within a realistic 55–80-pixel proximity zone, call a sheep, and guide it through the pen opening. Sheep follow via a basic steering behavior; fence collisions work. The lion approaches along a visible patrol path; as a child moves David close, it retreats. If lion gets too close to a sheep, it becomes startled and runs to a nearby safe location (no devouring, gore, or trauma), costing a few seconds. Success requires at least **two sheep in the pen**; tune pacing to 40–45 seconds.

**Feedback:** Sheep turns head and bleats when called; sheep hopping into pen increments 0/2 → 1/2 → 2/2; lion growls softly from the distance and backs off; subtle dust puffs and happy music stinger.

**Success animation (2–3 sec):** Sheep hop happily beside David; he raises the staff, evening sunlight brightens. Caption: **"David protected his sheep!" / «داود حمى خرافه!»** Fade through a quick illustrated map path toward the army.

**Failure:** If a time target is exceeded, a softly worded retry appears, not an automatic success. Teacher's hint points toward an overlooked sheep or the pen entrance. No punitive or alarming end screen.

**Acceptance:** Sheep actually move and follow; pen collision actually determines scoring; lion proximity changes behavior; win cannot trigger before required sheep are inside; randomized starting arrangements remain fair.

### LEVEL 2 — FOOD DELIVERY MAZE (USER'S IDEA)
**Narrative:** David carries food to his brothers at the Israelite camp. The child must **solve a real maze** to reach them.

**Scene:** A lush, hand-illustrated overhead or 3/4-isometric countryside maze with paths framed by stones, low shrubs, tents and supply wagons. David starts at a clearly marked entrance with a woven food bag. His brothers visibly await him outside a cluster of Israelite tents at the far end. Their location is known but the route is **not obvious**.

**Controls:** ARROW KEYS/WASD to move one corridor step or continuously with robust wall collisions. Optional four large arrow controls for teacher mouse use. A tactile 120–180 ms movement tween avoids instant teleporting.

**Maze requirements:** Genuine navigable corridors, **multiple dead ends and decisions**; no visible golden guiding trail, no rotating question overlay, and no “walk in one straight line to win.” Generate using depth-first carving, randomized Prim, or select among **at least three authored, pretested mazes**. Target approximately 9×7 or 11×7 logical cells (adjust to visual clarity), solvable and never blocked by decorative props. Use a shortest-path solver in QA to verify that each maze has a single reachable start-to-finish solution and meaningful choices. For six-year-olds aim 12–22 meaningful movements to finish, not a labyrinth that causes frustration. Use a visible timer bar only if needed; provide a teacher Hint that briefly pulses **the next correct junction**, not the whole route.

**Interactions:** David carries the food throughout, moves naturally, and bumps gently against a wall if a bad direction is selected. Nothing asks a repeated question. Brothers move/gesture from the end-zone.

**Victory trigger:** David must cross the maze path to the brothers' precise goal zone. **Entering goal starts a 3–4 second skippable-but-default-on celebration:** David runs up, opens his bag, gives bread/food to his brothers; they smile, accept it and welcome him; subtle crowd cheer and little illustrated floating stars; a cinematic cut to the battlefield reveals Goliath towering in the distance. No premature award before handing off food.

**Failure:** Hitting a wall is a harmless bump. Optional timeout asks to retry or use one-step Hint, **never teleports David automatically to the brothers**.

**Acceptance:** All mazes demonstrably solvable; doors/openings align with physical collisions; the child must navigate; celebration visibly shows food transferring from David's hands/bag to his brothers' hands; no stale shortcut permits instant win.

### LEVEL 3 — SAUL'S HEAVY ARMOR: DRESS DAVID! (USER'S REVISED IDEA)
**Narrative:** Saul offers David his equipment. David finds it unfamiliar and cannot move comfortably in it.

**Scene:** A beautiful royal military tent. David, initially in simple shepherd's clothes, stands **large and centered**. Distinct loose items float or rest around him on side trays, with consistent drag handles; the cursor changes appropriately. Saul can be present in a restrained secondary position.

**Equipment and anatomical snap targets:**
1. **Saul's tunic** → torso, under subsequent mail;
2. **Coat of mail / metal armor** → torso over tunic;
3. **Bronze helmet** → head;
4. **Sword + belt/scabbard** → waist/hip (correct biblical detail: sword strapped over armor).

**Control and hit testing:** Mouse pointer down → drag item → pointer up in its relevant **generous invisible body zone** → snap smoothly and fit correctly to David's posture. Pointer up outside valid region → item gently returns and shakes, no penalty. Correct snap makes a satisfying soft metallic CLANK. Use pointer events for mouse and touch. Avoid native HTML5 drag-drop because it is unreliable for mouse + touch scaling; implement coordinate-normalized custom drag based on rendered canvas/SVG bounds. If layering order matters, either lock/guide the next item or maintain correct z-index independent of drop order. All four items must fit distinctly; never depict helmet clipping into head or sword across David's face.

**Progressive comic response:** After first piece, David notices its size; after second, shoulders sag; helmet makes his head wobble; sword causes clumsy movement. **Only once all four pieces are on** does the dramatic outcome trigger; no fake fixed-time collapse before all correct drops.

**Mandatory complete comedy animation (5–7 seconds):**
- 0.0–0.7 sec: proud David takes a breath and tries a step;
- 0.7–1.7 sec: knees shake, heavy gear clanks, helmet tips forward;
- 1.7–2.8 sec: David leans sideways then **falls gently onto his bottom/back** with a soft, humorous thump;
- 2.8–3.6 sec: helmet drops over his eyes, comical wobble and pause (never show injury);
- 3.6–5.0 sec: David sits up, takes off gear or gear separates in a comical but believable motion;
- 5.0–6.5 sec: David stands comfortably in shepherd clothes and takes a few confident steps, sling in hand.

**Education copy:** "This armor isn't right for me!" / «الدرع ده مش مناسب ليا!» then small caption "David wasn't used to Saul's armor." / «داود ماكانش متعود على درع شاول.» The fall is clearly playful embellishment, not Scripture verbatim.

**Success trigger:** All four correct drop operations, then finish full payoff animation and unlock brook level.

**Failure:** Incorrect drops reset only that piece. No quiz and no arbitrary loss. An item wiggles after 6 seconds of inactivity. Optional tap-to-select then tap target accessibility mode.

**Acceptance:** All four separate pieces can be moved; each only snaps onto correct region; character is visibly dressed with all items; dramatic tumble is **not merely text, shaking, or a static picture**; gear visibly removed and David proceeds unarmored.

### LEVEL 4 — FIVE SMOOTH STONES FROM THE BROOK
**Narrative:** David selects **exactly five smooth stones** from the stream and puts them in his shepherd's bag.

**Scene:** A shallow, sparkly brook with **stationary** stones under moving water, foam and flowing leaves, riverbank plants and sunlight. David kneels near the shore. There are 8–10 distinguishable visible stones; at least five are smooth and round, others irregular/jagged. Do not show stones improbably drifting downstream; animate the water and leaves, not the buried stones.

**Mechanic:** A player-controlled or automatically traveling selection ring moves along the bank/underwater stones. Simple version recommended: **SPACE to scoop when the moving ring passes over a smooth stone**; optional mouse click directly on a stone (with small splash) as accessible fallback. Ring position has actual timing, moves at a tunable speed and bounces at boundaries. A scoop performs a real nearest-stone hit test in a forgiving radius, and only a smooth, uncollected stone increments the count. Jagged rocks trigger a funny "plop" and 0.4-second recovery, not progress. Avoid an instantly obvious fixed sequence; randomize fair arrangements from validated layouts without hiding targets beyond perception.

**Progress:** Five large pebble icons fill one by one beside a woven bag. Each right stone animates from stream into the bag. The teacher can point out differences between jagged and smooth rocks. Count exactly **5/5**.

**Success animation (2–3 sec):** Fifth stone drops into bag with a sparkle, David closes it, stands with his sling, and the camera transitions to a wide valley showing Goliath.

**Failure:** No artificial auto-win or unearned stone pickups. On a time limit, offer retry or accessible slower reticle. No forced reset to zero for one mistaken rock unless teacher chooses Hard mode (not needed for children).

**Acceptance:** Real coordinate-based timing or hit-testing; exactly five unique smooth stones must be acquired; impossible to double-count the same stone; miss or jagged selection does not increment count.

### LEVEL 5 — DAVID VS. GOLIATH: PHYSICS-BASED SLING FINALE (USER'S IDEA)
**Narrative:** David faces Goliath in the valley, confident in God. He fires a stone that strikes Goliath in the forehead. Final victory is dramatic but entirely non-graphic.

**Look:** Original, vibrant, side-on 2D animated projectile-game stage with rich layered landscape and strongly readable silhouettes. Young David stands on left in simple tunic, with shepherd's bag and an authentic **two-cord leather/cloth sling**; giant armored Goliath stands on right, shield bearer optional in background. Dynamic dust, breeze, anticipation animation, strong camera/sound payoff. Do **not** copy Angry Birds character designs, fonts, slingshot geometry or UI. Goliath must be significantly taller than David and look formidable but not horrific.

**One-button controls (mandatory):**
- On first eligible **SPACE keydown**: enter CHARGING; David spins his sling, power smoothly rises, sound accelerates, the meter becomes brighter; no projectile yet. Ignore auto-repeated keydown events.
- While SPACE remains down: continuous charge calculation **from actual hold time** (not number of frame draws). Holding longer increases tangential launch speed, to a defined cap. Use animation to indicate underpowered, plausible, and overpowered stages without marking an exact cheat-green timing zone.
- On **SPACE keyup**: release one sling cord at a consistent game-defined angle and launch the actual projectile; no delayed fake auto-hit. Power freezes at release. Additional keypresses while airborne do nothing.
- After launch: ballistic stone flight, camera stays wide enough to watch its arc and Goliath, subtle stone streak if fast, collision vs Goliath's **forehead/head hitbox**. Impact produces hit spark/dust, giant reels and falls safely; other trajectories visibly miss and **lose the round**.
- Optional screen-accessible **HOLD / RELEASE** button using pointerdown/up, identically implemented for teachers who cannot use the keyboard; SPACE remains primary.

**Mandatory mechanically correct flight:** Use world-space numerical integration with gravity (positive y downward) or closed-form equation applied from a frozen launch velocity:

```
vx0 = launchSpeed * cos(launchAngle)
vy0 = -launchSpeed * sin(launchAngle)
x(t) = x0 + vx0*t
y(t) = y0 + vy0*t + 0.5*g*t*t
```

With a physically consistent hold-to-speed model, e.g. `launchSpeed = minSpeed + chargeFraction*(maxSpeed-minSpeed)`. A smooth saturating angular acceleration model is a bonus, but must preserve child-readable timing: longer hold must have meaningfully stronger launch.

**Starting tuning example (NOT binding constants; calibrate empirically):** Logical canvas `1280×720`, stone origin near `(172,535)`, forehead target near `(1010,252)`; launch angle about **52 degrees above horizontal**, gravity about **900 px/s²**, speed range **850–1130 px/s**, maximum charge approximately **1.8 s**. A near-center forehead hit then lies around **1030 px/s**, i.e. a moderately timed charge. Tune with actual colliders and ground/obstacle effects; do not hard-code success to these values. Low charge should land well short; medium charge should strike the forehead; overcharge should arc above/past the target. The targetable forehead region should be generous for six-year-olds, e.g. combined radius/shape yielding a release success window of roughly **0.3–0.5 seconds**, but no invisible huge target or fake magnetism.

**Collision integrity:** Fixed timestep or analytically correct position per frame; check **swept segment vs target** to avoid fast projectiles tunneling through Goliath between frames. Respect apparent character size and precise pixel-aligned collision; hidden hitbox must correspond to the visible head/forehead. Floor collision must register a real miss. Do not steer stone in flight, teleport it onto target, or modify trajectory after release. The predictive arc, if shown, must be computed from exactly the same parameters as real flight and should not give away the answer. Handle keys blocked by browser focus, tab switching, and auto-repeat. Resizing viewport must not alter physics results.

**Win:** One real stone touches head/forehead region; freeze dramatic impact for a beat, camera subtly shakes, Goliath loses balance and falls backward/sideways into the grass with a soft dust cloud; Israelite soldiers cheer and David looks upward thankfully. A celebratory golden but historically neutral typographic flourish appears. **No gore.** Display the short message “The battle is the Lord's!” / «لِلرَّبِّ الْحَرْبُ!» — **1 Samuel 17:47**.

**Lose:** If stone strikes ground, sails offscreen, or passes Goliath without collision, show the trajectory continuing naturally, then **"Missed! Try again" / «ما أصابتش! جرّب تاني»** with a gentle reset of only the final scene. This is a lost *game attempt*, not a retelling of an alternate biblical event; only winning triggers the canonical biblical ending. A teacher can reset and retry indefinitely. Do not secretly auto-correct a miss.

**Acceptance:** Minimum three independent repeatable physics test cases: undercharged → miss short; calibrated → true head hit; overcharged → miss beyond/above. Same charge with same initial conditions produces same landing location regardless of frame rate. During an actual win the stone physically overlaps the head region. The result must never be predetermined by a scripted cutscene.

---

## 4. ART DIRECTION, ANIMATION AND CAMERA

**Visual quality bar:** polished premium children's animated-TV aesthetic translated into responsive interactive 2D/2.5D. Warm, storybook yet distinctly video-game-like; no crude stick figures, mixed illustration styles, empty flat-color backgrounds, gigantic blocks of text, random clipart or re-used sprites posing as new actions.

**Palette:** Warm honey/gold sun, rich grassy greens, turquoise brook, burnt ochre ground, saturated blue skies, bronze/copper armor, deep navy accents; clear contrast. Soft dimensional shading and lively highlights. Scenes must be readable from the back of the classroom. Characters must have expressive **eyes, brows, mouth and body pose**, including David's strain and the giant's reaction.

**Reusable character rigs/assets:** David idle, run/walk, shepherd staff gesture, call sheep, carry food, hand over food, armor dress layers, armor wobble/fall, remove gear, kneel/scoop stones, sling wind-up/release, celebrate. Goliath idle, intimidating gesture, anticipation, forehead impact, stumble, fall. Sheep idle/walk/hop/follow. Three brothers welcome/receive food. Saul and supporting soldiers optional but appropriate.

**Layered scene plan:** Scene 1 hills/pen; Scene 2 navigable camp map; Scene 3 king's military tent; Scene 4 brook; Scene 5 valley/battlefield; final victory tableau. Use original SVG assets with layered groups / Canvas rendering or locally bundled character PNG frame sequences if original generation is available. Consistent proportions and identity matter more than maximizing polygon count.

**Animation spec:** 60fps ideal, stable ~30fps minimum on mid-range laptop; delta-time independent motion; 2–4 frame idle motions, easing for snaps, ~200ms tactile interactions, proper posture changes, subtle particle/dust/water effects. For the armor fall specifically, implement multiple timed character poses or an articulated rig; a single static rotated character is insufficient.

**Audio:** Button selection blip, shepherd calling and soft sheep bleats, stone pickup plunk, armor metal taps/rattles/soft flop, sling wind-up whirr, launch swish, impact/dust, restrained triumph music. Prefer bundled original audio or procedural Web Audio. **AudioContext resumes only after the user's Start click**, so autoplay policies do not cause silence or throw errors. Sound toggle visible at all times; teacher may mute everything. Do not use external hosted music, fonts, or images; no claims of recorded narration unless actual local narration files are present. The game must remain fully playable with sound disabled.

**Language and age suitability:** Display concise bilingual caption **Arabic primary, English subtitle** by default, with language toggle to EN-only/AR-only. Ensure correct RTL shaping, punctuation, diacritics only where needed, and fonts local/system fallback (`Arial`, `Tahoma`, `sans-serif`). English 18–26 px+, Arabic 24–34 px+ at logical 1280×720; UI labels not less than 20 px. Big icon-driven buttons; no child needs to read paragraphs.

**Teacher UI:** unobtrusive top toolbar with PAUSE, SOUND, LANGUAGE, FULLSCREEN, RESTART (restart confirmation), and HELP. During a level show the mission number, one-sentence objective, minimal progress indicator. Never obstruct the main hit targets, maze, David, or Goliath. Any instruction overlay should dismiss on SPACE/click and not steal control during gameplay.

---

## 5. CLASSROOM DELIVERY AND SIX-TEAM COOPERATION

- Title screen: "DAVID'S BIG ADVENTURE / مغامرة داود الكبرى" plus **START**, **Easy / Normal**, language and sound controls. Default Easy, Arabic + English captions. Optional Teacher Settings panel before play.
- At the start of each level show a three-second visual rule: arrows + CALL for sheep; arrows for maze; DRAG for armor; SPACE on reticle for stones; HOLD and RELEASE SPACE for sling.
- Six teams of five sit in place. All children help by calling directions and counting progress; teacher nominates one operator per mission and swaps operators only at transitions. Offer a visible but optional team leader badge to rotate lead teams. Don't need to register names or internet.
- Project at 16:9, press F11 in Chrome/Edge, sound can connect to classroom speakers. The game must scale cleanly from laptop to projected screen; cursor large enough to see at distance.
- Optional Extended Relay Mode: no time objective, accessible slower game speeds and more rotations if the teacher wants each of the 30 children to touch the controls. **Do not claim the 5-min mode gives all 30 individual turns**.
- Built-in Teacher Help card (pause-visible) explains each level in one line and its exact inputs. A single-level **Replay Mission** option is helpful for practice.

---

## 6. IMPLEMENTATION ARCHITECTURE AND PACKAGING

**Preferred stack:** TypeScript or modern JavaScript, HTML5 Canvas 2D for the animated world / collision / physics, overlay DOM for accessible controls and bilingual text. Vanilla JS/CSS or lightweight build-time tooling. If Vite or another dev tool is used, distribution must be entirely static and function from `file://` on a Windows PC; **avoid absolute root paths and ES-module CORS problems with file URLs**. A fully self-contained `index.html` or `index.html` + relative classic scripts + local assets is preferred. No runtime servers.

**Example editable structure:**
```
davids-big-adventure/
  index.html
  src/
    main.js
    engine/{gameLoop,input,renderer,collision,audio,localization}.js
    states/{title,scene1Sheep,scene2Maze,scene3Armor,scene4Brook,scene5Goliath,victory}.js
    art/{characters,backgrounds,effects}/
    content/story.js
  assets/{images,audio}/
  tests/{physics,maze,armor,stones,flow}.test.js
  dist/                         # FINAL OFFLINE BUILD — direct double click
    index.html
    assets/...                  # only if needed, all relative
  README_FOR_TEACHER.md
  TEST_REPORT.md
```
Files may be reorganized for practicality. Editable source plus a **tested** distribution are required. Use no external requests even when rendering from a local file. Do not need any actual network communications. If running from `file://` makes module imports fail, bundle source into classic script before delivery or use a monolithic build.

**Engine:** One authoritative finite-state machine: `TITLE → SHEEP → SHEEP_SUCCESS → MAZE → MAZE_SUCCESS → ARMOR → ARMOR_SUCCESS → BROOK → BROOK_SUCCESS → SLING → SLING_HIT / SLING_MISS → VICTORY`. A pause overlay must stop simulation time without corrupting held-key state. Centralized requestAnimationFrame with fixed substeps for physics; clean up or transition scene-owned animation timers and input listeners on exit. Implement scene reset without hard reload. Scale logical world to canvas with aspect-preserving letterboxing (no stretching). All pointer coordinates converted into world units. Decouple visual animation state from win conditions.

**Save/continue:** A whole five-minute classroom session does not require persistence. Optional `sessionStorage` for settings only, but game must work if storage unavailable. Avoid anything that compromises `file://` startup.

**Quality:** Semantic functions, comments explaining physics and mathematical tuning, deterministic PRNG for repeatable QA seeds, error-free browser console, no globals leaked across scenes, robust ESC/visibility handling, audio fully muted correctly, press/release listeners never double-fire. Include a development-only debug overlay for colliders and current state, **off by default in release**.

---

## 7. OBJECTIVE TESTS, ACCEPTANCE GATES, AND DELIVERABLES

### Automated unit tests (must pass)

1. **Maze:** For every maze seed/preset, BFS finds a path; path has turns/dead ends; walls block and goal cannot be reached through scenery.
2. **Sheep:** Following behavior obeys distance and obstacles; only sheep physically in the pen count; no instant success from tapping a highlighted sprite.
3. **Armor:** Each item only snaps to its correct body anchor; off-target drop reverts; 3/4 items do **not** cause collapse; 4/4 causes exactly one full collapse/recovery sequence.
4. **Stones:** Exactly five unique smooth stones; jagged stones/misses do not increment; state resets safely on retry.
5. **Physics:** Under/ideal/over-charge test cases; deterministic trajectories at 30/60/120fps; swept collision catches narrow head contact; no win from non-collision.
6. **Flow:** All five missions in order; real controls advance from one level to the next; retry never corrupts score; transitions only occur after success animations.
7. **UI/localization:** Both language modes rendered without clipping, game paused when focus lost, keyboard and mouse bindings do not interfere, sound muted state honored.

### Manual visual + gameplay QA (must actually be performed)

- Open final `dist/index.html` **directly from disk**, with internet disabled; confirm all assets/sounds work and console has zero errors.
- Verify screenshots of each level at **start, interaction, failure/mistake, and completion**—including maze handover animation, armor fully dressed and falling, real stone entering Goliath's forehead hitbox, and final victory tableau.
- Test 1280×720, 1920×1080, and at least one non-16:9 browser window for letterboxing/input alignment. Test Chrome and Edge where available.
- Test low/medium/high power in finale; hold SPACE while window loses focus; key auto-repeat; click teacher PAUSE during flight then resume; retry after a miss; rapid double-click on Start/Retry; click and drag while scaled/letterboxed.
- Test text readability and mouse target sizes as projected from the back of a classroom. No instruction overlaps a draggable item or gameplay target.
- Time a **normal successful playthrough**, recording actual runtime and the effect of tutorials/transitions. State honestly if typical run exceeds five minutes. Do not rush or remove substantive mechanics to game the timing target.

### Gate before declaring complete

**P0 — Functional:** All five levels playable and responsive; no runtime crashes; true failure/success gating; fully offline; accurate chronology and correct collision.  
**P1 — Presentation:** Consistent polished game art, recognizable animations, fully implemented celebration/collapse/cutscenes, readable bilingual typography, working original audio.  
**P2 — Classroom ready:** Teacher menu/controls, reliable projector layout, quick instructions, retries, optional hint, brief teacher README.

If P0 fails, do not claim finished. If P1 or P2 fails, explicitly describe missing elements and deliver a revised iteration rather than labeling a prototype as the final production version.

### Final files to hand over

1. `Davids_Big_Adventure_Offline.zip` — full **tested** offline distribution; ready to extract and double-click `index.html`.
2. `index.html` / distribution folder — actual runnable game.
3. `Davids_Big_Adventure_Source.zip` — editable source and tests.
4. `README_FOR_TEACHER.md` — one-page guide: setup, five controls, team facilitation, audio and troubleshooting.
5. `TEST_REPORT.md` — exact test environments, commands, passed/failed assertions, screenshot filenames, and any known issues.
6. At least **8 QA screenshots** across gameplay and major payoff moments. If the testing platform cannot capture screenshots, explicitly mark that step unverified and do not fabricate evidence.

---

## 8. DEVELOPMENT ORDER — BUILD IN VERTICAL SLICES, BUT DELIVER ALL

**Phase A — Game skeleton:** Offline index entry, correct aspect-ratio renderer, input manager, scene state-machine, teachers' mute/pause/restart, bilingual title & captions; basic art direction established.

**Phase B — Maze proof:** Build Level 2 as the first fully functioning vertical slice (most important navigation), including verified maze, David's movement, food carrying, and **animated handover to brothers**. Demonstrate in browser and test before adding other levels.

**Phase C — Armor proof:** Implement character rig and four draggable pieces, proper layering, every response state, comical tumble and unarmoring. Visually verify every snap position and full staged animation.

**Phase D — Sling physics proof:** Real space-hold-to-charge/keyup launch, gravity, precise forehead collision, true success/miss states, scripted camera reactions **after** the correct physical result, calibration of child-friendly hit window. Run automated and visual low/medium/high power tests.

**Phase E — Remaining playable levels:** Sheep herd + genuine following/pen scoring and brook real timing mechanic; no placeholder minigames.

**Phase F — Polish and classroom QA:** All transition animations, teacher guidance, audio, Arabic, better art where weak, responsive scaled pointers, offline distribution, tests, README, screenshots, packaging. Complete start-to-finish run with audio and without internet.

During implementation, the developer may internally report progress with truthful evidence; **the owner wants the complete five-level game**. Don't treat a first scene or a placeholder mechanic as final delivery.

---

## 9. CONCRETE LINES AND CAPTIONS

Keep opening narration minimal; teacher can read it aloud. All copy must fit in less than two seconds of reading at each stage (except explicit instructions).

| Moment | Arabic (Egyptian, simple) | English |
|---|---|---|
| Opening | يلا نساعد داود في مغامرته! | Let's help David on his adventure! |
| Sheep objective | رجّع الخراف للحظيرة! | Bring the sheep back to their pen! |
| Sheep success | داود حمى خرافه! | David protected his sheep! |
| Maze objective | وصّل الأكل لإخوات داود! | Take food to David's brothers! |
| Maze success | وصلت الأكل! شاطر! | The food arrived! Great job! |
| Armor instruction | اسحب كل قطعة لمكانها على داود. | Drag each piece onto David. |
| Armor response | أووه! الدرع ده مش مناسب ليا! | Oh! This armor isn't right for me! |
| Armor teaching | داود ماكانش متعود على درع شاول. | David wasn't used to Saul's armor. |
| Stones instruction | اختار خمس حجارة ملساء! | Collect five smooth stones! |
| Duel instruction | دوس مطوّل على Space... وسيبها عشان ترمي! | Hold SPACE... release to throw! |
| Miss | ما أصابتش! جرّب تاني. | Missed! Try again. |
| Victory | لِلرَّبِّ الْحَرْبُ! | The battle is the Lord's! |
| Final takeaway | لما نخاف، نثق في ربنا! | When we're afraid, we can trust God! |

Do not write "God loves the strongest" or "David won because he was cleverer or physically stronger." No generic trivia questions, fake quiz rewards, or repeated five-times dialogue. If the Coptic Orthodox teacher prefers formal Arabic, localization should be easy to update through a single strings file.

---

## 10. PRODUCT DEFINITION OF DONE

A child can start the game offline and, by real interactions, shepherd sheep into a pen, **solve a maze to reach brothers and see them receive the food**, drag all of Saul's armor onto David's correct body parts and see a full funny tumble, pick exactly five smooth stones in a timing skill game, then **hold and release SPACE** to launch a stone in a real physically computed arc that **must actually strike Goliath's forehead to win**. The game's polished animation, bright original environments, age-appropriate sound, English/Arabic captions and cooperative teaching flow are visible and testable. A miss truly loses the final attempt. The completion message emphasizes trust in God and is rooted in 1 Samuel 17. Everything runs by double-clicking an offline HTML file on a Windows laptop connected to a classroom projector.

**End of binding implementation blueprint.**
