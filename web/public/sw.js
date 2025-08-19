const STATIC_CACHE = "static-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) =>
      c.addAll(["/", "/index.html", "/manifest.webmanifest"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isAPI = url.pathname.startsWith("/api/");
  if (isAPI) {
    // network-first para API
    event.respondWith(
      fetch(event.request)
        .then((r) => {
          const copy = r.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(event.request, copy));
          return r;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // cache-first para estáticos
  event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request)));
});
