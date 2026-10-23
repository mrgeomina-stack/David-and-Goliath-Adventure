import { createHash } from "node:crypto";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const root = "pages-dist";
mkdirSync(join(root, "licenses"), { recursive: true });
for (const name of [
  "PHASER_LICENSE.md",
  "EVENTEMITTER3_LICENSE.txt",
  "NUNITO_OFL.txt",
  "NOTO_ARABIC_OFL.txt",
])
  copyFileSync(join("docs", name), join(root, "licenses", name));
const walk = (dir, prefix = "") =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name),
      relative = prefix + name;
    return statSync(path).isDirectory()
      ? walk(path, relative + "/")
      : [relative];
  });
const files = walk(root)
  .filter(
    (p) => !["sw.js", "_headers", "build-report.json", "404.html"].includes(p),
  )
  .sort();
files.splice(files.indexOf("index.html"), 1);
files.unshift("index.html");
if (files.some((p) => /\.(zip|ts|map)$/.test(p)))
  throw Error("Unexpected source/archive in deployment");
const html = readFileSync(join(root, "index.html"), "utf8");
if (
  /(?:src|href)=["'](?:https?:)?\/\//i.test(html) ||
  html.includes("/src/main.ts")
)
  throw Error("Unbundled entry or remote dependency");
const hash = createHash("sha256");
hash.update(readFileSync("scripts/pages-worker.js"));
for (const path of files)
  hash.update(path).update(readFileSync(join(root, path)));
const version = hash.digest("hex").slice(0, 16);
writeFileSync(
  join(root, "sw.js"),
  readFileSync("scripts/pages-worker.js", "utf8")
    .replace("__PAGES_VERSION__", version)
    .replace("__PAGES_FILES__", JSON.stringify(files)),
);
writeFileSync(
  join(root, "_headers"),
  `# No Functions, paid services, or external runtime dependencies.\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n/manifest.webmanifest\n  Cache-Control: no-cache\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/sw.js\n  Cache-Control: no-store\n`,
);
// Disable Pages' implicit SPA fallback, so a missing asset is a genuine 404.
writeFileSync(
  join(root, "404.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Adventure not found</title><h1>Adventure not found</h1><p>Check the game link and try again.</p></html>',
);
let revision = "local";
try {
  revision = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
} catch {}
const inventory = walk(root).map((path) => ({
  path,
  bytes: statSync(join(root, path)).size,
}));
const largest = inventory.reduce((a, b) => (a.bytes > b.bytes ? a : b));
const report = {
  version,
  sourceBaseRevision: revision,
  assetLimitBytes: 25 * 1024 * 1024,
  fileLimit: 20000,
  files: inventory.length + 1,
  totalBytes: inventory.reduce((s, f) => s + f.bytes, 0),
  largest,
  precachedFiles: files.length,
  offlineOptIn: true,
  runtimeServices: [],
  filesOverLimit: inventory.filter((f) => f.bytes > 25 * 1024 * 1024),
};
if (report.filesOverLimit.length || report.files > report.fileLimit)
  throw Error(JSON.stringify(report));
for (const path of files)
  if (!existsSync(join(root, path)))
    throw Error("Missing offline file: " + path);
writeFileSync(
  join(root, "build-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log("PAGES BUILD PASS:", JSON.stringify(report, null, 2));
