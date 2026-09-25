'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, ShoppingCart, Truck, X } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { useSettings } from '@/components/SettingsProvider';
import { formatPrice } from '@/lib/money';

/**
 * تأكيد «أُضيف إلى السلة» على طريقة Odoo: يظهر بعد أي إضافة من أي مكان
 * (بطاقة، صفحة منتج، خلطة) مع خيار متابعة التسوق أو الذهاب للسلة،
 * وسطر يخبر الزبون كم بقي للتوصيل المجاني.
 */
export default function CartToast() {
  const lastAdded = useCart((s) => s.lastAdded);
  const dismiss = useCart((s) => s.dismissLastAdded);
  const subtotal = useCart((s) => s.items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0));
  const { freeShippingThreshold } = useSettings();
  const pathname = usePathname();

  useEffect(() => {
    if (!lastAdded) return;
    const id = setTimeout(dismiss, 5000);
    return () => clearTimeout(id);
  }, [lastAdded, dismiss]);

  // في صفحة السلة نفسها لا معنى للتوست
  const visible = !!lastAdded && pathname !== '/cart';
  const remaining = freeShippingThreshold > 0 ? freeShippingThreshold - subtotal : 0;

  return (
    <>
      {visible && lastAdded && (
        <div
          className="pop-in fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[90] mx-auto max-w-md rounded-2xl border border-amber-500/30 bg-zinc-900/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:left-6"
          key={lastAdded.at}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <img
              src={lastAdded.item.image}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                <Check className="h-3.5 w-3.5" /> أُضيف إلى السلة
              </p>
              <p className="truncate text-sm font-bold text-white">{lastAdded.item.name}</p>
              {freeShippingThreshold > 0 && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400">
                  <Truck className="h-3 w-3 text-amber-500" />
                  {remaining > 0
                    ? `أضف ${formatPrice(remaining)} ليصبح التوصيل مجانياً`
                    : 'التوصيل مجاني لهذا الطلب'}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="إغلاق"
              className="shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl border border-zinc-700 py-2 text-xs font-bold text-zinc-300 hover:border-zinc-500"
            >
              متابعة التسوق
            </button>
            <Link
              href="/cart"
              onClick={dismiss}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> اذهب إلى السلة
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
