# Publish David’s Big Adventure on Cloudflare Pages Free

This is the existing five-level game, including its illustrated graphics, touch
controls, story interludes and corrected Goliath forward fall. Nothing has been
published by this work. You decide when to deploy publicly.

## What to upload

Use **Davids_Big_Adventure_Cloudflare_Pages.zip**. Extract it first. Its contents
are the deployment folder, also generated locally as **pages-dist/**:

```
index.html
assets/                 # local JavaScript, CSS, fonts, images and audio
icons/
licenses/               # included open-source notices
manifest.webmanifest
sw.js
_headers
404.html
build-report.json
```

Upload this folder’s contents together. `index.html` must be at the deployment
root. Do not upload the repository, source ZIP, old Web ZIP or standalone Offline
ZIP: the old all-in-one build contains files larger than the hosting limit.
The deployment ZIP is a transport archive; its total size is not the size of an
individual website asset. Upload the **extracted folder** if the dashboard rejects
the ZIP itself.

The current build has 141 files, approximately 70.5 MiB uncompressed, and the
largest file is approximately **3.70 MiB**, below the **25 MiB per-file** limit.
`build-report.json` records exact numbers. The build rejects files above 25 MiB
and more than 20,000 files; the ZIP packager also enforces a conservative 1,000-file
limit for dashboard upload. All artwork retains its existing resolution.

## Option A: upload the prepared folder (no Node.js required)

1. Create or sign into a **free Cloudflare account** at https://dash.cloudflare.com/.
   Choose **Workers & Pages**, then **Create application → Pages → Upload assets**
   (also called **Direct Upload**). Choose Pages, not a paid Workers plan.
2. Enter a project name, for example `davids-big-adventure` if available.
3. Drag the **extracted deployment folder** into the upload area. Confirm that
   `index.html`, `assets/`, `icons/`, `sw.js` and the manifest are included. Do not
   add another `pages-dist/` directory around them inside the uploaded site.
4. Review the files and choose **Deploy site** when you are ready for a public site.
   This is the publication step; it has deliberately not been performed for you.
5. Open the resulting **https://your-project.pages.dev/** address. HTTPS and the
   `pages.dev` subdomain are included; buying a domain is unnecessary.
6. On a phone or iPad, open that HTTPS address and rotate to landscape. Check
   movement, armour dragging, sound after a tap, and a complete level before
   sharing the link with children.

There are no build settings for this prebuilt upload, and no environment variables,
secrets, database, Functions, API keys or server to configure. Stay on Pages Free;
no paid dependency or external runtime API is required. Free platform usage
limits still apply. Cloudflare’s limits/reference:
https://developers.cloudflare.com/pages/platform/limits/
https://developers.cloudflare.com/pages/get-started/direct-upload/

For updates, open the same Pages project and create a new deployment with the
newly built folder. A Direct Upload project and a Git-integrated project are
different workflows; choose the one you want at creation time.

## Option B: let Pages build from GitHub

Create a separate Git-integrated Pages project if desired. Authorize Cloudflare to
read this repository and select the branch that contains these changes
(`codex/davids-big-adventure`, or your merged production branch).

- Framework preset: **None**
- Root directory: repository root (leave blank)
- Build command: **npm ci && npm run build:pages**
- Build output directory: **pages-dist**
- Node version: **24** (`NODE_VERSION=24` in build settings if necessary)
- Functions/bindings/database/secrets: **none**

Do not use `npm run build` for Pages: that command intentionally still creates
the large standalone desktop download. Git-integrated builds consume the free
plan’s build allowance. Manual upload of the prepared folder requires no hosted
build. No deployment commands have been run in this workspace.

## Install on iPhone/iPad or Android

- iPhone/iPad: open the HTTPS address in **Safari**, tap **Share → Add to Home
  Screen**, then open its new icon. Landscape is recommended; Safari may not
  enforce the manifest orientation, so rotate the device yourself.
- Android: open the HTTPS address in **Chrome**, choose **Install app** or **Add to
  Home screen**. The game’s **+** button opens the native prompt when available
  and otherwise gives browser-specific instructions.
- Installation is optional. The browser version remains fully playable.
- Audio starts after a user gesture, as mobile browsers require. Voice guidance
  uses bundled recordings or installed local voices, never a remote speech API.

## Optional offline play

1. Open **Book** while online, then choose **Save for offline play**.
2. Keep the app open until it says **Offline ready**. The full local asset set
   needs roughly 70.5 MiB plus browser overhead; allow extra free storage and use
   Wi-Fi if preferred. Ordinary online play does not register a worker or create
   an offline copy before this choice.
3. Reopen or reload the game in airplane mode to check that this browser/app’s
   copy is ready. On iOS, Home Screen apps can have separate storage: save and
   verify offline readiness **inside the installed app** too.

A failed download never claims readiness. Reconnect and use **Save again**.
Updates are cached separately and wait for **Update adventure** and confirmation;
they do not force a reload mid-level. Updating restarts the current mission while
keeping earned keepsakes. Storage eviction, clearing site data or private browsing
can remove the offline copy and progress; reconnect and save again. Removing the
site’s data in browser settings also removes its offline copy and local progress.
A first visit without an internet connection cannot work before assets are saved.

## Rebuild and test locally

```
npm ci
npm test
npm run build:pages
npm run preview:pages
```

Open the printed localhost URL. Localhost permits service workers for development.
A plain HTTP LAN address is suitable for basic touch preview but **not** PWA
installation or offline saving on a physical phone; use the deployed HTTPS link
for those checks. This modular build must be served over HTTP(S), not opened as
`file://index.html`; the separate legacy standalone download serves that purpose.

```
npm run test:pages
GAME_URL=http://127.0.0.1:4173/ node scripts/mobile-check.mjs
GAME_URL=http://127.0.0.1:4173/ GAME_OFFLINE_OPT_IN=1 node scripts/story-check.mjs
npm run package:pages
```

Creating the ZIP with `package:pages` also requires Python 3.
Browser checks require installed Chromium (`CHROMIUM_PATH` can override
`/usr/bin/chromium`). `test:pages` starts and stops its own scoped local server;
the other two commands use the running preview. The mobile test uses native
emulated touch; it is not a physical Safari/device certification. See
[PAGES_TEST_REPORT.md](PAGES_TEST_REPORT.md) for measured coverage and limitations.
