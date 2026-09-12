'use client';
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistrar() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    let disposed = false;
    let requestedUpdate = false;
    const change = () => {
      if (requestedUpdate) window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', change);
    const update = (worker: ServiceWorker) => {
      if (!disposed) setWaiting(worker);
    };
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        if (registration.waiting) update(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) update(worker);
          });
        });
      })
      .catch((error) => console.error('SW registration failed:', error));
    const request = () => {
      requestedUpdate = true;
    };
    window.addEventListener('haytham-sw-update', request);
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener('controllerchange', change);
      window.removeEventListener('haytham-sw-update', request);
    };
  }, []);
  if (!waiting) return null;
  return (
    <button
      className="fixed bottom-24 left-4 z-[100] rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-zinc-950"
      onClick={() => {
        window.dispatchEvent(new Event('haytham-sw-update'));
        waiting.postMessage('SKIP_WAITING');
      }}
    >
      تحديث الموقع متاح — اضغط لإعادة التحميل
    </button>
  );
}
