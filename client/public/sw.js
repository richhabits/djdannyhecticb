// Service Worker for PWA
// Network-first for HTML/JS/CSS to avoid stale bundles; cache-first for small assets.
const CACHE_NAME = "hectic-radio-v3";
const PRECACHE_URLS = ["/", "/logo-danny-hectic-b.png"];
const ASSET_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".woff2", ".woff"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((name) => {
            if (name !== CACHE_NAME) return caches.delete(name);
            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isAsset = ASSET_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
  const isHTML = request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html");
  const isCode = url.pathname.endsWith(".js") || url.pathname.endsWith(".css");

  // Network-first for HTML/JS/CSS to avoid stale bundles
  if (isHTML || isCode) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for small assets
  if (isAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
  }
});
