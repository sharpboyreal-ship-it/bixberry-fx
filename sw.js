```javascript
const CACHE_NAME = "bixberry-fx-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./dashboard.html",
  "./markets.html",
  "./academy.html",
  "./calculator.html",
  "./calendar.html",
  "./news.html",
  "./watchlist.html",
  "./journal.html",
  "./analytics.html",
  "./risk.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./css/features.css",
  "./js/script.js",
  "./js/features.js",
  "./js/demo-trading.js",
  "./icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(
        APP_FILES.map(async file => {
          try {
            const response = await fetch(file);

            if (response.ok) {
              await cache.put(file, response);
            }
          } catch (error) {
            console.warn("Could not cache:", file);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key.startsWith("bixberry-fx-") &&
              key !== CACHE_NAME
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Do not cache browser-extension or unrelated requests.
  if (!["http:", "https:"].includes(url.protocol)) {
    return;
  }

  // Navigation: try the network first, then use cached pages.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy));

          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);

          if (cached) return cached;

          return (
            await caches.match("./index.html")
          ) || new Response(
            "BIXBERRY FX is offline. Please reconnect to the internet.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        })
    );

    return;
  }

  // Static files: use cached copies when available.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy));
        }

        return response;
      });
    }).catch(() =>
      new Response("This resource is unavailable offline.", {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      })
    )
  );
});
```
