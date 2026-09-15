'use client';

import Link from 'next/link';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { variantCartId } from '@/lib/variants';
import { useCart } from '@/store/cartStore';
import { getWhatsAppLink } from '@/lib/config';
import { trackAddToCart } from '@/lib/analytics';
import { isAvailable } from '@/lib/settings';
import type { ArticleProduct } from '@/lib/articles';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

/** بطاقة مضغوطة «المنتج المذكور في المقال» — من القراءة إلى السلة بضغطة. */
export default function ArticleProductCard({ product }: { product: ArticleProduct }) {
  const addItem = useCart((s) => s.addItem);
  const available = isAvailable(product);
  const canOrder = available && product.price != null;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-zinc-900/50 p-3">
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`h-20 w-20 rounded-xl object-cover ${available ? '' : 'opacity-50 grayscale'}`}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/product/${product.slug}`}
          className="block truncate font-amiri text-lg font-bold text-white hover:text-amber-400"
        >
          {product.name}
        </Link>
        <p className="text-xs text-zinc-500">
          {product.weight}
          {product.price != null && (
            <>
              {product.weight && ' · '}
              <span className="gold-text text-sm font-bold tabular-nums">
                {fmt(product.price)}
              </span>{' '}
              ل.س
            </>
          )}
        </p>
        <div className="mt-2">
          {canOrder ? (
            <button
              type="button"
              onClick={() => {
                addItem({
                  id: product.variantId ? variantCartId(product.id, product.variantId) : product.id,
                  productId: product.id,
                  variantId: product.variantId ?? undefined,
                  slug: product.slug,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  weight: product.weight,
                });
                trackAddToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price ?? undefined,
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> أضف إلى السلة
            </button>
          ) : (
            <a
              href={getWhatsAppLink(`مرحباً عسل الهيثم، أود الاستفسار عن: ${product.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-amber-500/40"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {available ? 'اسأل عن السعر' : 'أبلغني عند توفره'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
