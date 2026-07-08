const CACHE_NAME = 'workout-defense-v1.44';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/api.js',
  '/src/state.jsx',
  '/src/engine.js',
  '/src/components.jsx',
  '/src/layouts.jsx',
  '/src/pages.jsx'
];

// ============================================================================
// 1. INITIALIZATION & ASSET PRE-CACHING LIFECYCLE
// ============================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching core application shell binaries...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Forces active service worker promotion immediately
});

// ============================================================================
// 2. CACHE PURGING & STORAGE MAINTENANCE LIFECYCLE
// ============================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Purging legacy stale storage block:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Immediately claims all open client layout windows
});

// ============================================================================
// 3. CACHE-FIRST STALE-WHILE-REVALIDATE NETWORK INTERCEPTOR
// ============================================================================
self.addEventListener('fetch', (event) => {
  // Only process standard GET operations (bypasses remote POST cloud sync auth data pipelines)
  if (event.request.method !== 'GET') return;

  // Skip intercepting third-party core tracking or api network channels directly
  if (event.request.url.includes('/api/apps/public') || event.request.url.includes('/auth/me')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached shell asset immediately for zero-latency load, then update in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Silent catch for genuine offline execution splits */});
        
        return cachedResponse;
      }

      // Fall back to standard network requests if asset doesn't exist inside local storage caches
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Absolute offline navigation shield: route navigation requests straight back to root index shell
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
