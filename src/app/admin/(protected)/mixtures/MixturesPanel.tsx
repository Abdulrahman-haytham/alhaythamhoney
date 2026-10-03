'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, Plus, Save, Trash2, X } from 'lucide-react';
import { CURRENCY } from '@/lib/money';
import { MediaField } from '@/components/admin/MediaField';
import { joinMedia, splitMedia } from '@/lib/media';

export interface AdminIngredient {
  /** معرّف القاعدة، أو مفتاح مؤقت يبدأ بـ`new-` لمكوّن لم يُحفظ بعد */
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
  desc: string;
  image: string | null;
  images: string[];
  videos: string[];
  sortOrder: number;
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

const isNewId = (id: string) => id.startsWith('new-');
let tempId = 0;
const newIngredient = (): AdminIngredient => ({
  id: `new-${++tempId}`,
  name: '',
  note: null,
  pricePerGram: 0,
  minGrams: 0,
  maxGrams: 50,
  recommended: 20,
  step: 5,
});
const newMixture = (): AdminMixture => ({
  id: '',
  slug: '',
  name: '',
  tagline: '',
  desc: '',
  image: null,
  images: [],
  videos: [],
  sortOrder: 0,
  sizes: [250, 500, 1000],
  defaultSize: 500,
  prepFee: 0,
  published: false,
  customizable: true,
  fixedPrice: null,
  ingredients: [newIngredient()],
});

const fieldClass =
  'h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';
const labelClass = 'mb-1.5 block text-xs font-medium text-zinc-400';

/** محرّر خلطة موجودة، أو خلطة جديدة حين لا يُمرَّر `initial`. */
function MixtureEditor({ initial, onDone }: { initial?: AdminMixture; onDone?: () => void }) {
  const router = useRouter();
  const creating = !initial;
  const [m, setM] = useState<AdminMixture>(() => initial ?? newMixture());
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'deleting'>('idle');
  const [error, setError] = useState<string | null>(null);

  const unpriced = m.ingredients
    .filter((i) => i.pricePerGram === 0 && i.name.trim())
    .map((i) => i.name);

  function setIng(id: string, patch: Partial<AdminIngredient>) {
    setM((cur) => ({
      ...cur,
      ingredients: cur.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  }

  async function save() {
    setState('saving');
    setError(null);
    const res = await fetch(creating ? '/api/admin/mixtures' : `/api/admin/mixtures/${m.id}`, {
      method: creating ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: m.slug.trim(),
        name: m.name,
        tagline: m.tagline,
        desc: m.desc,
        image: m.image,
        images: m.images,
        videos: m.videos,
        sortOrder: m.sortOrder,
        prepFee: m.prepFee,
        published: m.published,
        customizable: m.customizable,
        fixedPrice: m.customizable ? null : (m.fixedPrice ?? 0),
        sizes: m.sizes,
        defaultSize: m.defaultSize,
        ingredients: m.ingredients.map((i) => ({ ...i, id: isNewId(i.id) ? null : i.id })),
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
    const data = await res.json().catch(() => ({}));
    router.refresh();
    if (creating) return onDone?.();
    // المكوّنات الجديدة أخذت معرّفاتها — نثبّتها حتى لا تُنشأ مرة ثانية عند الحفظ التالي
    const saved = data.ingredients as { id: string; name: string }[] | undefined;
    if (saved)
      setM((cur) => ({
        ...cur,
        ingredients: cur.ingredients.map((i) => ({
          ...i,
          id: saved.find((x) => x.name === i.name.trim())?.id ?? i.id,
        })),
      }));
    setState('saved');
    setTimeout(() => setState('idle'), 1800);
  }

  async function remove() {
    if (!confirm(`حذف «${m.name}» نهائياً؟ لإخفائها مؤقتاً ألغِ «منشورة» بدل الحذف.`)) return;
    setState('deleting');
    setError(null);
    const res = await fetch(`/api/admin/mixtures/${m.id}`, { method: 'DELETE' }).catch(() => null);
    if (!res?.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data.error ?? 'تعذّر الحذف.');
      setState('idle');
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-amiri text-xl font-bold text-white">
            {creating ? 'خلطة جديدة' : m.name || 'خلطة بلا اسم'}
          </h2>
          {!creating && (
            <p className="text-xs text-zinc-500">
              <span dir="ltr">/custom-mixtures/{m.slug}</span> ·{' '}
              <a
                href={`/custom-mixtures/${m.slug}`}
                target="_blank"
                className="text-amber-500 hover:text-amber-400"
              >
                معاينة
              </a>
            </p>
          )}
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

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>اسم الخلطة</span>
          <input
            value={m.name}
            onChange={(e) => setM({ ...m, name: e.target.value })}
            placeholder="مثال: المناعة — تُعرض للزبون «خلطة المناعة»"
            maxLength={150}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>
            الرابط {creating ? '(أحرف إنجليزية صغيرة وشرطات، لا يتغير بعد الإنشاء)' : '(ثابت)'}
          </span>
          <input
            value={m.slug}
            onChange={(e) => setM({ ...m, slug: e.target.value.toLowerCase() })}
            placeholder="immunity-mix"
            dir="ltr"
            disabled={!creating}
            className={`${fieldClass} disabled:text-zinc-500`}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>سطر تعريفي قصير</span>
          <input
            value={m.tagline}
            onChange={(e) => setM({ ...m, tagline: e.target.value })}
            placeholder="مثال: عسل مع حبة البركة والزنجبيل"
            maxLength={200}
            className={fieldClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>الوصف كما يراه الزبون</span>
          <textarea
            value={m.desc}
            onChange={(e) => setM({ ...m, desc: e.target.value })}
            rows={3}
            maxLength={2000}
            className={`${fieldClass} h-auto py-2`}
          />
        </label>
        <div className="text-xs text-zinc-400 sm:col-span-2">
          <MediaField
            label="صور وفيديو الخلطة (اختيارية)"
            value={joinMedia(m)}
            onChange={(list) => setM((cur) => ({ ...cur, ...splitMedia(list) }))}
            hint="الصورة الرئيسية تظهر في بطاقة الخلطة، والبقية مع الفيديو معرض في صفحتها."
          />
        </div>
        <label className="block">
          <span className={labelClass}>ترتيب العرض (الأصغر أولاً)</span>
          <input
            type="number"
            min={0}
            max={10000}
            value={m.sortOrder}
            onChange={(e) => setM({ ...m, sortOrder: Number(e.target.value) })}
            dir="ltr"
            className={fieldClass}
          />
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

      {unpriced.length > 0 && (
        <p
          id={`unpriced-${m.id}`}
          className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs leading-relaxed text-amber-200/90"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {unpriced.join('، ')} بلا سعر للغرام.{' '}
            {m.customizable
              ? 'تُحسب بصفر الآن، فسعر هذه الخلطة أقل من حقيقته حتى تكتب أسعارها.'
              : 'لا أثر لذلك ما دامت الوصفة ثابتة بسعرها الخاص.'}
          </span>
        </p>
      )}

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
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {m.ingredients.map((ing) => (
              <tr key={ing.id} className="border-t border-zinc-800/60">
                <td className="py-2 pl-2">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => setIng(ing.id, { name: e.target.value })}
                    placeholder="اسم المكوّن"
                    aria-label="اسم المكوّن"
                    maxLength={150}
                    className="h-9 w-32 rounded-lg border border-zinc-700 bg-zinc-950 px-2 font-bold text-zinc-100 placeholder:font-normal placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </td>
                {FIELDS.map((f) => (
                  <td key={f.key} className="py-2 pl-2">
                    <input
                      type="number"
                      min={0}
                      value={ing[f.key]}
                      onChange={(e) => setIng(ing.id, { [f.key]: Number(e.target.value) })}
                      className={`h-9 w-24 rounded-lg border bg-zinc-950 px-2 tabular-nums focus:border-amber-500/50 focus:outline-none ${
                        f.key === 'pricePerGram' && ing.pricePerGram === 0
                          ? 'border-amber-500/50 text-amber-300'
                          : 'border-zinc-700 text-zinc-100'
                      }`}
                      dir="ltr"
                      aria-describedby={
                        f.key === 'pricePerGram' && ing.pricePerGram === 0
                          ? `unpriced-${m.id}`
                          : undefined
                      }
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
                <td className="py-2 pr-2">
                  <button
                    type="button"
                    onClick={() =>
                      setM((cur) => ({
                        ...cur,
                        ingredients: cur.ingredients.filter((i) => i.id !== ing.id),
                      }))
                    }
                    disabled={m.ingredients.length === 1}
                    aria-label={`حذف المكوّن ${ing.name}`}
                    title="حذف المكوّن"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() =>
          setM((cur) => ({ ...cur, ingredients: [...cur.ingredients, newIngredient()] }))
        }
        disabled={m.ingredients.length >= 30}
        className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs font-bold text-zinc-300 hover:border-amber-500/50 hover:text-amber-400 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" /> مكوّن
      </button>

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
          {creating ? (
            <button
              type="button"
              onClick={onDone}
              className="inline-flex h-10 items-center rounded-xl px-3 text-sm text-zinc-400 hover:text-white"
            >
              إلغاء
            </button>
          ) : (
            <button
              type="button"
              onClick={remove}
              disabled={state === 'saving' || state === 'deleting'}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {state === 'deleting' ? 'جارٍ الحذف…' : 'حذف'}
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={state === 'saving' || state === 'deleting'}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors disabled:opacity-60 ${
              state === 'saved'
                ? 'bg-green-600 text-white'
                : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
            }`}
          >
            {state === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {state === 'saving'
              ? 'جارٍ الحفظ…'
              : state === 'saved'
                ? 'تم الحفظ'
                : creating
                  ? 'إنشاء الخلطة'
                  : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MixturesPanel({ mixtures }: { mixtures: AdminMixture[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-6">
      {creating ? (
        <MixtureEditor onDone={() => setCreating(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-500 px-4 text-sm font-bold text-amber-400 hover:bg-amber-500/10"
        >
          <Plus className="h-4 w-4" /> خلطة جديدة
        </button>
      )}
      {mixtures.length === 0 && !creating && (
        <p className="py-10 text-center text-sm text-zinc-500">لا خلطات بعد — أضف الأولى.</p>
      )}
      {mixtures.map((m) => (
        <MixtureEditor key={m.id} initial={m} />
      ))}
    </div>
  );
}
