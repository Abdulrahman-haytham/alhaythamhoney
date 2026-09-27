'use client';

import { useHydrated } from '@/lib/useHydrated';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { usePageActions } from '@/store/pageActionStore';
import { trackAddToCart } from '@/lib/analytics';
import { formatAmount } from '@/lib/money';
import { WhatsAppIcon } from '@/components/BrandIcons';
import WhatsAppButton from '@/components/WhatsAppButton';

/**
 * شريط سفلي — جوال فقط. إجراءان لا قائمة تنقّل: السلة، ومراسلتنا.
 * الرئيسية والمتجر وبقية الصفحات في القائمة المنسدلة، فتكرارها هنا كان
 * يزاحم الإجراء الذي بُني الموقع لأجله على مساحة الإبهام.
 *
 * يتكيّف مع الصفحة بدل أن يكرّرها:
 * - رسالة واتساب تحمل ما في الصفحة (المنتج وحجمه وسعره، الخلطة ووصفتها…).
 * - في صفحة المنتج، حين يغيب زر الشراء الأصلي، يصير «أضف إلى السلة» هنا
 *   وواتساب أيقونة بجانبه — شريط واحد بدل شريطين فوق بعض.
 * - في السلة يصير الزر الأخضر «أكمل الطلب»، فيُحفظ الطلب برقمه قبل واتساب.
 * ارتفاعه محجوز في <main> عبر pb-[4rem].
 */
export default function BottomNav() {
  const pathname = usePathname();
  const mounted = useHydrated();
  const { getTotalItems, addItem } = useCart();
  const buy = usePageActions((s) => s.buy?.value);
  const action = usePageActions((s) => s.action?.value);

  // العدّاد من localStorage — يُصفَّر قبل الترطيب لتفادي عدم التطابق
  const cartCount = mounted ? getTotalItems() : 0;

  // لا يظهر داخل لوحة التحكم
  if (pathname.startsWith('/admin')) return null;

  const onCart = pathname.startsWith('/cart');
  const showBuy = !!buy?.show && buy.product.price != null;

  return (
    <nav
      aria-label="إجراءات سريعة"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-16 items-center gap-2.5 px-3">
        <Link
          href="/cart"
          aria-current={onCart ? 'page' : undefined}
          aria-label={`سلة الطلبات (${cartCount} عنصر)`}
          className={`relative flex h-12 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border transition-colors ${
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

        {showBuy ? (
          <>
            <button
              type="button"
              onClick={() => {
                addItem(buy.product);
                trackAddToCart({
                  id: buy.product.id,
                  name: buy.product.name,
                  price: buy.product.price ?? undefined,
                });
              }}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 font-black text-zinc-950 transition-transform active:scale-[0.98]"
            >
              <ShoppingCart className="h-5 w-5 shrink-0" />
              <span className="truncate">أضف للسلة</span>
              <span className="shrink-0 text-sm font-bold tabular-nums opacity-80">
                {formatAmount(buy.product.price!)}
              </span>
            </button>
            <WhatsAppButton
              source="bottom-bar"
              variant="solid"
              ariaLabel="اسأل عن هذا المنتج عبر واتساب"
              className="h-12 w-12 shrink-0 rounded-xl"
              iconClassName="h-6 w-6"
            />
          </>
        ) : action ? (
          // الإجراء الذي تسجّله الصفحة (إتمام الطلب في السلة) — بأخضر واتساب لأنه ينتهي هناك
          <button
            type="button"
            onClick={action.run}
            disabled={action.busy}
            className="flex h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-whatsapp text-base font-black text-zinc-950 transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {action.busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <WhatsAppIcon className="h-5 w-5" />
            )}
            {action.label}
          </button>
        ) : (
          <WhatsAppButton source="bottom-bar" className="h-12 flex-1 gap-2.5 rounded-xl text-base">
            اطلب عبر واتساب
          </WhatsAppButton>
        )}
      </div>
    </nav>
  );
}
