const CACHE_NAME = 'faunicode-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/css/main.css',
  '/css/variables.css',
  '/css/reset.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animations.css',
  '/css/responsive.css',
  '/css/theme.css',
  '/js/config.js',
  '/js/utils.js',
  '/js/storage.js',
  '/js/clipboard.js',
  '/js/toast.js',
  '/js/modal.js',
  '/js/router.js',
  '/js/search.js',
  '/js/unicode.js',
  '/js/render.js',
  '/js/main.js',
  '/data/categories.json',
  '/data/unicode.json',
  '/data/emoji.json',
  '/data/symbols.json',
  '/data/nickname.json',
  '/data/invisible.json',
  '/data/extra.json',
  '/data/extra2.json',
  '/data/extra3.json',
  '/data/extra4.json',
  '/data/extra5.json',
  '/pages/404.html',
  '/pages/explorer.html',
  '/pages/categories.html',
  '/pages/inspector.html',
  '/pages/analyzer.html',
  '/pages/nickname.html',
  '/pages/favorites.html',
  '/pages/recent.html',
  '/pages/about.html',
  '/pages/settings.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/pages/404.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
