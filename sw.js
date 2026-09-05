/* Our Little World — Service Worker
   Caches the site so it works offline once she's visited it. */

const CACHE_NAME = 'our-little-world-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './audio/purrple-cat-birds-of-a-feather.mp3',
  './images/divine-1.jpg',
  './images/divine-2.jpg',
  './images/divine-3.jpg',
  './images/divine-4.jpg',
  './images/divine-5.jpg',
  './images/divine-6.jpg',
  './images/divine-7.jpg',
  './images/divine-8.jpg',
  './images/divine-main.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

/* Install: pre-cache everything, tolerate optional failures */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          CORE_ASSETS.map((asset) => cache.add(asset))
        )
      )
      .then(() => self.skipWaiting())
  );
});

/* Activate: clean up old caches, take control immediately */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* Fetch: cache-first, then network, then fall back to cached home page.
   The big MP3 is served from cache if present, otherwise from network. */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) {
        // Refresh in the background for non-core requests
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          // Cache successful same-origin responses for future offline visits
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Navigations that fail offline fall back to the cached home page
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
