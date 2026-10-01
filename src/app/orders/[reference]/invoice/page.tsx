import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getInvoiceOrder, invoiceThumb } from '@/lib/invoice.server';
import { getSettings } from '@/lib/settings.server';
import { BUSINESS } from '@/lib/business';
import { SITE } from '@/lib/config';
import { CURRENCY, formatAmount } from '@/lib/money';
import { ORDER_STATUS_LABELS, orderLabel } from '@/lib/orders';

export const metadata: Metadata = { title: 'فاتورة الطلب', robots: { index: false } };
export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('ar-SY-u-nu-latn', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Damascus',
});

const money = (n: number) => `${formatAmount(n)} ${CURRENCY.label}`;

/**
 * الفاتورة بصفحة A4 بيضاء — هذه الصفحة هي ما يطبعه Chromium إلى PDF في
 * `/orders/[reference]/invoice.pdf`، وتُفتح في المتصفح أيضاً للمعاينة والطباعة.
 */
export default async function InvoicePage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const [order, settings] = await Promise.all([getInvoiceOrder(reference), getSettings()]);
  if (!order) notFound();
  const { breakdown } = order;
  const units = order.items.reduce((n, it) => n + it.quantity, 0);
  const [logo, ...thumbs] = await Promise.all([
    invoiceThumb('/images/logo.webp', 128),
    ...order.items.map((it) => invoiceThumb(it.image)),
  ]);

  return (
    <div className="invoice mx-auto max-w-[210mm] bg-white px-8 py-8 text-zinc-900">
      <style>{`
        html, body { background: #fff !important; color: #18181b; }
        @page { size: A4; margin: 12mm; }
        @media print { .invoice { padding: 0 !important; } }
        .invoice tr { break-inside: avoid; }
      `}</style>

      <header className="flex items-start justify-between gap-6 border-b-2 border-amber-500 pb-5">
        <div className="flex items-center gap-4">
          <img
            src={logo ?? '/images/logo.webp'}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div>
            <p className="font-amiri text-2xl font-bold text-zinc-900">{SITE.name}</p>
            <p className="text-xs text-zinc-500">
              {BUSINESS.address.locality}، {BUSINESS.address.region} —{' '}
              <span dir="ltr">{settings.phoneDisplay}</span>
            </p>
            <p className="text-xs text-zinc-500" dir="ltr">
              {SITE.url.replace(/^https?:\/\//, '')}
            </p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-xs font-bold tracking-widest text-amber-600">فاتورة طلب</p>
          <p className="mt-1 text-xl font-black" dir="ltr">
            {orderLabel(order)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{dateFmt.format(order.createdAt)}</p>
          <p className="mt-1 text-xs text-zinc-500">الحالة: {ORDER_STATUS_LABELS[order.status]}</p>
        </div>
      </header>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-300 text-xs text-zinc-500">
            <th className="py-2 text-right font-bold">المنتج</th>
            <th className="py-2 text-center font-bold">سعر القطعة</th>
            <th className="py-2 text-center font-bold">الكمية</th>
            <th className="py-2 text-left font-bold">المجموع</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it, i) => (
            <tr key={it.id} className="border-b border-zinc-200 align-middle">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  {thumbs[i] ? (
                    <img
                      src={thumbs[i]!}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg border border-zinc-200 object-cover"
                    />
                  ) : (
                    <span className="h-16 w-16 shrink-0 rounded-lg bg-amber-50" />
                  )}
                  <div>
                    <p className="font-bold">{it.name}</p>
                    {it.weight && <p className="text-xs text-zinc-500">{it.weight}</p>}
                    {it.recipe && (
                      <p className="mt-0.5 max-w-[80mm] text-[11px] leading-relaxed text-zinc-500">
                        {it.recipe}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 text-center tabular-nums">
                {it.price === 0 ? 'هدية' : money(it.price)}
              </td>
              <td className="py-3 text-center tabular-nums">{it.quantity}</td>
              <td className="py-3 text-left font-bold tabular-nums">
                {it.price === 0 ? '—' : money(it.price * it.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <dl className="w-full max-w-[90mm] space-y-2 text-sm">
          <div className="flex justify-between text-zinc-600">
            <dt>المجموع ({units} قطعة)</dt>
            <dd className="tabular-nums">{money(order.subtotal)}</dd>
          </div>
          {(breakdown.adjustments ?? []).map((a) => (
            <div key={a.label} className="flex justify-between text-green-700">
              <dt>{a.label}</dt>
              <dd className="tabular-nums">-{money(a.amount)}</dd>
            </div>
          ))}
          <div className="flex justify-between text-zinc-600">
            <dt>الشحن{breakdown.shippingLabel ? ` — ${breakdown.shippingLabel}` : ''}</dt>
            <dd className="tabular-nums">
              {breakdown.freeShipping ? 'مجاني' : money(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between rounded-xl bg-amber-50 px-3 py-3 text-lg font-black text-zinc-900">
            <dt>الإجمالي النهائي</dt>
            <dd className="tabular-nums">{money(order.total)}</dd>
          </div>
        </dl>
      </div>

      <footer className="mt-10 border-t border-zinc-200 pt-4 text-center text-[11px] leading-relaxed text-zinc-500">
        الأسعار كما ظهرت في السلة عند الطلب، ونؤكد السعر النهائي والشحن معك على واتساب قبل التحضير.
        الدفع عند الاستلام. شكراً لثقتك بعسل الهيثم.
      </footer>
    </div>
  );
}
