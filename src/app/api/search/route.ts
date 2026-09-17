import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripHtml } from '@/lib/markdown';
import { priceFrom } from '@/lib/variants';

export const dynamic = 'force-dynamic';

/**
 * فهرس البحث الفوري (منتجات + خلطات + مقالات). صغير بما يكفي ليُرسل دفعة واحدة
 * ويُبحث فيه في المتصفح — بلا استعلام لكل ضغطة زر.
 */
export async function GET() {
  const [products, mixtures, articles, glossary] = await Promise.all([
    db.product.findMany({
      where: { published: true },
      select: {
        slug: true,
        name: true,
        desc: true,
        image: true,
        price: true,
        inStock: true,
        variants: { select: { price: true, inStock: true, stockQty: true } },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    db.mixture.findMany({
      where: { published: true },
      select: { slug: true, name: true, tagline: true, image: true },
    }),
    db.article.findMany({
      where: { published: true, publishedAt: { lte: new Date() } },
      select: { slug: true, title: true, description: true, image: true, keywords: true },
      orderBy: { publishedAt: 'desc' },
    }),
    db.glossaryEntry.findMany({
      where: { published: true },
      select: { slug: true, name: true, summary: true, image: true, category: true, aliases: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);
  const docs = [
    ...products.map((p) => ({
      kind: 'product' as const,
      slug: p.slug,
      title: p.name,
      desc: p.desc,
      image: p.image,
      price: priceFrom({
        price: p.price,
        variants: p.variants.map((v) => ({
          ...v,
          id: '',
          label: '',
          isDefault: false,
          sortOrder: 0,
        })),
      }).price,
      inStock: p.inStock,
      terms: `${p.name} ${p.desc}`.toLowerCase(),
    })),
    ...mixtures.map((m) => ({
      kind: 'mixture' as const,
      slug: m.slug,
      title: `خلطة ${m.name}`,
      desc: m.tagline,
      image: m.image,
      price: null,
      inStock: true,
      terms: `خلطة ${m.name} ${m.tagline}`.toLowerCase(),
    })),
    ...articles.map((a) => ({
      kind: 'article' as const,
      slug: a.slug,
      title: a.title,
      desc: stripHtml(a.description),
      image: a.image,
      price: null,
      inStock: true,
      terms: `${a.title} ${a.description} ${a.keywords.join(' ')}`.toLowerCase(),
    })),
    ...glossary.map((g) => ({
      kind: 'glossary' as const,
      slug: g.slug,
      title: g.name,
      desc: g.category,
      image: g.image,
      price: null,
      inStock: true,
      terms: `${g.name} ${g.aliases.join(' ')} ${g.category} ${g.summary}`.toLowerCase(),
    })),
  ];
  return NextResponse.json(
    { docs },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
  );
}
