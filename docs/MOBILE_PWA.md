# Mobile and installable edition · 1.5

The five original games, illustrated scenes, story order, keepsakes, Arabic/English
captions and 40-second rescue remain intact. The world keeps its 1280×720 coordinate
system and fits inside the available screen without cropping. Controls and readable
cards scale independently on smaller screens, with 44 CSS-pixel primary targets.
Safe-area padding protects iPhone cutouts and Home indicators. Dynamic viewport
height accounts for Safari/Chrome toolbars.

## Play on a phone or tablet

Use the hosted HTTPS game address in Safari on iPhone/iPad or Chrome on Android.
Turn the device sideways. Portrait phones offer a rotation reminder and pause an
active game; returning to landscape resumes it. Continuing in portrait is optional,
but landscape provides more room. Tablets may remain in portrait with letterboxing.

- Sheep and giant encounter: hold the large direction arrows. Tap Lift sheep near
  a sheep; another finger can keep holding a direction. The timer still uses 40
  seconds in Easy/Normal. Free Play is untimed.
- Maze: swipe once per corridor step, or tap/hold the direction arrows. Walls and
  the real delivery goal work exactly as before.
- Armour: drag a piece with one finger and release over David's matching body part.
  Tap-piece/tap-body remains available. Capture keeps the drag attached outside the
  canvas; cancellation returns it safely. Small body targets gain finger tolerance
  without accepting a helmet at the waist or changing the underlying rules.
- Brook: tap individual smooth stones, or tap Scoop when the ring reaches one.
  Touch targets expand only when needed. Jagged rocks still do not count.
- Sling: hold the action button to charge and lift the finger to throw. Cancelled
  gestures do not throw. Power and actual collision determine the outcome.

All navigation, colourful instructions, celebrations, music and optional local
narration remain available. Audio unlocks from a gesture; missing installed voices
leave captions available. Keyboard and mouse continue to work.

## Install and save for offline play

1. Open the hosted HTTPS link online. On iPhone/iPad use Safari's Share menu → Add
   to Home Screen. On Android use Chrome's Install app/Add to Home screen, or the
   game's ＋ button if the browser offers the native installation prompt.
2. Open the installed app online and open **Book**. Wait until **Offline ready**.
   Safari can give the Home Screen app its own storage, so check inside that app.
3. Then the complete game works offline, including artwork, animations and locally
   synthesized sound. Earned keepsakes remain in that browser/app's local storage.

The initial game download contains approximately 38 MB of embedded artwork/code
(before network compression). A failed required download shows a retry control;
it never announces readiness for an incomplete cache. Device storage cleanup,
private browsing or removing site data can remove offline availability and local
keepsakes; reconnect and wait for Offline ready again.

Updates download to a separate complete cache. They wait until **Update adventure**
is chosen in the book and confirmed. Updating reloads the current mission and keeps
earned keepsakes. There is no forced reload during a mission.

## Publish the prepared static web build

`Davids_Big_Adventure_Web.zip` contains the deployable site. Extract it into a static
HTTPS host at either the domain root or a subdirectory such as `/adventure/`:

```
index.html
sw.js
manifest.webmanifest
icons/
  icon-192.png
  icon-512.png
  maskable-512.png
  apple-touch-icon.png
```

Serve `index.html` at the directory's trailing-slash URL. Keep all files together.
Use `application/javascript` for `sw.js`, `application/manifest+json` for the
manifest, and `image/png` for icons. Return actual missing-file errors; do not route
missing worker/icon URLs to index.html. Serve HTML and sw.js with revalidation
(`Cache-Control: no-cache`). The HTML contains inline scripts/styles, so the host
must permit those. No backend, account, CDN, runtime dependency download, build
service or secret is required. This work prepares the files; it does not publish a
live site.

For development: `npm ci`, `npm run dev`. For a production preview: `npm run build`,
then `npm run preview`. Localhost is a secure-context exception for development;
an ordinary HTTP LAN address cannot install a service worker on a physical device.
Use a trusted HTTPS preview for actual phone/tablet installation checks.

The desktop Offline ZIP still supports opening its self-contained HTML where local
HTML is permitted. A downloaded file:// HTML cannot register a PWA. Mobile operating
systems should use the HTTPS version rather than opening the ZIP in Files.

## Implementation and evidence

`src/mobile.ts` handles fit and the Canvas roundRect fallback; `src/touch.ts`
normalizes coordinates and manages independent captured pointers, cancellation
and swipes. `src/main.ts` provides responsive HTML controls, rotation and safe
focus handling. `src/pwa.ts` manages readiness, installation guidance and explicit
updates. `public/sw.js` caches the complete shell atomically with a content-derived
version stamped by `scripts/offline.mjs`. Scope-relative URLs support subdirectories.

Run `npm test`, `npm run build`, then `npm run test:browser`. The suite includes
native emulated touch at seven phone/tablet sizes, multi-touch gameplay, actual
service-worker caching, an interrupted asset download/retry, offline reload/new-tab
launch, real offline maze completion and update persistence. See TEST_REPORT.md
for measured results and the physical-device/Safari checks still outstanding.
