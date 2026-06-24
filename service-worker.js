const CACHE_NAME = 'sumamente-v24-release';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './js/data.js',
  './js/app.js',
  './js/modulos/electro.js',
  './js/modulos/medicina.js',
  './js/modulos/finanzas.js',
  './js/modulos/quimica.js',
  './js/modulos/civil.js',
  './js/modulos/mecanica.js',
  './js/modulos/geometria.js',
  './js/modulos/unidades.js',
  './js/modulos/fisica.js',
  './js/modulos/diseno.js',
  './js/modulos/nutricion.js',
  './js/modulos/acustica.js',
  './js/modulos/programacion.js',
  './js/modulos/estadistica.js',
  './js/modulos/redes.js',
  './js/modulos/visuales/acustica_visual.js',
  './js/modulos/visuales/civil_visual.js',
  './js/modulos/visuales/diseno_visual.js',
  './js/modulos/visuales/electro_visual.js',
  './js/modulos/visuales/estadistica_visual.js',
  './js/modulos/visuales/finanzas_visual.js',
  './js/modulos/visuales/fisica_visual.js',
  './js/modulos/visuales/geometria_visual.js',
  './js/modulos/visuales/mecanica_visual.js',
  './js/modulos/visuales/medicina_visual.js',
  './js/modulos/visuales/nutricion_visual.js',
  './js/modulos/visuales/programacion_visual.js',
  './js/modulos/visuales/quimica_visual.js',
  './js/modulos/visuales/redes_visual.js',
  './js/modulos/visuales/unidades_visual.js',
  './js/modulos/visuales/app_visual.js',
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
