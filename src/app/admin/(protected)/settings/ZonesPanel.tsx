'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { formatAmount } from '@/lib/money';

export interface ZoneRow {
  id: string;
  name: string;
  cost: number;
  etaText: string | null;
  active: boolean;
  sortOrder: number;
}

/** المحافظات السورية — زر واحد يملأ الجدول ثم يعدّل الأدمن الأرقام */
const SYRIAN_GOVERNORATES = [
  'حماة',
  'حمص',
  'دمشق',
  'ريف دمشق',
  'حلب',
  'اللاذقية',
  'طرطوس',
  'إدلب',
  'درعا',
  'السويداء',
  'القنيطرة',
  'دير الزور',
  'الرقة',
  'الحسكة',
];

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';

function ZoneEditor({
  zone,
  defaultCost,
  onDone,
}: {
  zone?: ZoneRow;
  defaultCost: number;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: zone?.name ?? '',
    cost: zone?.cost ?? defaultCost,
    etaText: zone?.etaText ?? '',
    active: zone?.active ?? true,
    sortOrder: zone?.sortOrder ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch(zone ? `/api/admin/zones/${zone.id}` : '/api/admin/zones', {
      method: zone ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, etaText: form.etaText || null }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحفظ.');
    setMessage('تم الحفظ.');
    router.refresh();
    onDone?.();
  }

  async function remove() {
    if (!zone || !confirm(`حذف منطقة «${zone.name}»؟`)) return;
    const res = await fetch(`/api/admin/zones/${zone.id}`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-6">
      <label className="text-xs sm:col-span-2">
        المحافظة
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          maxLength={60}
        />
      </label>
      <label className="text-xs">
        التكلفة (ل.س)
        <input
          className={inputClass}
          type="number"
          min={0}
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
          required
        />
      </label>
      <label className="text-xs">
        مدة التوصيل
        <input
          className={inputClass}
          value={form.etaText}
          onChange={(e) => setForm({ ...form, etaText: e.target.value })}
          placeholder="2–3 أيام"
          maxLength={60}
        />
      </label>
      <label className="flex items-center gap-1 pb-2 text-xs">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        فعّالة
      </label>
      <div className="flex items-center gap-2 pb-1">
        <button
          disabled={busy}
          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 disabled:opacity-50"
        >
          {zone ? 'حفظ' : 'إضافة'}
        </button>
        {zone && (
          <button type="button" onClick={remove} className="text-red-400 hover:text-red-300">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {message && <p className="col-span-full text-xs text-zinc-400">{message}</p>}
    </form>
  );
}

export function ZonesPanel({ zones, defaultCost }: { zones: ZoneRow[]; defaultCost: number }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function seed() {
    setSeeding(true);
    const existing = new Set(zones.map((z) => z.name));
    let i = 0;
    for (const name of SYRIAN_GOVERNORATES) {
      if (existing.has(name)) continue;
      await fetch('/api/admin/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cost: defaultCost,
          etaText: null,
          active: true,
          sortOrder: i++,
        }),
      }).catch(() => null);
    }
    setSeeding(false);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="flex items-center gap-2 font-amiri text-xl font-bold text-white">
        <MapPin className="h-5 w-5 text-amber-500" /> مناطق الشحن
      </h2>
      <p className="mt-1 mb-4 text-xs text-zinc-500">
        تكلفة ومدة توصيل لكل محافظة. تعمل حين يكون «الشحن حسب المحافظة» مفعّلاً أعلاه؛ وعتبة التوصيل
        المجاني تسري على الجميع.
      </p>
      <div className="space-y-3">
        {zones.length === 0 ? (
          <p className="text-sm text-zinc-500">لا مناطق بعد.</p>
        ) : (
          zones.map((z) => (
            <div key={z.id} className="rounded-lg border border-zinc-800/60 p-2">
              <ZoneEditor zone={z} defaultCost={defaultCost} />
              {!z.active && (
                <p className="mt-1 text-[11px] text-zinc-500">معطّلة — لا تظهر للزبون</p>
              )}
              <p className="sr-only">{formatAmount(z.cost)}</p>
            </div>
          ))
        )}
        {adding && (
          <div className="rounded-lg border border-amber-500/30 p-2">
            <ZoneEditor defaultCost={defaultCost} onDone={() => setAdding(false)} />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAdding(!adding)}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-500 px-3 py-1.5 text-xs text-amber-400"
          >
            <Plus className="h-3.5 w-3.5" /> {adding ? 'إلغاء' : 'منطقة جديدة'}
          </button>
          {zones.length < SYRIAN_GOVERNORATES.length && (
            <button
              type="button"
              onClick={seed}
              disabled={seeding}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 disabled:opacity-50"
            >
              {seeding ? 'جارٍ الإضافة…' : 'أضف المحافظات السورية الـ14 بالتكلفة الحالية'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
