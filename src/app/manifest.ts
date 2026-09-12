import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE.name,
    short_name: 'الهيثم',
    description: SITE.tagline,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    lang: 'ar',
    dir: 'rtl',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
