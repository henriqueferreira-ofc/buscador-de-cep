// Service Worker para Buscador de CEP
const CACHE_NAME = "buscador-cep-v1";
const ASSETS_TO_CACHE = [
  "/buscador-de-cep/",
  "/buscador-de-cep/index.html",
  "/buscador-de-cep/css/styles.css",
  "/buscador-de-cep/js/main.js",
  "/buscador-de-cep/images/favicon.png",
  "/buscador-de-cep/manifest.json",
];

// Install event - cache essentials
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE).catch(() => {
          // Continue even if some assets fail to cache
          console.warn("Some assets failed to cache");
        });
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network first strategy for API calls
  if (url.pathname.includes("/ws/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return (
              cachedResponse ||
              new Response(
                JSON.stringify({ erro: "Sem conexão. Tente novamente." }),
                {
                  status: 503,
                  headers: { "Content-Type": "application/json" },
                },
              )
            );
          });
        }),
    );
    return;
  }

  // Cache first for assets
  event.respondWith(
    caches
      .match(request)
      .then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const cache = caches.open(CACHE_NAME);
              cache.then((c) => c.put(request, response.clone()));
            }
            return response;
          })
        );
      })
      .catch(() => {
        return caches.match("/buscador-de-cep/index.html");
      }),
  );
});
