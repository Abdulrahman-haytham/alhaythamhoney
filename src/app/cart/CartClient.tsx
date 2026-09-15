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
  PackageCheck,
  AlertTriangle,
  Gift,
  MapPin,
  Coins,
} from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { getWhatsAppLink } from '@/lib/config';
import { useSettings } from '@/components/SettingsProvider';
import { trackBeginCheckout, trackWhatsAppClick } from '@/lib/analytics';
import { normalizeCouponCode, LOGIN_REQUIRED_REASON } from '@/lib/coupons';
import { buildQuote, whatsappOrderMessage, type Quote } from '@/lib/pricing';
import { generateOrderReference } from '@/lib/orders';

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

/** حقل الكوبون — الكود يُحفظ في السلة ويتحقق منه الخادم ضمن عرض السعر. */
function CouponField({ quote, busy }: { quote: Quote; busy: boolean }) {
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = useState('');
  const result = quote.coupon;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeCouponCode(code);
    if (normalized) setCoupon(normalized);
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
          {busy && couponCode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تطبيق'}
        </button>
      </div>
      {result && !result.ok && (
        <p className="text-xs text-red-400">
          {result.reason}
          {result.reason === LOGIN_REQUIRED_REASON && (
            <>
              {' '}
              <Link href="/account/login?next=/cart" className="font-bold text-amber-400 underline">
                تسجيل الدخول
              </Link>
            </>
          )}
        </p>
      )}
    </form>
  );
}

