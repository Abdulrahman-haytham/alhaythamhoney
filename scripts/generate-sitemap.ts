/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml based on available routes and content
 */

import { articles } from '../data/articles';
import { groups } from '../data/products';

const BASE_URL = 'https://alhaythamhoney.sy';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSitemapXml(entries: SitemapEntry[]): string {
  const xmlEntries = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''}
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    // Static pages
    { url: `${BASE_URL}/`, changefreq: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/shop`, changefreq: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about-us`, changefreq: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/quality-standards`, changefreq: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/faq`, changefreq: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/articles`, changefreq: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/custom-mixtures`, changefreq: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/return-policy`, changefreq: 'yearly', priority: 0.3 },

    // Article pages
    ...articles.map((article) => ({
      url: `${BASE_URL}/articles/${article.id}`,
      lastmod: today,
      changefreq: 'monthly' as const,
      priority: 0.7,
    })),

    // Product pages
    ...groups.flatMap((group) =>
      group.items.map((item) => ({
        url: `${BASE_URL}/product/${item.id}`,
        lastmod: today,
        changefreq: 'weekly' as const,
        priority: 0.8,
      }))
    ),
  ];

  return generateSitemapXml(entries);
}

// If run directly, output the sitemap
if (typeof process !== 'undefined' && process.argv) {
  console.log(generateSitemap());
}

export { generateSitemap, SitemapEntry };
