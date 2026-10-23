import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, extname } from "node:path";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webp": "image/webp",
};
export function distServer({
  directory = "dist",
  prefix = "/",
  fail = () => false,
  transform = (_path, bytes) => bytes,
} = {}) {
  const root = resolve(directory);
  return createServer((req, res) => {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://local.test").pathname,
    );
    if (!pathname.startsWith(prefix)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const path = pathname.slice(prefix.length) || "index.html",
      file = resolve(root, path);
    if (!file.startsWith(root + "/") || fail(path)) {
      res.writeHead(fail(path) ? 503 : 404);
      res.end();
      return;
    }
    try {
      const bytes = readFileSync(file);
      res.writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(transform(path, bytes));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
}
