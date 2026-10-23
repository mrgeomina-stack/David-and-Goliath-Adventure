/* Generated local assets only. An update stays waiting until the player accepts it. */
const VERSION = "__PAGES_VERSION__";
const FILES = __PAGES_FILES__;
// Isolate copies hosted at different paths on the same origin.
const PREFIX = "davids-pages:" + self.registration.scope + ":";
const CACHE = PREFIX + VERSION;
const REQUIRED = FILES.map(
  (path) => new URL(path, self.registration.scope).href,
);
const PATHS = new Set(REQUIRED.map((url) => new URL(url).pathname));
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        // Bound download concurrency and memory on phones. No partial version is activated.
        for (let i = 0; i < REQUIRED.length; i += 6)
          await cache.addAll(
            REQUIRED.slice(i, i + 6).map(
              (url) => new Request(url, { cache: "reload" }),
            ),
          );
      } catch (error) {
        await caches.delete(CACHE);
        throw error;
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CACHE_STATUS")
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        const entries = await Promise.all(
          REQUIRED.map((url) => cache.match(url)),
        );
        event.ports[0]?.postMessage({
          ready: entries.every(Boolean),
          version: VERSION,
        });
      })(),
    );
});
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url),
    scope = new URL(self.registration.scope);
  if (
    request.method !== "GET" ||
    url.origin !== scope.origin ||
    !url.pathname.startsWith(scope.pathname)
  )
    return;
  if (request.mode === "navigate") {
    // Keep HTML and hashed assets from one release together until an accepted update.
    event.respondWith(
      (async () => {
        const cached = await (await caches.open(CACHE)).match(REQUIRED[0]);
        return cached || fetch(request);
      })(),
    );
  } else if (PATHS.has(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await (
          await caches.open(CACHE)
        ).match(request, { ignoreSearch: true });
        return cached || fetch(request);
      })(),
    );
  }
});
