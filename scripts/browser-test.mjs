import { distServer } from "./dist-server.mjs";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
mkdirSync("qa", { recursive: true });
const server = distServer();
const port = Number(process.env.BROWSER_PORT || 4174);
await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
const scripts = [
  "maze-check",
  "armor-check",
  "sling-check",
  "remaining-check",
  "story-check",
  "ui-offline-check",
  "visual-check",
  "timeout-check",
  "premium-check",
  "mobile-check",
  "pwa-check",
  "food-check",
  "v1-integration-check",
  "character-check",
  "direction-maze-timer-check",
  "audio-brook-check",
  "ui-redesign-check",
  "landing-check",
  "music-ui-check",
  "title-flock-check",
];
const results = [];
let cursor = 0;
const workers = Math.max(
  1,
  Math.min(2, Number(process.env.BROWSER_WORKERS) || 2),
);
async function worker() {
  while (cursor < scripts.length) {
    const index = cursor++,
      script = scripts[index],
      start = Date.now();
    const code = await new Promise((resolve) => {
      const child = spawn(process.execPath, [`scripts/${script}.mjs`], {
        stdio: "inherit",
        env: { ...process.env, GAME_URL: `http://localhost:${port}/` },
      });
      child.on("error", () => resolve(1));
      child.on("exit", (code) => resolve(code ?? 1));
    });
    results[index] = { script, code, seconds: (Date.now() - start) / 1000 };
  }
}
try {
  await Promise.all(Array.from({ length: workers }, worker));
  if (results.some((r) => r.code !== 0))
    throw Error(
      "Browser checks failed: " +
        results
          .filter((r) => r.code !== 0)
          .map((r) => r.script)
          .join(", "),
    );
} finally {
  writeFileSync("qa/browser-results.json", JSON.stringify(results, null, 2));
  await new Promise((resolve) => server.close(resolve));
}
