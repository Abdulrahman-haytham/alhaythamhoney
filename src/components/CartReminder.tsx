'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { useSettings } from '@/components/SettingsProvider';

const SESSION_KEY = 'alhaytham-cart-reminder';

/**
 * السلة المتروكة (نسخة بلا بريد): إن عاد الزائر وفي سلته أصناف لم يلمسها منذ
 * ساعات، نذكّره مرة واحدة في الجلسة. الأدمن يفعّلها ويضبط المدة من الإعدادات.
 */
export default function CartReminder() {
  const { cartReminderEnabled, cartReminderHours } = useSettings();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!cartReminderEnabled || pathname === '/cart') return;
    // persist يعيد الترطيب بعد التركيب؛ ننتظر لحظة حتى تُقرأ السلة من التخزين
    const id = setTimeout(() => {
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
        const { items, updatedAt } = useCart.getState();
        const qty = items.reduce((s, i) => s + i.quantity, 0);
        if (qty === 0 || !updatedAt) return;
        if (Date.now() - updatedAt < cartReminderHours * 3600 * 1000) return;
        sessionStorage.setItem(SESSION_KEY, '1');
        setCount(qty);
        setShow(true);
      } catch {
        // التخزين محجوب (وضع خاص) — لا تذكير
      }
    }, 800);
    return () => clearTimeout(id);
  }, [cartReminderEnabled, cartReminderHours, pathname]);

  return (
    <>
      {show && (
        <div
          className="pop-in fixed inset-x-3 top-[calc(5.5rem+env(safe-area-inset-top))] z-[80] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-amber-500/30 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-md sm:top-28"
          role="status"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">سلتك ما زالت بانتظارك</p>
            <p className="text-xs text-zinc-400">
              {count === 1 ? 'قطعة واحدة' : `${count} قطع`} محفوظة — أكمل طلبك عبر واتساب في دقيقة.
            </p>
          </div>
          <Link
            href="/cart"
            onClick={() => setShow(false)}
            className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400"
          >
            عرض السلة
          </Link>
          <button
            type="button"
            onClick={() => setShow(false)}
            aria-label="إغلاق"
            className="shrink-0 rounded-lg p-1 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
