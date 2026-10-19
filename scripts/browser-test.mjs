import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
mkdirSync("qa", { recursive: true });
const html = readFileSync("dist/index.html");
const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});
await new Promise((resolve) => server.listen(4174, "127.0.0.1", resolve));
const results = [];
try {
  for (const script of [
    "maze-check",
    "armor-check",
    "sling-check",
    "remaining-check",
    "story-check",
    "ui-offline-check",
  ]) {
    const start = Date.now();
    const code = await new Promise((resolve) => {
      const p = spawn(process.execPath, [`scripts/${script}.mjs`], {
        stdio: "inherit",
        env: { ...process.env, GAME_URL: "http://localhost:4174/" },
      });
      p.on("exit", resolve);
    });
    results.push({ script, code, seconds: (Date.now() - start) / 1000 });
    if (code !== 0) throw Error(`${script} failed`);
  }
} finally {
  writeFileSync("qa/browser-results.json", JSON.stringify(results, null, 2));
  server.close();
}
