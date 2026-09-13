'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, TicketPercent } from 'lucide-react';
import type { z } from 'zod';
import type { couponInput } from '@/lib/validation';

type Input = z.infer<typeof couponInput>;
type Row = Input & { id: string };

const empty: Input = {
  code: '',
  type: 'PERCENT',
  value: 10,
  minOrder: 0,
  maxDiscount: null,
  active: true,
  startsAt: null,
  expiresAt: null,
  note: null,
  requiresLogin: false,
  oncePerCustomer: false,
};
const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-base text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none disabled:text-zinc-500';
const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

function Editor({ coupon, onDone }: { coupon?: Row; onDone?: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<Input>(() => {
    if (!coupon) return empty;
    const { id: _id, ...rest } = coupon;
    return rest;
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  function set<K extends keyof Input>(key: K, value: Input[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  const num = (v: string) => (v === '' ? null : Number(v));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch(coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons', {
      method: coupon ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحفظ.');
    setMessage('تم الحفظ.');
    router.refresh();
    onDone?.();
  }

  async function remove() {
    if (!coupon || !window.confirm(`حذف الكوبون ${coupon.code}؟`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    setBusy(false);
    if (res?.ok) router.refresh();
    else setMessage('تعذّر الحذف.');
  }

  return (
    <form onSubmit={save} className="space-y-4 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label>
          الكود
          <input
            className={`${inputClass} font-mono uppercase`}
            dir="ltr"
            value={form.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())}
            placeholder="RAMADAN10"
            required
            pattern="[A-Za-z0-9\-]{3,30}"
          />
        </label>
        <label>
          النوع
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => set('type', e.target.value as Input['type'])}
          >
            <option value="PERCENT">نسبة مئوية %</option>
            <option value="FIXED">مبلغ ثابت (ل.س)</option>
          </select>
        </label>
        <label>
          {form.type === 'PERCENT' ? 'النسبة (1–100)' : 'المبلغ (ل.س)'}
          <input
            className={inputClass}
            type="number"
            min={1}
            max={form.type === 'PERCENT' ? 100 : 1000000000}
            value={form.value}
            onChange={(e) => set('value', Number(e.target.value))}
            required
          />
        </label>
        <label>
          الحد الأدنى للطلب (ل.س)
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.minOrder}
            onChange={(e) => set('minOrder', Number(e.target.value) || 0)}
          />
        </label>
        <label>
          سقف الخصم (ل.س، اختياري)
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.maxDiscount ?? ''}
            onChange={(e) => set('maxDiscount', num(e.target.value))}
            disabled={form.type === 'FIXED'}
          />
        </label>
        <label>
          ملاحظة داخلية
          <input
            className={inputClass}
            value={form.note ?? ''}
            onChange={(e) => set('note', e.target.value || null)}
            placeholder="لمتابعي فيسبوك"
          />
        </label>
        <label>
          يبدأ من (اختياري)
          <input
            className={inputClass}
            type="date"
            value={form.startsAt ?? ''}
            onChange={(e) => set('startsAt', e.target.value || null)}
          />
        </label>
        <label>
          ينتهي في (اختياري، يشمل اليوم)
          <input
            className={inputClass}
            type="date"
            value={form.expiresAt ?? ''}
            onChange={(e) => set('expiresAt', e.target.value || null)}
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set('active', e.target.checked)}
            className="h-4 w-4 accent-amber-500"
          />
          مفعّل
        </label>
        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={form.requiresLogin || form.oncePerCustomer}
            disabled={form.oncePerCustomer}
            onChange={(e) => set('requiresLogin', e.target.checked)}
            className="h-4 w-4 accent-amber-500"
          />
          للأعضاء المسجّلين فقط
        </label>
        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={form.oncePerCustomer}
            onChange={(e) => set('oncePerCustomer', e.target.checked)}
            className="h-4 w-4 accent-amber-500"
          />
          مرة واحدة لكل حساب
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={busy}
          className="rounded-lg bg-amber-500 px-6 py-2.5 font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {busy ? 'جارٍ الحفظ…' : coupon ? 'حفظ' : 'إنشاء الكوبون'}
        </button>
        {coupon && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" /> حذف
          </button>
        )}
        <p role="status" className="text-sm text-zinc-300">
          {message}
        </p>
      </div>
    </form>
  );
}

export function CouponsPanel({ coupons }: { coupons: Row[] }) {
  const [creating, setCreating] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setCreating(!creating)}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-500 px-4 py-2.5 text-amber-400 hover:bg-amber-500/10"
      >
        <Plus className="h-4 w-4" />
        {creating ? 'إلغاء' : 'كوبون جديد'}
      </button>
      {creating && (
        <div className="rounded-xl border border-amber-500/30 bg-zinc-900/40">
          <Editor onDone={() => setCreating(false)} />
        </div>
      )}
      {coupons.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
          لا كوبونات بعد.
        </p>
      )}
      {coupons.map((c) => {
        const expired = !!c.expiresAt && c.expiresAt < today;
        const status = !c.active
          ? { label: 'معطّل', cls: 'bg-zinc-800 text-zinc-300' }
          : expired
            ? { label: 'منتهٍ', cls: 'bg-red-500/15 text-red-300' }
            : { label: 'فعّال', cls: 'bg-green-500/15 text-green-300' };
        return (
          <details key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
            <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4">
              <TicketPercent className="h-5 w-5 text-amber-500" />
              <span className="font-mono text-lg font-bold text-white" dir="ltr">
                {c.code}
              </span>
              <span className="text-sm text-zinc-400">
                {c.type === 'PERCENT' ? `${c.value}%` : `${fmt(c.value)} ل.س`}
                {c.minOrder > 0 && ` · من ${fmt(c.minOrder)} ل.س`}
                {c.expiresAt && ` · حتى ${c.expiresAt}`}
                {c.oncePerCustomer ? ' · مرة لكل حساب' : c.requiresLogin ? ' · للأعضاء' : ''}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.cls}`}>
                {status.label}
              </span>
              {c.note && <span className="text-xs text-zinc-500">— {c.note}</span>}
            </summary>
            <Editor coupon={c} />
          </details>
        );
      })}
    </div>
  );
}
