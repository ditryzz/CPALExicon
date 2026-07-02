const CACHE_NAME = 'cpalexicon-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './terms.js',
  './terms-data.js',
  './manifest.json',
  './app-icon.jpg',
  './TSU_JPIA_ACADS.png',
  'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2',
  'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff2',
  'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff2',
  'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        // cache each asset individually so one bad/slow URL can't
        // fail the whole install (which previously left the SW stuck
        // forever serving a stale cached version of the app)
        ASSETS.map(url => cache.add(url).catch(err => {
          console.warn('SW: failed to precache', url, err);
        }))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          if (response.ok || response.type === 'opaque') {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});