'use client';

import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { trackAddToCart } from '@/lib/analytics';

/** يضيف كمية العرض كاملة (اشترِ 2…) فتحقّق السلة شرطه وتطبّق الهدية فوراً. */
export default function OfferAddButton({
  product,
  quantity,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    weight: string | null;
  };
  quantity: number;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        addItem(
          {
            id: product.id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            price: product.price,
            weight: product.weight ?? undefined,
          },
          quantity,
        );
        trackAddToCart({ id: product.id, name: product.name, price: product.price });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-bold text-zinc-950"
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {added ? 'أُضيف إلى السلة' : quantity > 1 ? `أضف ${quantity} للسلة` : 'أضف للسلة'}
    </button>
  );
}
