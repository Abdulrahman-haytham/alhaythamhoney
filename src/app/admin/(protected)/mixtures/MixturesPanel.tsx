'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Check } from 'lucide-react';
import { CURRENCY } from '@/lib/money';

export interface AdminIngredient {
  id: string;
  name: string;
  note: string | null;
  pricePerGram: number;
  minGrams: number;
  maxGrams: number;
  recommended: number;
  step: number;
}

export interface AdminMixture {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  sizes: number[];
  defaultSize: number;
  prepFee: number;
  published: boolean;
  customizable: boolean;
  fixedPrice: number | null;
  ingredients: AdminIngredient[];
}

const FIELDS: {
  key: keyof Pick<
    AdminIngredient,
    'pricePerGram' | 'minGrams' | 'maxGrams' | 'recommended' | 'step'
  >;
  label: string;
}[] = [
  { key: 'pricePerGram', label: `${CURRENCY.label}/غرام` },
  { key: 'minGrams', label: 'الأدنى' },
  { key: 'recommended', label: 'الموصى به' },
  { key: 'maxGrams', label: 'الأقصى' },
  { key: 'step', label: 'الخطوة' },
];

function MixtureEditor({ initial }: { initial: AdminMixture }) {
  const router = useRouter();
  const [m, setM] = useState(initial);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  function setIng(id: string, patch: Partial<AdminIngredient>) {
    setM((cur) => ({
      ...cur,
      ingredients: cur.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  }

  async function save() {
    setState('saving');
    setError(null);
    const res = await fetch(`/api/admin/mixtures/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prepFee: m.prepFee,
        published: m.published,
        customizable: m.customizable,
        fixedPrice: m.customizable ? null : (m.fixedPrice ?? 0),
        sizes: m.sizes,
        defaultSize: m.defaultSize,
        ingredients: m.ingredients,
      }),
    }).catch(() => null);
    if (!res) {
      setError('تعذّر الاتصال. حاول مجدداً.');
      setState('idle');
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'تعذّر الحفظ.');
      setState('idle');
      return;
    }
    setState('saved');
    router.refresh();
    setTimeout(() => setState('idle'), 1800);
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-amiri text-xl font-bold text-white">{m.name}</h2>
          <p className="text-xs text-zinc-500">
            {m.tagline} ·{' '}
            <a
              href={`/custom-mixtures/${m.slug}`}
              target="_blank"
              className="text-amber-500 hover:text-amber-400"
            >
              معاينة
            </a>
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={m.published}
            onChange={(e) => setM({ ...m, published: e.target.checked })}
            className="h-4 w-4 accent-amber-500"
          />
          منشورة
        </label>
      </div>

      <div className="mb-5 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`sizes-${m.id}`}
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            أحجام المرطبان المتاحة (بالغرام، مفصولة بفاصلة)
          </label>
          <input
            id={`sizes-${m.id}`}
            value={m.sizes.join('، ')}
            onChange={(e) => {
              const sizes = e.target.value
                .split(/[,،]/)
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n) && n > 0);
              setM({ ...m, sizes });
            }}
            dir="ltr"
            inputMode="numeric"
            className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-zinc-600">
            الحجم يغيّر كمية العسل فقط — جرعات المكوّنات ثابتة كما تضبطها أدناه.
          </p>
        </div>
        <div>
          <label
            htmlFor={`default-size-${m.id}`}
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            الحجم المختار افتراضياً
          </label>
          <select
            id={`default-size-${m.id}`}
            value={m.defaultSize}
            onChange={(e) => setM({ ...m, defaultSize: Number(e.target.value) })}
            className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
          >
            {m.sizes.map((s) => (
              <option key={s} value={s}>
                {s} غرام
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-zinc-600">
            مجموع الحدود القصوى يجب أن يبقي مساحة للعسل في أصغر حجم.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-right text-xs text-zinc-500">
              <th className="pb-2 font-medium">المكوّن</th>
              {FIELDS.map((f) => (
                <th key={f.key} className="pb-2 font-medium">
                  {f.label}
                </th>
              ))}
              <th className="pb-2 font-medium">ملاحظة للزبون</th>
            </tr>
          </thead>
          <tbody>
            {m.ingredients.map((ing) => (
              <tr key={ing.id} className="border-t border-zinc-800/60">
                <td className="py-2 pl-3 font-bold text-zinc-200">{ing.name}</td>
                {FIELDS.map((f) => (
                  <td key={f.key} className="py-2 pl-2">
                    <input
                      type="number"
                      min={0}
                      value={ing[f.key]}
                      onChange={(e) => setIng(ing.id, { [f.key]: Number(e.target.value) })}
                      className="h-9 w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-zinc-100 tabular-nums focus:border-amber-500/50 focus:outline-none"
                      dir="ltr"
                    />
                  </td>
                ))}
                <td className="py-2">
                  <input
                    type="text"
                    value={ing.note ?? ''}
                    onChange={(e) => setIng(ing.id, { note: e.target.value })}
                    placeholder="لماذا هذه الجرعة؟"
                    className="h-9 w-full min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            أجرة التحضير والتعبئة
            <input
              type="number"
              min={0}
              value={m.prepFee}
              onChange={(e) => setM({ ...m, prepFee: Number(e.target.value) })}
              className="h-9 w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-zinc-100 tabular-nums focus:border-amber-500/50 focus:outline-none"
              dir="ltr"
            />
            <span className="text-xs text-zinc-500">{CURRENCY.label}</span>
          </label>

          {/* قفل الوصفة: الزبون يرى المكوّنات ولا يعدّلها، والسعر يصير رقماً تضبطه أنت */}
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={!m.customizable}
              onChange={(e) =>
                setM({
                  ...m,
                  customizable: !e.target.checked,
                  fixedPrice: e.target.checked ? (m.fixedPrice ?? 0) : null,
                })
              }
              className="h-4 w-4 accent-amber-500"
            />
            وصفة ثابتة — امنع الزبون من تعديل المقادير
          </label>

          {!m.customizable && (
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              سعر المرطبان
              <input
                type="number"
                min={0}
                value={m.fixedPrice ?? 0}
                onChange={(e) => setM({ ...m, fixedPrice: Number(e.target.value) })}
                className="h-9 w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-zinc-100 tabular-nums focus:border-amber-500/50 focus:outline-none"
                dir="ltr"
              />
              <span className="text-xs text-zinc-500">{CURRENCY.label}</span>
            </label>
          )}
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={save}
            disabled={state === 'saving'}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors disabled:opacity-60 ${
              state === 'saved'
                ? 'bg-green-600 text-white'
                : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
            }`}
          >
            {state === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {state === 'saving' ? 'جارٍ الحفظ…' : state === 'saved' ? 'تم الحفظ' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MixturesPanel({ mixtures }: { mixtures: AdminMixture[] }) {
  return (
    <div className="space-y-6">
      {mixtures.map((m) => (
        <MixtureEditor key={m.id} initial={m} />
      ))}
    </div>
  );
}
