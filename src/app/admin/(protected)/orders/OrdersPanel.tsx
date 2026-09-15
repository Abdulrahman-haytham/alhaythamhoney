'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Trash2 } from 'lucide-react';
import type { OrderStatus } from '@prisma/client';
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from '@/lib/orders';
import { fmtSyp } from '@/lib/pricing';

export interface AdminOrder {
  id: string;
  reference: string;
  status: OrderStatus;
  createdAt: string;
  confirmedAt: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerCity: string | null;
  customerEmail: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  notes: string | null;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    weight: string | null;
    recipe: string | null;
  }[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-300',
  CONFIRMED: 'bg-blue-500/15 text-blue-300',
  PREPARING: 'bg-purple-500/15 text-purple-300',
  SHIPPED: 'bg-cyan-500/15 text-cyan-300',
  DELIVERED: 'bg-green-500/15 text-green-300',
  CANCELLED: 'bg-red-500/15 text-red-300',
};

const dateFmt = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'short', timeStyle: 'short' });

function OrderRow({ order }: { order: AdminOrder }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save() {
    setBusy(true);
    setMessage('');
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes: notes.trim() || null }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحفظ.');
    setMessage('تم الحفظ.');
    router.refresh();
  }

  async function remove() {
    if (!confirm(`حذف الطلب ${order.reference} نهائياً؟`)) return;
    const res = await fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (res?.ok) router.refresh();
  }

  return (
    <details className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4 text-sm">
        <span className="font-mono font-bold text-white" dir="ltr">
          {order.reference}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_COLORS[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
        <span className="text-zinc-400">
          {order.customerName ?? 'زائر'}
          {order.customerCity ? ` · ${order.customerCity}` : ''}
        </span>
        <span className="mr-auto tabular-nums text-amber-300">{fmtSyp(order.total)} ل.س</span>
        <time className="text-xs text-zinc-500">{dateFmt.format(new Date(order.createdAt))}</time>
      </summary>
      <div className="grid gap-4 border-t border-zinc-800 p-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-bold text-zinc-500">البنود</h3>
          <ul className="space-y-1.5 text-sm">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span className="min-w-0 text-zinc-200">
                  {it.name} × {it.quantity}
                  {it.recipe ? (
                    <span className="block text-xs text-amber-500/80">{it.recipe}</span>
                  ) : (
                    it.weight && <span className="text-xs text-zinc-500"> ({it.weight})</span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-zinc-400">
                  {fmtSyp(it.price * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-zinc-800 pt-2 text-xs text-zinc-400">
            <div className="flex justify-between">
              <dt>المجموع</dt>
              <dd className="tabular-nums">{fmtSyp(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-400">
                <dt>الخصم{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                <dd className="tabular-nums">-{fmtSyp(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>الشحن</dt>
              <dd className="tabular-nums">{fmtSyp(order.shipping)}</dd>
            </div>
            <div className="flex justify-between font-bold text-white">
              <dt>الإجمالي</dt>
              <dd className="tabular-nums">{fmtSyp(order.total)} ل.س</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-zinc-300">
            <p>
              <span className="text-zinc-500">الزبون:</span>{' '}
              {order.customerName ?? 'زائر (بلا حساب)'}
            </p>
            {order.customerPhone && (
              <p dir="ltr" className="text-left">
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  className="text-green-400 hover:underline"
                >
                  {order.customerPhone}
                </a>
              </p>
            )}
            {order.customerEmail && (
              <p dir="ltr" className="text-left text-zinc-500">
                {order.customerEmail}
              </p>
            )}
          </div>
          <label className="block text-sm">
            الحالة
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            ملاحظات داخلية
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 disabled:opacity-50"
            >
              {busy ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
            <Link
              href={`/orders/${order.reference}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400"
            >
              <ExternalLink className="h-3.5 w-3.5" /> صفحة التتبع
            </Link>
            <button
              type="button"
              onClick={remove}
              className="mr-auto inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" /> حذف
            </button>
            <p role="status" className="w-full text-xs text-zinc-400">
              {message}
            </p>
          </div>
        </div>
      </div>
    </details>
  );
}

export function OrdersPanel({
  orders,
  counts,
  activeStatus,
  query,
}: {
  orders: AdminOrder[];
  counts: Partial<Record<OrderStatus, number>>;
  activeStatus: OrderStatus | null;
  query: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(query);
  const total = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0);
  const link = (status: OrderStatus | null) =>
    `/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}) })}`;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={link(null)}
          className={`rounded-full border px-3 py-1 text-xs ${!activeStatus ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}
        >
          الكل ({total})
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={link(s)}
            className={`rounded-full border px-3 py-1 text-xs ${activeStatus === s ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}
          >
            {ORDER_STATUS_LABELS[s]} ({counts[s] ?? 0})
          </Link>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(link(activeStatus));
          }}
          className="mr-auto flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="مرجع / اسم / هاتف"
            className="h-8 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white"
          />
          <button className="h-8 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-300">
            بحث
          </button>
        </form>
      </div>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          لا طلبات بعد. يظهر الطلب هنا حين يضغط الزبون «أكمل الطلب عبر واتساب».
        </p>
      ) : (
        orders.map((o) => <OrderRow key={o.id} order={o} />)
      )}
    </div>
  );
}
