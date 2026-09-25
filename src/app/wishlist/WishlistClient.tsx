'use client';

import { useHydrated } from '@/lib/useHydrated';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Store } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { getWhatsAppLink } from '@/lib/config';
import { CURRENCY, formatAmount } from '@/lib/money';

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
                <a
                  href={getWhatsAppLink(`مرحباً، أريد طلب ${product.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`اطلب ${product.name} عبر واتساب`}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
