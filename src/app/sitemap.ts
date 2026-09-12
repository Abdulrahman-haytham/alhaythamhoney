import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { SITE } from '@/lib/config';

export const revalidate = 3600;

const STATIC: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/shop', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/custom-mixtures', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/articles', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about-us', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/quality-standards', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/studio', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/return-policy', priority: 0.2, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, mixtures] = await Promise.all([
    db.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.mixture.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  // المقالات ثابتة في الكود — تُقرأ بشكل كسول حتى لا يفشل الـ sitemap إن لم تُبنَ المدونة بعد
  let articles: { slug: string; publishedAt: string }[] = [];
  try {
    const mod = await import('@/lib/articles');
    articles = await mod.getAllArticles();
  } catch {
    articles = [];
  }

  return [
    ...STATIC.map((s) => ({ url: `${SITE.url}${s.path}`, priority: s.priority, changeFrequency: s.changeFrequency })),
    ...products.map((p) => ({
      url: `${SITE.url}/product/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    })),
    ...mixtures.map((m) => ({
      url: `${SITE.url}/custom-mixtures/${m.slug}`,
      lastModified: m.updatedAt,
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    })),
    ...articles.map((a) => ({
      url: `${SITE.url}/articles/${a.slug}`,
      lastModified: new Date(a.publishedAt),
      priority: 0.7,
      changeFrequency: 'yearly' as const,
    })),
  ];
}
