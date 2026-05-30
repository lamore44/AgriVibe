const CACHE_NAME = "agrivibe-cache-v1";
const OFFLINE_URLS = [
  "/",
  "/crops",
  "/about",
  "/manifest.json",
  "/logo.jpg",
  "/icon-192.png",
  "/icon-512.png",
  "/crops/strawberry.png",
  "/crops/shallot.png",
  "/crops/potato.png",
  "/crops/carrot.png",
  "/crops/coffee.png",
];

// Install Event: Precaching App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Warm up the cache with essential routes and files
      return cache.addAll(OFFLINE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleaning up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intercepting network requests
self.addEventListener("fetch", (event) => {
  const request = event.request;
  
  // Only handle same-origin GET requests to avoid catching external cross-origin trackers/APIs
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Ignore backend API endpoints to prevent blocking dynamic AI / Weather services
  if (url.pathname.startsWith("/api/")) return;

  // Static Assets Strategy (Stale-While-Revalidate)
  // For Javascript files, CSS files, images, icons, and pre-generated static files
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/crops/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-While-Revalidate: return cached version, update in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
          }).catch(() => {
            // Fail silently on background fetch errors (e.g. offline)
          });
          return cachedResponse;
        }

        // Cache miss: fetch from network, cache if successful, do not catch error
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Page Documents Strategy (Network First, falling back to Cache)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // If the request was successful, cache it and return
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If offline, attempt to find a match in the cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Fallback to the root page for navigations if nothing matches
          if (request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});
