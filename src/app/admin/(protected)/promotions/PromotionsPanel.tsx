'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Percent, ShoppingBag, Trash2 } from 'lucide-react';
import type { z } from 'zod';
import type { promotionInput } from '@/lib/validation';
import { formatAmount, formatPrice } from '@/lib/money';

type Input = z.infer<typeof promotionInput>;
export type PromotionRow = Input & { id: string; usedThisMonth: number; usesThisMonth: number };
type ProductOpt = { id: string; name: string; price: number | null };

const KINDS: { value: Input['kind']; label: string; hint: string; icon: typeof Gift }[] = [
  {
    value: 'PERCENT_OVER_AMOUNT',
    label: 'خصم نسبة عند تجاوز مبلغ',
    hint: 'مثال: خصم 5% على الطلبات فوق 500 ألف',
    icon: Percent,
  },
  {
    value: 'GIFT_OVER_AMOUNT',
    label: 'هدية عند تجاوز مبلغ',
    hint: 'مثال: شمعة عسل هدية فوق 300 ألف',
    icon: Gift,
  },
  {
    value: 'BUY_X_GET_Y',
    label: 'اشترِ X واحصل على Y',
    hint: 'مثال: اشترِ 2 عسل سدر واحصل على شمع مجاناً',
    icon: ShoppingBag,
  },
];

const empty: Input = {
  title: '',
  kind: 'PERCENT_OVER_AMOUNT',
  active: true,
  startsAt: null,
  endsAt: null,
  minSubtotal: 5000,
  percent: 5,
  maxDiscount: null,
  buyProductId: null,
  buyQty: 2,
  giftProductId: null,
  giftQty: 1,
  showProgress: true,
  monthlyBudget: 0,
};

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';

function Editor({
  promotion,
  products,
  onDone,
}: {
  promotion?: PromotionRow;
  products: ProductOpt[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Input>(() => {
    if (!promotion) return empty;
    const { id: _id, usedThisMonth: _u, usesThisMonth: _n, ...rest } = promotion;
    return rest;
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const set = <K extends keyof Input>(k: K, v: Input[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v === '' ? 0 : Number(v));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch(
      promotion ? `/api/admin/promotions/${promotion.id}` : '/api/admin/promotions',
      {
        method: promotion ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      },
    ).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحفظ.');
    setMessage('تم الحفظ.');
    router.refresh();
    onDone?.();
  }

  async function remove() {
    if (!promotion || !confirm(`حذف عرض «${promotion.title}»؟`)) return;
    const res = await fetch(`/api/admin/promotions/${promotion.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (res?.ok) router.refresh();
  }

  const productSelect = (value: string | null, onChange: (v: string | null) => void) => (
    <select
      className={inputClass}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">اختر منتجاً…</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
          {p.price != null ? ` — ${formatAmount(p.price)}` : ''}
        </option>
      ))}
    </select>
  );

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 p-4">
      <label className="block text-sm">
        عنوان العرض (يراه الزبون)
        <input
          className={inputClass}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          maxLength={120}
          placeholder="هدية الشتاء"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        {KINDS.map((k) => (
          <label
            key={k.value}
            className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${
              form.kind === k.value ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800'
            }`}
          >
            <input
              type="radio"
              name={`kind-${promotion?.id ?? 'new'}`}
              checked={form.kind === k.value}
              onChange={() => set('kind', k.value)}
              className="mt-1"
            />
            <span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <k.icon className="h-4 w-4 text-amber-500" /> {k.label}
              </span>
              <span className="block text-xs text-zinc-500">{k.hint}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {form.kind !== 'BUY_X_GET_Y' && (
          <label className="text-sm">
            الحد الأدنى للطلب (ل.س)
            <input
              className={inputClass}
              type="number"
              min={0}
              value={form.minSubtotal}
              onChange={(e) => set('minSubtotal', num(e.target.value))}
            />
          </label>
        )}
        {form.kind === 'PERCENT_OVER_AMOUNT' && (
          <>
            <label className="text-sm">
              نسبة الخصم %
              <input
                className={inputClass}
                type="number"
                min={1}
                max={90}
                value={form.percent}
                onChange={(e) => set('percent', num(e.target.value))}
              />
            </label>
            <label className="text-sm">
              سقف الخصم للطلب (ل.س) — فارغ = بلا سقف
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.maxDiscount ?? ''}
                onChange={(e) =>
                  set('maxDiscount', e.target.value === '' ? null : num(e.target.value))
                }
              />
            </label>
          </>
        )}
        {form.kind === 'BUY_X_GET_Y' && (
          <>
            <label className="text-sm sm:col-span-2">
              المنتج المشروط شراؤه
              {productSelect(form.buyProductId, (v) => set('buyProductId', v))}
            </label>
            <label className="text-sm">
              الكمية المطلوبة
              <input
                className={inputClass}
                type="number"
                min={1}
                max={99}
                value={form.buyQty}
                onChange={(e) => set('buyQty', Math.max(1, num(e.target.value)))}
              />
            </label>
          </>
        )}
        {form.kind !== 'PERCENT_OVER_AMOUNT' && (
          <>
            <label className="text-sm sm:col-span-2">
              منتج الهدية
              {productSelect(form.giftProductId, (v) => set('giftProductId', v))}
            </label>
            <label className="text-sm">
              عدد الهدايا
              <input
                className={inputClass}
                type="number"
                min={1}
                max={20}
                value={form.giftQty}
                onChange={(e) => set('giftQty', Math.max(1, num(e.target.value)))}
              />
            </label>
          </>
        )}
        <label className="text-sm">
          يبدأ في
          <input
            className={inputClass}
            type="date"
            value={form.startsAt ?? ''}
            onChange={(e) => set('startsAt', e.target.value || null)}
          />
        </label>
        <label className="text-sm">
          ينتهي في
          <input
            className={inputClass}
            type="date"
            value={form.endsAt ?? ''}
            onChange={(e) => set('endsAt', e.target.value || null)}
          />
        </label>
        <label className="text-sm">
          الميزانية الشهرية (ل.س) — 0 = بلا سقف
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.monthlyBudget}
            onChange={(e) => set('monthlyBudget', num(e.target.value))}
          />
          <span className="block text-[11px] text-zinc-500">
            تُحسب قيمة الهدايا بسعر بيعها؛ حين تُستنفد يتوقف العرض تلقائياً.
          </span>
        </label>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set('active', e.target.checked)}
          />{' '}
          فعّال
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.showProgress}
            onChange={(e) => set('showProgress', e.target.checked)}
          />{' '}
          أظهر «أضف X لتحصل على…» في السلة
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button
          disabled={busy}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50"
        >
          {busy ? 'جارٍ الحفظ…' : promotion ? 'حفظ' : 'إنشاء العرض'}
        </button>
        {promotion && (
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" /> حذف
          </button>
        )}
        <p role="status" className="text-sm text-zinc-400">
          {message}
        </p>
      </div>
    </form>
  );
}

