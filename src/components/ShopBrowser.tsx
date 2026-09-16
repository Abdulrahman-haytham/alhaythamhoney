'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import type { CatalogProduct } from '@/lib/products.server';
import { catalogAvailable } from '@/lib/bundles';
import { priceFrom } from '@/lib/variants';
import Products from './Products';

export interface FilterAttribute {
  id: string;
  name: string;
  values: { id: string; value: string }[];
}

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'newest';
const SORTS: { value: Sort; label: string }[] = [
  { value: 'featured', label: 'الترتيب المقترح' },
  { value: 'price-asc', label: 'السعر: من الأقل' },
  { value: 'price-desc', label: 'السعر: من الأعلى' },
  { value: 'newest', label: 'الأحدث' },
];

/**
 * فلاتر جانبية وفرز (Odoo attribute filters). الحالة كلها في عنوان الصفحة
 * (?a=…&sort=…&stock=1) حتى يُشارَك الرابط وتعمل أزرار الرجوع.
 * القيم المختارة داخل الخاصية الواحدة «أو»، وبين الخصائص «و».
 */
export default function ShopBrowser({
  products,
  attributes,
}: {
  products: CatalogProduct[];
  attributes: FilterAttribute[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selected = useMemo(
    () => new Set(params.get('a')?.split(',').filter(Boolean) ?? []),
    [params],
  );
  const sort = (params.get('sort') as Sort) || 'featured';
  const onlyStock = params.get('stock') === '1';

  const update = useCallback(
    (next: { a?: Set<string>; sort?: Sort; stock?: boolean }) => {
      const q = new URLSearchParams();
      const a = next.a ?? selected;
      if (a.size) q.set('a', [...a].join(','));
      const s = next.sort ?? sort;
      if (s !== 'featured') q.set('sort', s);
      const st = next.stock ?? onlyStock;
      if (st) q.set('stock', '1');
      const qs = q.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, selected, sort, onlyStock],
  );

  const filtered = useMemo(() => {
    let list = products;
    for (const attr of attributes) {
      const chosen = attr.values.filter((v) => selected.has(v.id)).map((v) => v.id);
      if (chosen.length === 0) continue;
      list = list.filter((p) => p.attributes.some((av) => chosen.includes(av.id)));
    }
    if (onlyStock) list = list.filter(catalogAvailable);
    const price = (p: CatalogProduct) => priceFrom(p).price ?? Number.MAX_SAFE_INTEGER;
    if (sort === 'price-asc') list = [...list].sort((x, y) => price(x) - price(y));
    else if (sort === 'price-desc')
      list = [...list].sort((x, y) => (priceFrom(y).price ?? -1) - (priceFrom(x).price ?? -1));
    else if (sort === 'newest')
      list = [...list].sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt));
    return list;
  }, [products, attributes, selected, onlyStock, sort]);

  const activeCount = selected.size + (onlyStock ? 1 : 0);
  const hasFilters = attributes.length > 0;

  return (
    <>
      <div className="container mx-auto mt-6 px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-zinc-300">
            <SlidersHorizontal className="h-4 w-4 text-amber-500" />
            {hasFilters ? 'صفِّ النتائج' : 'الفرز'}
          </span>
          {hasFilters && (
            <label className="flex items-center gap-1.5 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={onlyStock}
                onChange={(e) => update({ stock: e.target.checked })}
                className="accent-amber-500"
              />
              يُضاف للسلة
            </label>
          )}
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value as Sort })}
            aria-label="الفرز"
            className="h-9 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-xs text-white focus:border-amber-500/50 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="mr-auto text-xs text-zinc-500">
            {filtered.length} من {products.length} منتجاً
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => update({ a: new Set(), stock: false })}
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
            >
              <X className="h-3.5 w-3.5" /> مسح الفلاتر
            </button>
          )}
          {hasFilters && (
            <div className="w-full space-y-2 border-t border-zinc-800 pt-3">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex flex-wrap items-center gap-1.5">
                  <span className="ml-1 text-xs text-zinc-500">{attr.name}:</span>
                  {attr.values.map((v) => {
                    const on = selected.has(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          const a = new Set(selected);
                          if (on) a.delete(v.id);
                          else a.add(v.id);
                          update({ a });
                        }}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          on
                            ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                            : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {v.value}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="container mx-auto px-4 py-16 text-center text-zinc-500 sm:px-6">
          لا منتجات تطابق هذه الفلاتر —{' '}
          <button
            type="button"
            onClick={() => update({ a: new Set(), stock: false })}
            className="text-amber-400 underline"
          >
            أظهر الكل
          </button>
        </div>
      ) : (
        <Products products={filtered} />
      )}
    </>
  );
}
