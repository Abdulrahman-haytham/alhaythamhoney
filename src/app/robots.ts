import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/cart', '/wishlist', '/offline'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
