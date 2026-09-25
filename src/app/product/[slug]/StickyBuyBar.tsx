'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart, type CartProduct } from '@/store/cartStore';
import { getWhatsAppLink } from '@/lib/config';
import { trackAddToCart, trackWhatsAppClick } from '@/lib/analytics';
import { CURRENCY, formatAmount } from '@/lib/money';

/**
 * شريط شراء لاصق للجوال (Odoo-style): يظهر فوق شريط التنقّل السفلي حين يغيب
 * زر «أضف إلى السلة» الأصلي عن الشاشة، فيبقى السعر والزر تحت الإبهام دائماً.
 * `anchorId` هو عنصر زر الشراء الأصلي الذي نراقب اختفاءه.
 */
export default function StickyBuyBar({
  product,
  available,
  anchorId,
}: {
  product: CartProduct;
  available: boolean;
  anchorId: string;
}) {
  const [show, setShow] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const seen = useRef(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // لا نُظهر الشريط قبل أن يمرّ الزائر على الزر الأصلي مرة (يمنع الوميض عند التحميل)
        if (entry.isIntersecting) seen.current = true;
        setShow(seen.current && !entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, [anchorId]);

  const canOrder = available && product.price != null;

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-amber-500/20 bg-zinc-950/95 px-3 py-2 backdrop-blur-md transition-transform duration-300 sm:hidden ${
        show ? 'translate-y-0' : 'translate-y-[120%]'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-white">{product.name}</p>
          {product.price != null ? (
            <p className="gold-text text-sm font-bold tabular-nums">
              {formatAmount(product.price)}{' '}
              <span className="text-[10px] text-zinc-500">{CURRENCY.label}</span>
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500">تواصل لمعرفة السعر</p>
          )}
        </div>
        {canOrder ? (
          <button
            type="button"
            tabIndex={show ? 0 : -1}
            onClick={() => {
              addItem(product);
              trackAddToCart({
                id: product.id,
                name: product.name,
                price: product.price ?? undefined,
              });
            }}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-amber-500 px-4 text-xs font-bold text-zinc-950"
          >
            <ShoppingCart className="h-4 w-4" /> أضف إلى السلة
          </button>
        ) : (
          <a
            href={getWhatsAppLink(`مرحباً عسل الهيثم، أود الاستفسار عن: ${product.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={show ? 0 : -1}
            onClick={() => trackWhatsAppClick('sticky-bar')}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-green-600 px-4 text-xs font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" /> اسأل عبر واتساب
          </a>
        )}
      </div>
    </div>
  );
}
