/* Offline support caches only versioned static assets, never admin/API/cart HTML or prices. */
const CACHE = 'alhaytham-static-v2';
const OFFLINE = '/offline.html';
const PRECACHE = [OFFLINE, '/favicon.ico', '/apple-touch-icon.png', '/android-chrome-192x192.png', '/android-chrome-512x512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key !== CACHE && (key.startsWith('alhaytham-') || key.startsWith('workbox-')))
      .map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin ||
      /^\/(api|admin|uploads|q)(\/|$)/.test(url.pathname) || req.headers.has('range')) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(async () => (await caches.match(OFFLINE)) || new Response('Offline', { status: 503 })));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const response = await fetch(req);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(req, response.clone());
        const keys = await cache.keys();
        const assets = keys.filter((key) => new URL(key.url).pathname.startsWith('/_next/static/'));
        if (assets.length > 200) await cache.delete(assets[0]);
      }
      return response;
    })());
  }
});
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
