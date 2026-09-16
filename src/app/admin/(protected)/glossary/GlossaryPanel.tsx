'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, ImagePlus, Lightbulb, Trash2 } from 'lucide-react';
import type { z } from 'zod';
import type { glossaryInput } from '@/lib/validation';

type Input = z.infer<typeof glossaryInput>;
export type GlossaryRow = Input & { id: string };

const empty: Input = {
  slug: '',
  name: '',
  category: '',
  summary: '',
  tip: null,
  image: '/images/beekeeping/beekeeping-tools/bee-smoker.webp',
  published: true,
  sortOrder: 0,
  productIds: [],
};

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none disabled:text-zinc-500';

function Editor({
  entry,
  categories,
  products,
  onDone,
}: {
  entry?: GlossaryRow;
  categories: string[];
  products: { id: string; name: string }[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Input>(() => {
    if (!entry) return empty;
    const { id: _id, ...rest } = entry;
    return rest;
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Input>(k: K, v: Input[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function upload(file: File) {
    setMessage('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/images', { method: 'POST', body: fd }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) return setMessage(data.error || 'تعذّر رفع الصورة.');
    set('image', data.url);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch(entry ? `/api/admin/glossary/${entry.id}` : '/api/admin/glossary', {
      method: entry ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tip: form.tip?.trim() ? form.tip : null }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحفظ.');
    setMessage('تم الحفظ.');
    router.refresh();
    onDone?.();
  }

  async function remove() {
    if (!entry || !confirm(`حذف «${entry.name}» من الموسوعة؟`)) return;
    const res = await fetch(`/api/admin/glossary/${entry.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (res?.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          الاسم
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            maxLength={120}
            placeholder="المدخّن"
          />
        </label>
        <label className="text-sm">
          الرابط (لا يتغيّر بعد الإنشاء)
          <input
            className={inputClass}
            dir="ltr"
            value={form.slug}
            disabled={!!entry}
            onChange={(e) => set('slug', e.target.value)}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="bee-smoker"
          />
        </label>
        <label className="text-sm">
          التصنيف
          <input
            className={inputClass}
            list="glossary-categories"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            required
            maxLength={60}
            placeholder="أدوات النحّال"
          />
          <datalist id="glossary-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <span className="mt-1 block text-[11px] text-zinc-500">
            اكتب تصنيفاً جديداً لفتح محور جديد في الموسوعة (مصطلحات النحل، أمراض الخلية…).
          </span>
        </label>
        <label className="text-sm">
          ترتيب العرض
          <input
            className={inputClass}
            type="number"
            min={0}
            max={10000}
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
          />
        </label>
      </div>

      <label className="block text-sm">
        الشرح (يظهر في البطاقة وصفحة المدخل)
        <textarea
          className={`${inputClass} min-h-[110px]`}
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          required
          minLength={20}
          maxLength={2000}
        />
      </label>

      <label className="block rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-3 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-amber-300">
          <Lightbulb className="h-4 w-4" /> نصيحة الهيثم (اختيارية)
        </span>
        <span className="mb-2 block text-[11px] text-zinc-500">
          اكتبها بصوتك من خبرتك في المنحل — تظهر في إطار مميّز باسمكما، وهي ما يجعل هذه الموسوعة
          مرجعاً لا نسخة عن غيرها.
        </span>
        <textarea
          className={`${inputClass} min-h-[90px]`}
          value={form.tip ?? ''}
          onChange={(e) => set('tip', e.target.value || null)}
          maxLength={2000}
          placeholder="مثال: نستخدم قشّ القمح الجاف في المدخّن لأنه يعطي دخاناً بارداً يدوم طويلاً…"
        />
      </label>

      <div className="rounded-lg border border-zinc-800 p-3 text-sm">
        <p className="mb-2 text-zinc-300">الصورة</p>
        <div className="flex flex-wrap items-center gap-3">
          <img src={form.image} alt="" className="h-16 w-16 rounded-lg bg-white object-contain" />
          <input
            ref={fileRef}
            type="file"
            accept="image/webp,image/png,image/jpeg,image/avif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:border-amber-500/50"
          >
            <ImagePlus className="h-3.5 w-3.5" /> رفع صورة
          </button>
          <input
            className={`${inputClass} mt-0 flex-1`}
            dir="ltr"
            value={form.image}
            onChange={(e) => set('image', e.target.value)}
            required
          />
        </div>
      </div>

      <fieldset className="rounded-lg border border-zinc-800 p-3">
        <legend className="px-1 text-sm text-amber-400">منتجاتنا المرتبطة</legend>
        <p className="mb-2 text-xs text-zinc-500">
          تظهر أسفل صفحة المدخل، وتظهر الموسوعة بالمقابل في صفحة المنتج — جسر يحوّل الزائر الباحث عن
          معلومة إلى زبون.
        </p>
        <div className="flex flex-wrap gap-2">
          {products.map((p) => {
            const on = form.productIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  set(
                    'productIds',
                    on ? form.productIds.filter((id) => id !== p.id) : [...form.productIds, p.id],
                  )
                }
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  on
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
          />{' '}
          منشور
        </label>
        <button
          disabled={busy}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50"
        >
          {busy ? 'جارٍ الحفظ…' : entry ? 'حفظ' : 'إضافة المدخل'}
        </button>
        {entry && (
          <>
            <a
              href={`/beekeeping/${entry.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-amber-400"
            >
              <ExternalLink className="h-3.5 w-3.5" /> عرض الصفحة
            </a>
            <button
              type="button"
              onClick={remove}
              className="mr-auto inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" /> حذف
            </button>
          </>
        )}
        <p role="status" className="w-full text-sm text-zinc-400">
          {message}
        </p>
      </div>
    </form>
  );
}

export function GlossaryPanel({
  entries,
  categories,
  products,
}: {
  entries: GlossaryRow[];
  categories: string[];
  products: { id: string; name: string }[];
}) {
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<string>('الكل');
  const shown = filter === 'الكل' ? entries : entries.filter((e) => e.category === filter);

  return (
    <div className="space-y-4">
      <button
        className="rounded-lg border border-amber-500 px-4 py-2.5 text-sm text-amber-400"
        onClick={() => setCreating(!creating)}
      >
        {creating ? 'إلغاء' : '+ مدخل جديد'}
      </button>
      {creating && (
        <Editor categories={categories} products={products} onDone={() => setCreating(false)} />
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        {['الكل', ...categories].map((c) => {
          const count =
            c === 'الكل' ? entries.length : entries.filter((e) => e.category === c).length;
          if (count === 0 && c !== 'الكل') return null;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full border px-3 py-1 ${filter === c ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}
            >
              {c} ({count})
            </button>
          );
        })}
      </div>

      {shown.map((e) => (
        <details key={e.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
          <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4 text-sm">
            <img src={e.image} alt="" className="h-10 w-10 rounded-lg bg-white object-contain" />
            <span className="font-bold text-white">{e.name}</span>
            <span className="text-xs text-zinc-500">{e.category}</span>
            {e.tip?.trim() ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                <Lightbulb className="h-3 w-3" /> نصيحة
              </span>
            ) : (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500">
                بلا نصيحة
              </span>
            )}
            {!e.published && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                مخفي
              </span>
            )}
            <span className="mr-auto text-xs text-zinc-600">
              {e.productIds.length > 0 ? `${e.productIds.length} منتج مرتبط` : '—'}
            </span>
          </summary>
          <div className="border-t border-zinc-800 p-4">
            <Editor entry={e} categories={categories} products={products} />
          </div>
        </details>
      ))}
    </div>
  );
}
