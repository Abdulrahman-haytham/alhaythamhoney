import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Clock, MessageCircle, XCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings.server';
import { getWhatsAppLink } from '@/lib/config';
import {
  normalizeOrderReference,
  ORDER_STATUS_LABELS,
  ORDER_STEPS,
  orderStepIndex,
} from '@/lib/orders';
import { fmtSyp, type QuoteAdjustment } from '@/lib/pricing';

export const metadata: Metadata = { title: 'تتبّع الطلب', robots: { index: false } };
export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * صفحة تتبّع عامة بالمرجع فقط (لا اسم ولا هاتف): المرجع عشوائي 32^6 ولا يظهر
 * إلا في رسالة الزبون نفسه، وما يُعرض هنا لا يكشف بيانات شخصية.
 */
export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference: raw } = await params;
  const reference = normalizeOrderReference(raw);
  if (!reference) notFound();
  await getSettings();
  const order = await db.order.findUnique({
    where: { reference },
    include: { items: true },
  });
  if (!order) notFound();
  const breakdown = (order.breakdown ?? {}) as {
    adjustments?: QuoteAdjustment[];
    freeShipping?: boolean;
    shippingLabel?: string | null;
  };
  const cancelled = order.status === 'CANCELLED';
  const step = orderStepIndex(order.status);

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-20 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-500">تتبّع الطلب</p>
        <h1 className="mt-1 font-amiri text-3xl font-bold text-white sm:text-4xl" dir="ltr">
          {order.reference}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{dateFmt.format(order.createdAt)}</p>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          {cancelled ? (
            <p className="flex items-center gap-2 font-bold text-red-300">
              <XCircle className="h-5 w-5" /> {ORDER_STATUS_LABELS.CANCELLED}
            </p>
          ) : (
            <ol className="grid grid-cols-5 gap-1 text-center text-[11px] sm:text-xs">
              {ORDER_STEPS.map((s, i) => {
                const done = i <= step;
                const current = i === step;
                return (
                  <li key={s} className="relative">
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={`absolute top-3.5 left-1/2 h-0.5 w-full ${i <= step ? 'bg-amber-500' : 'bg-zinc-800'}`}
                      />
                    )}
                    <span
                      className={`relative z-10 mx-auto flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                        done
                          ? 'border-amber-500 bg-amber-500 text-zinc-950'
                          : 'border-zinc-700 bg-zinc-950 text-zinc-600'
                      } ${current ? 'ring-4 ring-amber-500/20' : ''}`}
                    >
                      {done ? (
                        i < step ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className={`mt-2 block leading-tight ${done ? 'font-bold text-white' : 'text-zinc-500'}`}
                    >
                      {ORDER_STATUS_LABELS[s]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          {order.status === 'PENDING' && (
            <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-100/90">
              أرسلت رسالة واتساب؟ نؤكد الطلب معك هناك خلال ساعات العمل وتتحدّث الحالة هنا.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="mb-4 font-amiri text-xl font-bold text-white">البنود</h2>
          <ul className="divide-y divide-zinc-800">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-3 text-sm">
                {it.image && (
                  <img src={it.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white">{it.name}</p>
                  <p className="text-xs text-zinc-500">
                    {it.recipe ?? it.weight ?? ''} × {it.quantity}
                  </p>
                </div>
                <p className="tabular-nums text-zinc-300">{fmtSyp(it.price * it.quantity)} ل.س</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-zinc-800 pt-4 text-sm">
            <div className="flex justify-between text-zinc-400">
              <dt>المجموع</dt>
              <dd className="tabular-nums">{fmtSyp(order.subtotal)} ل.س</dd>
            </div>
            {(breakdown.adjustments ?? []).map((a) => (
              <div key={a.label} className="flex justify-between text-green-400">
                <dt>{a.label}</dt>
                <dd className="tabular-nums">-{fmtSyp(a.amount)} ل.س</dd>
              </div>
            ))}
            <div className="flex justify-between text-zinc-400">
              <dt>الشحن{breakdown.shippingLabel ? ` — ${breakdown.shippingLabel}` : ''}</dt>
              <dd className="tabular-nums">
                {breakdown.freeShipping ? 'مجاني' : `${fmtSyp(order.shipping)} ل.س`}
              </dd>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold text-white">
              <dt>الإجمالي</dt>
              <dd className="gold-text tabular-nums">{fmtSyp(order.total)} ل.س</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={getWhatsAppLink(`مرحباً، أستفسر عن طلبي رقم ${order.reference}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-500"
          >
            <MessageCircle className="h-4 w-4" /> استفسر عن الطلب
          </a>
          <Link
            href="/shop"
            className="inline-flex items-center rounded-xl border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 hover:border-zinc-500"
          >
            متابعة التسوّق
          </Link>
        </div>
      </div>
    </section>
  );
}
