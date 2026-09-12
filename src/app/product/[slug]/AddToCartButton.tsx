'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import { useCart, type CartProduct } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { useHydrated } from '@/lib/useHydrated';

export default function AddToCartButton({
  product,
  available = true,
}: {
  product: CartProduct;
  available?: boolean;
}) {
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isWishlisted } = useWishlist();
  const [added, setAdded] = useState(false);
  const hydrated = useHydrated();
  const wishlisted = hydrated && isWishlisted(product.id);
  const canOrder = available && product.price != null;

  function handleAdd() {
    if (!canOrder) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={handleAdd}
        disabled={!canOrder}
        className="flex-1 bg-amber-500 text-zinc-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20"
      >
        {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
        <span>
          {!available
            ? 'غير متوفر حالياً'
            : product.price == null
              ? 'تواصل لمعرفة السعر'
              : added
                ? 'أُضيف إلى السلة'
                : 'أضف إلى السلة'}
        </span>
      </button>
      <button
        onClick={() => (wishlisted ? removeWishlist(product.id) : addWishlist(product))}
        aria-label={wishlisted ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}
        className={`flex items-center justify-center px-6 py-4 rounded-xl font-bold transition-all ${
          wishlisted
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
            : 'bg-zinc-800 text-zinc-300 border border-white/5 hover:bg-zinc-700 hover:text-red-400'
        }`}
      >
        <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
