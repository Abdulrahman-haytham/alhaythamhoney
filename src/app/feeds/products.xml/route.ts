import { db } from '@/lib/db';
import { SITE } from '@/lib/config';
import { getSettings } from '@/lib/settings.server';
import { catalogAvailable, CATEGORY_LABELS } from '@/lib/bundles';
import { variantAvailable } from '@/lib/variants';
import { productListInclude } from '@/lib/products.server';

export const dynamic = 'force-dynamic';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (path: string) => (path.startsWith('http') ? path : `${SITE.url}${path}`);

/**
 * مغذّي المنتجات (Google Merchant / Meta Commerce): RSS 2.0 بمساحة أسماء g:.
 * المنتج ذو الأحجام يُصدَّر عنصراً لكل حجم تحت item_group_id واحد.
 * يُعطَّل من الإعدادات؛ ويُخزَّن ساعة في CDN/المتصفح.
 */
export async function GET() {
  const settings = await getSettings();
  if (!settings.productFeedEnabled) return new Response('Not Found', { status: 404 });
  const products = await db.product.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
    include: productListInclude,
  });
  const items: string[] = [];
  for (const p of products) {
    const link = `${SITE.url}/product/${p.slug}`;
    const base = {
      title: p.name,
      description: p.desc,
      link,
      image: abs(p.image),
      type: CATEGORY_LABELS[p.category] ?? p.category,
    };
    const entry = (
      id: string,
      price: number,
      available: boolean,
      extra: Record<string, string> = {},
    ) =>
      `<item>
  <g:id>${esc(id)}</g:id>
  <g:title>${esc(extra.title ?? base.title)}</g:title>
  <g:description>${esc(base.description)}</g:description>
  <g:link>${esc(link)}</g:link>
  <g:image_link>${esc(base.image)}</g:image_link>
  <g:price>${price} SYP</g:price>
  <g:availability>${available ? 'in stock' : 'out of stock'}</g:availability>
  <g:condition>new</g:condition>
  <g:brand>${esc(SITE.name)}</g:brand>
  <g:product_type>${esc(base.type)}</g:product_type>${Object.entries(extra)
    .filter(([k]) => k !== 'title')
    .map(([k, v]) => `\n  <g:${k}>${esc(v)}</g:${k}>`)
    .join('')}
</item>`;
    if (p.variants.length > 0) {
      for (const v of p.variants)
        items.push(
          entry(`${p.slug}-${v.id}`, v.price, catalogAvailable(p) && variantAvailable(v), {
            title: `${p.name} — ${v.label}`,
            item_group_id: p.slug,
            size: v.label,
          }),
        );
    } else if (p.price != null) {
      items.push(entry(p.slug, p.price, catalogAvailable(p)));
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${esc(SITE.name)}</title>
<link>${esc(SITE.url)}</link>
<description>${esc(SITE.tagline)}</description>
${items.join('\n')}
</channel>
</rss>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
