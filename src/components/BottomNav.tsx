'use client';

import { useHydrated } from '@/lib/useHydrated';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { SITE, getWhatsAppLink } from '@/lib/config';
import { WhatsAppIcon } from '@/components/BrandIcons';
import { useCart } from '@/store/cartStore';
import { trackWhatsAppClick } from '@/lib/analytics';

/**
 * شريط سفلي — جوال فقط. إجراءان لا قائمة تنقّل: السلة، ومراسلتنا.
 * الرئيسية والمتجر وبقية الصفحات في القائمة المنسدلة، فتكرارها هنا كان
 * يزاحم الإجراء الذي بُني الموقع لأجله على مساحة الإبهام.
 * ارتفاعه محجوز في <main> عبر pb-[4rem].
 */
export default function BottomNav() {
  const pathname = usePathname();
  const mounted = useHydrated();
  const { getTotalItems } = useCart();

  // العدّاد من localStorage — يُصفَّر قبل الترطيب لتفادي عدم التطابق
  const cartCount = mounted ? getTotalItems() : 0;

  // لا يظهر داخل لوحة التحكم
  if (pathname.startsWith('/admin')) return null;

  const onCart = pathname.startsWith('/cart');

  return (
    <nav
      aria-label="إجراءات سريعة"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-16 items-center gap-3 px-3">
        <Link
          href="/cart"
          aria-current={onCart ? 'page' : undefined}
          aria-label={`سلة الطلبات (${cartCount} عنصر)`}
          className={`relative flex h-12 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border transition-colors ${
            onCart
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
              : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span className="relative">
            <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="pop-in absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold tabular-nums text-zinc-950">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </span>
          <span className="text-[10px] font-medium leading-none">السلة</span>
        </Link>

        {/* الإجراء المقصود من الموقع كله — بلون واتساب لا بذهب العلامة */}
        <a
          href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('bottom-bar')}
          className="flex h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-[#25D366] text-base font-black text-zinc-950 transition-transform active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          اطلب عبر واتساب
        </a>
      </div>
    </nav>
  );
}
