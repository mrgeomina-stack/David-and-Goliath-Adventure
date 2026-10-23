import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
const js = readFileSync("dist/game.js", "utf8").replace(
  /<\/script/gi,
  "<\\/script",
);
const css = readFileSync("dist/davids-big-adventure.css", "utf8");
const template = readFileSync("index.html", "utf8")
  .replace(
    /<link rel="stylesheet" href="\/src\/style\.css"\s*\/?>/,
    () => `<style>${css}</style>`,
  )
  .replace(
    '<script type="module" src="/src/main.ts"></script>',
    () => `<script>${js}</script>`,
  );
if (
  !template.includes(`<style>${css}</style>`) ||
  !template.includes(`<script>${js}</script>`)
) {
  throw new Error(
    "Offline bundling did not replace both development entry tags",
  );
}
writeFileSync("dist/index.html", template);

const version = createHash("sha256")
  .update(template)
  .digest("hex")
  .slice(0, 16);
writeFileSync(
  "dist/sw.js",
  readFileSync("public/sw.js", "utf8").replace("__BUILD_VERSION__", version),
);