export function PromotionsPanel({
  promotions,
  products,
}: {
  promotions: PromotionRow[];
  products: ProductOpt[];
}) {
  const [creating, setCreating] = useState(false);
  const name = (id: string | null) => products.find((p) => p.id === id)?.name ?? '—';
  return (
    <div className="space-y-4">
      <button
        className="rounded-lg border border-amber-500 px-4 py-2.5 text-sm text-amber-400"
        onClick={() => setCreating(!creating)}
      >
        {creating ? 'إلغاء' : '+ عرض جديد'}
      </button>
      {creating && <Editor products={products} onDone={() => setCreating(false)} />}
      {promotions.map((p) => {
        const kind = KINDS.find((k) => k.value === p.kind)!;
        const pct =
          p.monthlyBudget > 0
            ? Math.min(100, Math.round((p.usedThisMonth / p.monthlyBudget) * 100))
            : 0;
        return (
          <details key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
            <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4 text-sm">
              <kind.icon className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-white">{p.title}</span>
              <span className="text-zinc-500">
                {p.kind === 'PERCENT_OVER_AMOUNT'
                  ? `${p.percent}% فوق ${formatAmount(p.minSubtotal)}`
                  : p.kind === 'GIFT_OVER_AMOUNT'
                    ? `${p.giftQty} × ${name(p.giftProductId)} فوق ${formatAmount(p.minSubtotal)}`
                    : `اشترِ ${p.buyQty} ${name(p.buyProductId)} ← ${p.giftQty} ${name(p.giftProductId)}`}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${p.active ? 'bg-green-500/15 text-green-300' : 'bg-zinc-800 text-zinc-400'}`}
              >
                {p.active ? 'فعّال' : 'معطّل'}
              </span>
              <span className="mr-auto text-xs text-zinc-400">
                هذا الشهر: {p.usesThisMonth} طلباً · {formatPrice(p.usedThisMonth)}
                {p.monthlyBudget > 0 && ` من ${formatAmount(p.monthlyBudget)} (${pct}%)`}
              </span>
              {p.monthlyBudget > 0 && (
                <span className="block h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <span
                    className={`block h-full ${pct >= 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
              )}
            </summary>
            <div className="border-t border-zinc-800 p-4">
              <Editor promotion={p} products={products} />
            </div>
          </details>
        );
      })}
      {promotions.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          لا عروض بعد. أنشئ أول عرض — مثلاً «هدية شمع عسل للطلبات فوق 400 ألف».
        </p>
      )}
    </div>
  );
}
