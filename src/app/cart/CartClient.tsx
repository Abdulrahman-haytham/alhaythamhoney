'use client';

import { useEffect, useState } from 'react';
import { useHydrated } from '@/lib/useHydrated';
import Link from 'next/link';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Store,
  Truck,
  TicketPercent,
  X,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { getWhatsAppLink } from '@/lib/config';
import { useSettings } from '@/components/SettingsProvider';
import { trackBeginCheckout } from '@/lib/analytics';
import { normalizeCouponCode, type CouponResult } from '@/lib/coupons';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

/**
 * شريط تقدّم التوصيل المجاني (Odoo-style): يُظهر للزبون كم بقي ليصل إلى العتبة
 * بدل رقم جاف — أقوى محفّز لرفع متوسط الطلب.
 */
function FreeShippingProgress({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  const remaining = threshold - subtotal;
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs text-amber-200/90">
        <Truck className="h-4 w-4 text-amber-500" />
        {remaining > 0 ? (
          <>
            أضف <b className="tabular-nums">{fmt(remaining)}</b> ل.س ليصبح التوصيل مجانياً
          </>
        ) : (
          <b className="text-green-400">🎉 حصلت على التوصيل المجاني</b>
        )}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="التقدّم نحو التوصيل المجاني"
        className="h-2 overflow-hidden rounded-full bg-zinc-800"
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-green-500' : 'gold-gradient'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** حقل الكوبون — يتحقق من الخادم ويحفظ الكود في السلة ليُعاد تطبيقه تلقائياً. */
function CouponField({
  subtotal,
  result,
  onResult,
}: {
  subtotal: number;
  result: CouponResult | null;
  onResult: (r: CouponResult | null) => void;
}) {
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  // التحقق يتم دائماً في الخادم: عند الإدخال، وعند فتح السلة، وعند تغيّر المجموع
  useEffect(() => {
    if (!couponCode) return;
    let cancelled = false;
    fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode, subtotal }),
    })
      .then((r) => r.json() as Promise<CouponResult>)
      .catch((): CouponResult => ({ ok: false, reason: 'تعذّر التحقق. حاول مجدداً.' }))
      .then((data) => {
        if (cancelled) return;
        onResult(data);
        // كود غير صالح يُحذف؛ أما «لم يبلغ الحد الأدنى» فيبقى ليُطبَّق تلقائياً حين يزيد الطلب
        if (!data.ok && !data.reason.startsWith('الحد الأدنى')) setCoupon(null);
        setBusy(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode, subtotal, tick]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeCouponCode(code);
    if (!normalized) return;
    setBusy(true);
    if (normalized === couponCode) setTick((t) => t + 1);
    else setCoupon(normalized);
  }

  if (result?.ok) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm">
        <span className="flex items-center gap-1.5 text-green-300">
          <TicketPercent className="h-4 w-4" />
          <b dir="ltr">{result.code}</b> — {result.label}
        </span>
        <button
          type="button"
          onClick={() => {
            setCoupon(null);
            onResult(null);
            setCode('');
          }}
          aria-label="إزالة الكوبون"
          className="rounded-md p-1 text-zinc-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="كود الخصم"
          dir="ltr"
          aria-label="كود الخصم"
          className="h-10 min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="h-10 rounded-xl border border-amber-500/40 px-4 text-sm font-bold text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تطبيق'}
        </button>
      </div>
      {result && !result.ok && <p className="text-xs text-red-400">{result.reason}</p>}
    </form>
  );
}

