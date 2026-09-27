'use client';

import { useHydrated } from '@/lib/useHydrated';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Store } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { CURRENCY, formatAmount } from '@/lib/money';
import WhatsAppButton from '@/components/WhatsAppButton';

export function WishlistClient() {
  const mounted = useHydrated();
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  // قبل الترطيب لا نعرف محتوى localStorage — نعرض هيكلاً محايداً لتفادي عدم تطابق الترطيب
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-96 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart className="w-16 h-16 text-zinc-700 mx-auto mb-6" strokeWidth={1.5} />
        <p className="text-zinc-300 text-xl mb-2">قائمة المفضلة فارغة</p>
        <p className="text-zinc-500 mb-8">احفظ ما يعجبك من المنتجات لتعود إليه لاحقاً.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 px-6 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
        >
          <Store className="w-5 h-5" />
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <p className="text-zinc-400 text-sm">{items.length} منتج محفوظ</p>
        <button
          onClick={clearWishlist}
          className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
        >
          إفراغ القائمة
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((product) => (
          <div
            key={product.id}
            className="group bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 hover:border-amber-500/40 transition-all duration-500 luxury-shadow"
          >
            <Link
              href={`/product/${product.slug ?? product.id}`}
              className="block relative h-64 overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {product.badge && (
                <div className="absolute top-4 right-4 bg-amber-500 text-zinc-950 text-xs font-black px-3 py-1 rounded-full">
                  {product.badge}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(product.id);
                }}
                aria-label={`إزالة ${product.name} من المفضلة`}
                className="absolute top-4 left-4 p-2 bg-zinc-900/80 backdrop-blur-sm rounded-full text-amber-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </Link>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Link href={`/product/${product.slug ?? product.id}`} className="flex-1">
                  <h3 className="text-xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                {product.benefit && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md font-bold">
                    {product.benefit}
                  </span>
                )}
              </div>

              <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{product.desc}</p>

              {product.price && (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold gold-text">
                      {formatAmount(product.price)}
                    </span>
                    <span className="text-zinc-500 text-sm mr-2">{CURRENCY.label}</span>
                  </div>
                  {product.weight && (
                    <span className="text-zinc-500 text-sm">{product.weight}</span>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    addItem(product);
                    removeItem(product.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  نقل إلى السلة
                </button>
                <WhatsAppButton
                  source="wishlist"
                  message={`مرحباً عسل الهيثم، أريد طلب ${product.name}`}
                  ariaLabel={`اطلب ${product.name} عبر واتساب`}
                  className="rounded-xl px-4 py-3"
                  iconClassName="h-4 w-4"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