/** ما يُعرض بعد الضغط على واتساب: رقم الطلب ورابط المتابعة. */
function OrderPlaced({ reference, onClear }: { reference: string; onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
      <p className="flex items-center gap-2 font-bold text-green-300">
        <PackageCheck className="h-5 w-5" />
        سُجّل طلبك برقم <b dir="ltr">{reference}</b>
      </p>
      <p className="mt-1 text-sm text-zinc-300">
        أرسل الرسالة في واتساب لنؤكده معك. يمكنك متابعة حالته في أي وقت من صفحة التتبع.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/orders/${reference}`}
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-500"
        >
          تتبّع الطلب
        </Link>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
        >
          إفراغ السلة
        </button>
      </div>
    </div>
  );
}

export function CartClient() {
  const mounted = useHydrated();
  const { items, removeItem, updateQuantity, clearCart, getTotalItems } = useCart();
  const settings = useSettings();
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const zoneId = useCart((s) => s.zoneId);
  const setZone = useCart((s) => s.setZone);
  const usePoints = useCart((s) => s.usePoints);
  const setUsePoints = useCart((s) => s.setUsePoints);
  const [serverQuote, setServerQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);

  // توقيع السلة: أي تغيير في البنود أو الكميات أو الكوبون يعيد التسعير من الخادم
  const signature = items.map((i) => `${i.id}:${i.quantity}`).join('|');
  useEffect(() => {
    if (!mounted || !signature) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setQuoting(true);
      fetch('/api/cart/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ id, quantity }) => ({ id, quantity })),
          couponCode,
          zoneId,
          usePoints,
        }),
      })
        .then((r) => (r.ok ? (r.json() as Promise<Quote>) : Promise.reject(new Error())))
        .then((q) => {
          if (cancelled) return;
          setServerQuote(q);
          setQuoteError(null);
          // ما لم يعد متاحاً يُحذف من السلة بدل أن يبقى بسعر قديم
          for (const d of q.dropped) removeItem(d.cartId);
          // كود غير صالح يُحذف؛ أما «لم يبلغ الحد الأدنى» فيبقى ليُطبَّق حين يزيد الطلب
          if (q.coupon && !q.coupon.ok && !q.coupon.reason.startsWith('الحد الأدنى'))
            setCoupon(null);
        })
        .catch(() => {
          if (!cancelled) setQuoteError('تعذّر تحديث الأسعار من الخادم — تُعرض الأسعار المحفوظة.');
        })
        .finally(() => {
          if (!cancelled) setQuoting(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, signature, couponCode, zoneId, usePoints]);

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
      <div className="space-y-6">
        {placed && <OrderPlaced reference={placed} onClear={() => setPlaced(null)} />}
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
      </div>
    );
  }

  // عرض الخادم هو المعتمد؛ وقبل وصوله (أو عند انقطاع الشبكة) نحسب محلياً بالمحرّك نفسه
  const localQuote = buildQuote({
    lines: items.map((i) => ({
      cartId: i.id,
      productId: i.recipe ? null : (i.productId ?? i.id),
      variantId: i.variantId ?? null,
      name: i.name,
      unitPrice: i.price ?? 0,
      quantity: i.quantity,
      weight: i.weight ?? null,
      image: i.image,
      recipe: i.recipe ?? null,
    })),
    coupon: null,
    shippingCost: settings.shippingCost,
    freeShippingThreshold: settings.freeShippingThreshold,
  });
  const stale =
    !serverQuote ||
    serverQuote.lines.map((l) => `${l.cartId}:${l.quantity}`).join('|') !== signature;
  const quote = stale
    ? {
        ...localQuote,
        coupon: serverQuote?.coupon ?? null,
        zones: serverQuote?.zones ?? [],
        zoneId: serverQuote?.zoneId ?? zoneId,
        loyalty: serverQuote?.loyalty ?? null,
      }
    : serverQuote;
  const afterDiscount = quote.subtotal - quote.discount;

  function placeOrder() {
    const reference = generateOrderReference();
    const trackUrl = `${window.location.origin}/orders/${reference}`;
    // فتح واتساب متزامن مع النقرة (سفاري يحجبه بعد أي انتظار)، والتسجيل يلحق في الخلفية
    window.open(
      getWhatsAppLink(whatsappOrderMessage(quote, reference, trackUrl)),
      '_blank',
      'noopener,noreferrer',
    );
    void fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference,
        items: items.map(({ id, quantity }) => ({ id, quantity })),
        couponCode: quote.coupon?.ok ? quote.coupon.code : null,
        zoneId: quote.zoneId,
        usePoints: (quote.loyalty?.pointsUsed ?? 0) > 0,
      }),
      keepalive: true,
    }).catch(() => null);
    trackWhatsAppClick('cart-order');
    trackBeginCheckout(
      quote.total,
      items.map((i) => ({ id: i.id, name: i.name, price: i.price ?? 0, quantity: i.quantity })),
    );
    setPlaced(reference);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {placed && (
          <OrderPlaced
            reference={placed}
            onClear={() => {
              clearCart();
            }}
          />
        )}
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
          {items.map((item) => {
            const line = quote.lines.find((l) => l.cartId === item.id);
            const lineTotal = line?.lineTotal ?? (item.price ?? 0) * item.quantity;
            return (
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
                      {line?.lineDiscountLabel && (
                        <p className="mt-1 text-xs font-bold text-green-400">
                          {line.lineDiscountLabel}
                        </p>
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
                      {line && line.lineDiscount > 0 && (
                        <span className="ml-2 text-xs text-zinc-500 line-through tabular-nums">
                          {fmt(line.unitPrice * line.quantity)}
                        </span>
                      )}
                      <span className="gold-text text-lg font-bold tabular-nums">
                        {fmt(lineTotal)}
                      </span>
                      <span className="mr-1 text-xs text-zinc-500">ل.س</span>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {quote.gifts.length > 0 && (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-green-300">
              <Gift className="h-4 w-4" /> هدايا مع طلبك
            </p>
            <ul className="space-y-2">
              {quote.gifts.map((g) => (
                <li key={g.promotionId + g.productId} className="flex items-center gap-3 text-sm">
                  {g.image && (
                    <img src={g.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  )}
                  <span className="text-white">
                    {g.name} × {g.quantity}
                  </span>
                  <span className="mr-auto text-xs text-zinc-400">
                    {g.label} · بقيمة {fmt(g.value)} ل.س
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-32 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <h2 className="mb-5 flex items-center justify-between font-amiri text-xl font-bold text-white">
            ملخّص الطلب
            {quoting && <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />}
          </h2>
          {quoteError && (
            <p className="mb-3 flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {quoteError}
            </p>
          )}
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between text-zinc-300">
              <dt>المجموع</dt>
              <dd className="tabular-nums">{fmt(quote.subtotal)} ل.س</dd>
            </div>
            {quote.adjustments.map((a) => (
              <div key={a.kind + a.label} className="flex justify-between gap-3 text-green-400">
                <dt className="min-w-0 truncate">{a.label}</dt>
                <dd className="shrink-0 tabular-nums">-{fmt(a.amount)} ل.س</dd>
              </div>
            ))}
            {quote.zones.length > 0 && (
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs text-zinc-400">
                  <MapPin className="h-3.5 w-3.5" /> محافظة التوصيل
                </span>
                <select
                  value={quote.zoneId ?? ''}
                  onChange={(e) => setZone(e.target.value || null)}
                  aria-label="محافظة التوصيل"
                  className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="">اختر المحافظة…</option>
                  {quote.zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {fmt(z.cost)} ل.س{z.etaText ? ` · ${z.etaText}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex justify-between text-zinc-300">
              <dt className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-zinc-500" />
                الشحن{quote.shippingLabel ? ` — ${quote.shippingLabel}` : ''}
              </dt>
              <dd className="tabular-nums">
                {quote.freeShipping ? (
                  <span className="text-green-400">مجاني</span>
                ) : (
                  `${fmt(quote.shipping)} ل.س`
                )}
              </dd>
            </div>
            {settings.freeShippingThreshold > 0 && (
              <FreeShippingProgress
                subtotal={afterDiscount}
                threshold={settings.freeShippingThreshold}
              />
            )}
            {quote.hints
              .filter((h) => !h.includes('التوصيل مجانياً'))
              .map((h) => (
                <p
                  key={h}
                  className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90"
                >
                  {h}
                </p>
              ))}
            {settings.couponsEnabled && <CouponField quote={quote} busy={quoting} />}
            {quote.loyalty && (
              <label
                className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                  quote.loyalty.redeemablePoints > 0
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-zinc-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={usePoints && quote.loyalty.redeemablePoints > 0}
                  disabled={quote.loyalty.redeemablePoints === 0}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="mt-0.5 accent-amber-500"
                />
                <span className="text-zinc-300">
                  <span className="flex items-center gap-1 font-bold text-amber-300">
                    <Coins className="h-3.5 w-3.5" /> نقاطك: {fmt(quote.loyalty.balance)}
                  </span>
                  {quote.loyalty.redeemablePoints > 0
                    ? `استبدل ${fmt(quote.loyalty.redeemablePoints)} نقطة = خصم ${fmt(quote.loyalty.redeemableAmount)} ل.س`
                    : (quote.loyalty.blocked ?? 'لا نقاط قابلة للاستبدال على هذا الطلب')}
                </span>
              </label>
            )}
            <div className="flex justify-between border-t border-zinc-800 pt-3 text-base font-bold text-white">
              <dt>الإجمالي</dt>
              <dd className="tabular-nums">
                <span className="gold-text">{fmt(quote.total)}</span>{' '}
                <span className="text-xs font-normal text-zinc-500">ل.س</span>
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={placeOrder}
            disabled={quote.lines.length === 0}
            className="mt-6 flex h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-500 disabled:opacity-50"
          >
            <MessageCircle className="h-5 w-5" />
            أكمل الطلب عبر واتساب
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
            الأسعار في السلة تقديرية وقد تتغير. نؤكد السعر النهائي والشحن والتوفر على واتساب قبل
            إتمام الطلب، ولا يتم دفع إلكتروني هنا.
          </p>
        </div>
      </aside>
    </div>
  );
}
