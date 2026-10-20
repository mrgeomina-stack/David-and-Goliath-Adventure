import { inspectPng } from "./png-check.mjs";
import {
  readdirSync,
  readFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";
import { resolve, basename, dirname, relative } from "node:path";
const root = resolve("visual-assets-v1");
const source = resolve(process.argv[2] || root);
const manifest = JSON.parse(
  readFileSync(root + "/asset_manifest.json", "utf8"),
);
const animations = JSON.parse(readFileSync(root + "/animations.json", "utf8"));
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(resolve(dir, e.name))
      : e.isFile() && e.name.toLowerCase().endsWith(".png")
        ? [resolve(dir, e.name)]
        : [],
  );
}
const found = files(source),
  ids = new Set(),
  paths = new Set();
for (const asset of manifest.assets) {
  if (
    ids.has(asset.id) ||
    paths.has(asset.path) ||
    asset.path.includes("..") ||
    asset.path.startsWith("/")
  )
    throw Error("Invalid or duplicate asset " + asset.id);
  ids.add(asset.id);
  paths.add(asset.path);
}
for (const [id, animation] of Object.entries(animations)) {
  if (!animation.frames.every((id) => ids.has(id)))
    throw Error("Unknown frame in " + id);
  if (
    animation.durationsMs &&
    animation.durationsMs.length !== animation.frames.length
  )
    throw Error("Invalid frame timing " + id);
}
function size(file) {
  const png = inspectPng(file);
  return png.valid ? [png.width, png.height] : null;
}
const report = {
  available: [],
  copied: [],
  missing: [],
  ambiguous: [],
  invalid: [],
  quarantined: [],
  excluded: [],
};
for (const asset of manifest.assets) {
  if (asset.status !== "integration_candidate") {
    report.excluded.push({ id: asset.id, status: asset.status });
    continue;
  }
  const target = resolve(root, asset.path);
  if (existsSync(target)) {
    const validation = inspectPng(target);
    if (!validation.valid && asset.id === "background_01_shepherd_hills") {
      report.quarantined.push({
        id: asset.id,
        path: asset.path,
        reason: validation.error,
        fallback: "Existing meadow",
      });
      continue;
    }
    const dims = size(target);
    if (dims?.[0] === asset.width && dims?.[1] === asset.height)
      report.available.push(asset.id);
    else
      report.invalid.push({
        id: asset.id,
        path: asset.path,
        expected: [asset.width, asset.height],
        actual: dims,
      });
    continue;
  }
  const sameName = manifest.assets.filter(
    (a) => basename(a.path) === basename(asset.path),
  );
  const matches = found.filter(
    (file) => basename(file) === basename(asset.path),
  );
  // Flattened idle.png/fall_00.png names collide. Never assign one file to two roles.
  if (matches.length && (sameName.length > 1 || matches.length > 1)) {
    report.ambiguous.push({
      id: asset.id,
      path: asset.path,
      candidates: matches.map((f) => relative(source, f)),
    });
    continue;
  }
  if (matches.length === 1) {
    const dims = size(matches[0]);
    if (dims?.[0] !== asset.width || dims?.[1] !== asset.height) {
      report.invalid.push({
        id: asset.id,
        expected: [asset.width, asset.height],
        actual: dims,
      });
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(matches[0], target);
    report.available.push(asset.id);
    report.copied.push(asset.path);
  } else report.missing.push({ id: asset.id, path: asset.path });
}
mkdirSync("qa", { recursive: true });
writeFileSync(
  "qa/visual-assets-inventory.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `${report.available.length}/89 candidate PNGs valid; ${report.missing.length} missing, ${report.quarantined.length} quarantined, ${report.ambiguous.length} ambiguous, ${report.invalid.length} invalid. Provisional/reference assets excluded.`,
);
if (report.invalid.length || report.ambiguous.length) process.exitCode = 1;
