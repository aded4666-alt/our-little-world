/* Our Little World — Service Worker
   Caches the site so it works offline, and keeps her installed app
   automatically up to date with the latest version of the site. */

const CACHE_NAME = 'our-little-world-v2';
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

/* Install: pre-cache everything, tolerate optional failures.
   No skipWaiting here — the new version waits until she taps
   "See it ✨" so a refresh never interrupts her mid-story. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          CORE_ASSETS.map((asset) => cache.add(asset))
        )
      )
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

/* Two strategies, one goal: fresh when online, working when offline.

   - PAGE ASSETS (HTML, CSS, manifest): NETWORK-FIRST.
     Whenever she opens the app online, she gets the newest version —
     so every update you ship reaches her automatically.

   - CONTENT ASSETS (photos, music, icons): CACHE-first.
     They download once, live in her cache, and never re-download —
     perfect for offline and for her data plan. */

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  /* Don't intercept cross-origin requests (e.g. Google Fonts) */
  if (url.origin !== self.location.origin) return;

  const isPageAsset =
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json');

  if (isPageAsset) {
    /* ---- Network-first for the site itself ---- */
    event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request, { ignoreSearch: true }).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
      )
    );
    return;
  }

  /* ---- Cache-first for photos, music, icons ---- */
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

/* Allow the page to ask the service worker to update itself */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
