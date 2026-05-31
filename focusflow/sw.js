const CACHE_NAME = 'focusflow-v1';
const ASSETS = [
  './focusflow.html',
  './manifest.json',
  './icon.svg'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Assets
self.addEventListener('fetch', (e) => {
  // Only cache local requests, avoid caching CDN files directly if offline access isn't strictly necessary,
  // or use a network-first approach for them so they work online and cache if possible.
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Network-first for CDNs
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});
