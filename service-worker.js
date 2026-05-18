const CACHE_NAME = 'sector3sounds-v1';
const BASE_URL = 'https://6a0b3f899caeeb832e0d9916--prismatic-stroopwafel-8c8443.netlify.app';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install — cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[S3 Sounds] Caching app shell');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache new successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
