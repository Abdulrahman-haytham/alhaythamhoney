/* Service Worker — الهيثم لنحل وعسل
 * الاستراتيجية:
 *  - التنقلات: الشبكة أولاً، ثم الكاش، ثم صفحة عدم الاتصال.
 *  - أصول Next الثابتة والصور: الكاش أولاً مع تحديث في الخلفية.
 *  - لا يُخزَّن شيء من /api أو /admin إطلاقاً.
 */
const VERSION = 'v1';
const STATIC_CACHE = `alhaytham-static-${VERSION}`;
const PAGE_CACHE = `alhaytham-pages-${VERSION}`;
const OFFLINE_URL = '/offline';

const PRECACHE = [OFFLINE_URL, '/favicon.ico', '/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isCacheable(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/api/')) return false;
  if (url.pathname.startsWith('/admin')) return false;
  return true;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isCacheable(url)) return;

  // التنقلات: الشبكة أولاً حتى يبقى المحتوى طازجاً
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // أصول ثابتة: الكاش أولاً
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:css|js|woff2?|png|jpe?g|svg|webp|avif|ico)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});

// يسمح للصفحة بطلب تفعيل نسخة جديدة فوراً
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});