export function CartClient() {
  const mounted = useHydrated();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();
  const { shippingCost, freeShippingThreshold, couponsEnabled } = useSettings();
  const couponCode = useCart((s) => s.couponCode);
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  // نتيجة التحقق تُعتمد فقط ما دام الكود محفوظاً في السلة (إفراغ السلة يلغيه)
  const coupon = couponCode || (couponResult && !couponResult.ok) ? couponResult : null;

  if (!mounted) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 py-20 text-center">
        <ShoppingCart className="mx-auto mb-6 h-16 w-16 text-zinc-700" strokeWidth={1.5} />
        <p className="mb-2 text-xl text-zinc-300">سلتك فارغة</p>
        <p className="mb-8 text-zinc-500">أضف ما يعجبك من العسل والخلطات لتراه هنا.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400"
        >
          <Store className="h-5 w-5" />
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const discount = coupon?.ok ? coupon.discount : 0;
  const afterDiscount = subtotal - discount;
  const freeShipping = freeShippingThreshold > 0 && afterDiscount >= freeShippingThreshold;
  const shipping = freeShipping ? 0 : shippingCost;
  const total = afterDiscount + shipping;

  const waMessage = [
    'مرحباً عسل الهيثم، أود تأكيد هذا الطلب:',
    '',
    ...items.map((i) => {
      const line = `• ${i.name} × ${i.quantity}${i.weight ? ` (${i.weight})` : ''} — ${fmt((i.price ?? 0) * i.quantity)} ل.س`;
      return i.recipe ? `${line}\n   الوصفة: ${i.recipe}` : line;
    }),
    '',
    `المجموع: ${fmt(subtotal)} ل.س`,
    ...(coupon?.ok ? [`كوبون ${coupon.code} (${coupon.label}): -${fmt(discount)} ل.س`] : []),
    `الشحن: ${freeShipping ? 'مجاني' : `${fmt(shipping)} ل.س`}`,
    `الإجمالي: ${fmt(total)} ل.س`,
    '',
    'هذه الأسعار من السلة المحفوظة. أرجو تأكيد السعر النهائي والشحن والتوفر ومدة التوصيل.',
  ].join('\n');

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">{getTotalItems()} قطعة في السلة</p>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-zinc-500 transition-colors hover:text-red-400"
          >
            إفراغ السلة
          </button>
        </div>

        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4"
            >
              {}
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 flex-shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-amiri text-lg font-bold leading-snug text-white">
                      {item.name}
                    </h3>
                    {item.recipe ? (
                      <p className="mt-1 text-xs leading-relaxed text-amber-500/90">
                        {item.recipe}
                      </p>
                    ) : (
                      item.weight && <p className="mt-0.5 text-xs text-zinc-500">{item.weight}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`إزالة ${item.name}`}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="تقليل الكمية"
                      className="flex h-9 w-9 items-center justify-center text-zinc-300 transition-colors hover:text-amber-400"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="زيادة الكمية"
                      className="flex h-9 w-9 items-center justify-center text-zinc-300 transition-colors hover:text-amber-400"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-left leading-none">
                    <span className="gold-text text-lg font-bold tabular-nums">
                      {fmt((item.price ?? 0) * item.quantity)}
                    </span>
                    <span className="mr-1 text-xs text-zinc-500">ل.س</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-32 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <h2 className="mb-5 font-amiri text-xl font-bold text-white">ملخّص الطلب</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between text-zinc-300">
              <dt>المجموع</dt>
              <dd className="tabular-nums">{fmt(subtotal)} ل.س</dd>
            </div>
            {coupon?.ok && (
              <div className="flex justify-between text-green-400">
                <dt>الخصم ({coupon.label})</dt>
                <dd className="tabular-nums">-{fmt(discount)} ل.س</dd>
              </div>
            )}
            <div className="flex justify-between text-zinc-300">
              <dt className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-zinc-500" />
                الشحن
              </dt>
              <dd className="tabular-nums">
                {freeShipping ? (
                  <span className="text-green-400">مجاني</span>
                ) : (
                  `${fmt(shipping)} ل.س`
                )}
              </dd>
            </div>
            {freeShippingThreshold > 0 && (
              <FreeShippingProgress subtotal={afterDiscount} threshold={freeShippingThreshold} />
            )}
            {couponsEnabled && (
              <CouponField subtotal={subtotal} result={coupon} onResult={setCouponResult} />
            )}
            <div className="flex justify-between border-t border-zinc-800 pt-3 text-base font-bold text-white">
              <dt>الإجمالي</dt>
              <dd className="tabular-nums">
                <span className="gold-text">{fmt(total)}</span>{' '}
                <span className="text-xs font-normal text-zinc-500">ل.س</span>
              </dd>
            </div>
          </dl>

          <a
            href={getWhatsAppLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackBeginCheckout(
                total,
                items.map((i) => ({
                  id: i.id,
                  name: i.name,
                  price: i.price ?? 0,
                  quantity: i.quantity,
                })),
              )
            }
            className="mt-6 flex h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-500"
          >
            <MessageCircle className="h-5 w-5" />
            أكمل الطلب عبر واتساب
          </a>
          <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
            الأسعار في السلة تقديرية وقد تتغير. نؤكد السعر النهائي والشحن والتوفر على واتساب قبل
            إتمام الطلب، ولا يتم دفع إلكتروني هنا.
          </p>
        </div>
      </aside>
    </div>
  );
}
