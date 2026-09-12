'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Heart, Check } from 'lucide-react';
import type { Product } from '@prisma/client';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { trackAddToCart } from '@/lib/analytics';
import { useHydrated } from '@/lib/useHydrated';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US').format(price);
}

/**
 * على الجوال البطاقة مضغوطة عمداً: صورة + اسم + سعر + زر واحد.
 * القلب فوق الصورة، والوصف وزر «تفاصيل» يظهران من sm فأعلى فقط —
 * الصورة والاسم يصلان لصفحة المنتج، فلا داعي لزر ثالث في 160 بكسل.
 */
export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isWishlisted } = useWishlist();
  const hydrated = useHydrated();
  const wishlisted = hydrated && isWishlisted(product.id);
  const canOrder = product.inStock && product.price !== null;
  const [added, setAdded] = useState(false);

  const cartProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    desc: product.desc,
    image: product.image,
    price: product.price,
    weight: product.weight,
    badge: product.badge,
    benefit: product.benefit,
  };

  function handleAdd() {
    if (!canOrder) return;
    addItem(cartProduct);
    trackAddToCart({ id: product.id, name: product.name, price: product.price ?? undefined });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <motion.article
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 shadow-lg shadow-black/40 ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl hover:ring-amber-500/20 sm:rounded-[2rem] md:rounded-[2.5rem]"
    >
      <div className="relative flex-shrink-0 overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block">
          <img
            src={product.image}
            alt={`${product.name} - عسل طبيعي 100% من الهيثم — نحل وعسل في سوريا`}
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:aspect-[4/3]"
            loading="lazy"
          />
        </Link>

        {product.badge && (
          <span className="golden-glow absolute top-2.5 right-2.5 z-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-0.5 text-[9px] font-black text-zinc-950 shadow-lg sm:top-4 sm:right-4 sm:px-3 sm:py-1 sm:text-[10px]">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => (wishlisted ? removeWishlist(product.id) : addWishlist(cartProduct))}
          aria-pressed={wishlisted}
          aria-label={
            wishlisted ? `إزالة ${product.name} من المفضلة` : `أضف ${product.name} إلى المفضلة`
          }
          className={`absolute top-2.5 left-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors sm:top-4 sm:left-4 sm:h-9 sm:w-9 ${
            wishlisted
              ? 'bg-red-500/90 text-white'
              : 'bg-zinc-950/60 text-zinc-200 hover:bg-zinc-950/80 hover:text-red-400'
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-grow flex-col p-3 sm:p-6 md:p-8">
        <Link href={`/product/${product.slug}`} className="block">
          <h4 className="line-clamp-2 font-amiri text-[15px] font-bold leading-[1.3] text-white transition-colors group-hover:text-amber-400 sm:text-xl md:text-2xl">
            {product.name}
          </h4>
        </Link>

        {product.benefit && (
          <p className="mt-1 truncate text-[10px] font-semibold text-amber-500/90 sm:mt-2 sm:text-xs">
            {product.benefit}
          </p>
        )}

        <p className="mt-3 mb-5 hidden flex-grow text-sm leading-relaxed text-zinc-400 line-clamp-2 sm:block">
          {product.desc}
        </p>

        {product.price != null && (
          <div className="mt-2.5 sm:mt-0 sm:mb-4 sm:flex sm:items-center sm:justify-between">
            <p className="leading-none">
              <span className="gold-text text-lg font-bold tabular-nums sm:text-2xl">
                {formatPrice(product.price)}
              </span>
              <span className="mr-1 text-[11px] text-zinc-500 sm:text-sm">ل.س</span>
            </p>
            {product.weight && (
              <p className="mt-1 text-[10px] text-zinc-500 sm:mt-0 sm:text-sm">{product.weight}</p>
            )}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-3 sm:border-t sm:border-white/5 sm:pt-4">
          <Link
            href={`/product/${product.slug}`}
            className="group/btn hidden flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-800 py-2.5 text-sm font-bold text-zinc-200 transition-all duration-300 hover:bg-zinc-700 sm:flex"
            aria-label={`تفاصيل ${product.name}`}
          >
            <Eye className="h-4 w-4 transition-colors group-hover/btn:text-amber-500" />
            تفاصيل
          </Link>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canOrder}
            aria-label={`أضف ${product.name} إلى السلة`}
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold transition-all duration-300 sm:h-auto sm:py-2.5 sm:text-sm ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-500/40'
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {!product.inStock
              ? 'غير متوفر'
              : product.price === null
                ? 'استفسر عن السعر'
                : added
                  ? 'أُضيف'
                  : 'أضف للسلة'}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
