const CACHE_NAME = 'sumamente-v9-diseno';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './js/data.js',
  './js/modules/electro.js',
  './js/modules/medicina.js',
  './js/modules/finanzas.js',
  './js/modules/quimica.js',
  './js/modules/civil.js',
  './js/modules/mecanica.js',
  './js/modules/geometria.js',
  './js/modules/unidades.js',
  './js/modules/fisica.js',
  './js/modulos/diseno.js',
  './js/app.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;700;800&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});