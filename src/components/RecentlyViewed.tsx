'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { useRecentlyViewed } from '@/store/recentlyViewedStore';
import { useHydrated } from '@/lib/useHydrated';
import { useSettings } from '@/components/SettingsProvider';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

/** يُسجّل زيارة صفحة منتج — لا يعرض شيئاً. */
export function RecentlyViewedTracker({
  product,
}: {
  product: { id: string; slug: string; name: string; image: string; price: number | null };
}) {
  const push = useRecentlyViewed((s) => s.push);
  useEffect(() => {
    push(product);
    // نسجّل مرة واحدة لكل تحميل صفحة
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}

/** شريط «شوهد مؤخراً» — يظهر فقط حين توجد زيارات سابقة والأدمن مفعّله. */
export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const hydrated = useHydrated();
  const { showRecentlyViewed } = useSettings();
  const items = useRecentlyViewed((s) => s.items).filter((i) => i.id !== excludeId);
  if (!hydrated || !showRecentlyViewed || items.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="bg-zinc-950 py-10">
      <div className="container mx-auto px-4 sm:px-6">
        <h2
          id="recent-heading"
          className="mb-5 flex items-center gap-2 font-amiri text-2xl font-bold text-white"
        >
          <History className="h-5 w-5 text-amber-500" />
          شاهدتَ مؤخراً
        </h2>
        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {items.map((p) => (
            <li key={p.id} className="w-36 shrink-0 snap-start sm:w-44">
              <Link
                href={`/product/${p.slug}`}
                className="group block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-amber-500/40"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-2.5">
                  <p className="truncate text-xs font-bold text-white">{p.name}</p>
                  {p.price != null && (
                    <p className="gold-text mt-0.5 text-xs font-bold tabular-nums">
                      {fmt(p.price)} <span className="text-[10px] text-zinc-500">ل.س</span>
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
