/* ═══════════════════════════════════════════════════════════════
   MKEYZ CONTROL v7 — Service Worker
   Estrategia: Cache-First con fallback a red
   Almacena todo offline: HTML principal + Google Fonts
═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'mkeyz-control-v7';

/* Assets que se pre-cachean al instalar */
const PRE_CACHE = [
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap',
];

/* ── INSTALL: pre-cachea los assets esenciales ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        /* Carga los assets locales en modo no-cors para fuentes externas */
        return Promise.allSettled(
          PRE_CACHE.map(url =>
            cache.add(url).catch(() => {
              /* Falla silenciosa en fuentes si no hay red en install */
              console.warn('[SW] No se pudo cachear:', url);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: limpia caches antiguas ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Eliminando cache antigua:', key);
              return caches.delete(key);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ── FETCH: Cache-First con fallback a red ── */
self.addEventListener('fetch', event => {
  const { request } = event;

  /* Solo intercepta GET */
  if (request.method !== 'GET') return;

  /* Ignora extensiones de Chrome y datos de navegador */
  if (request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          /* Sirve desde cache + actualiza en background (stale-while-revalidate) */
          const fetchPromise = fetch(request)
            .then(response => {
              if (response && response.ok) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(request, response.clone()));
              }
              return response;
            })
            .catch(() => { /* sin red: no hay update, ok */ });

          return cached;
        }

        /* No está en cache: intenta red y guarda si funciona */
        return fetch(request)
          .then(response => {
            if (!response || !response.ok || response.type === 'opaque') {
              return response;
            }
            const toCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, toCache));
            return response;
          })
          .catch(() => {
            /* Sin red y sin cache: devuelve el index como fallback */
            if (request.headers.get('accept') &&
                request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});
