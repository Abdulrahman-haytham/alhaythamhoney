'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { z } from 'zod';
import type { productInput } from '@/lib/validation';
import type { Prisma } from '@prisma/client';

type Input = z.infer<typeof productInput>;
type ProductRow = Omit<Input, 'detailedInfo'> & { id: string; detailedInfo: Prisma.JsonValue };
const empty: Input = {
  slug: '',
  name: '',
  desc: '',
  benefit: null,
  image: '/images/products/black-seed-honey.webp',
  badge: null,
  price: null,
  weight: null,
  category: 'HONEY',
  inStock: true,
  published: false,
  sortOrder: 0,
  detailedInfo: null,
};
const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-base text-white disabled:text-zinc-500';

function Editor({ product, onCreated }: { product?: ProductRow; onCreated?: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<Input, 'detailedInfo'>>(product ?? empty);
  const [details, setDetails] = useState(JSON.stringify(product?.detailedInfo ?? {}, null, 2));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const payload = { ...form, detailedInfo: JSON.parse(details || 'null') } as Record<
        string,
        unknown
      >;
      delete payload.id;
      const res = await fetch(
        product ? `/api/admin/products/${product.id}` : '/api/admin/products',
        {
          method: product ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'تعذّر الحفظ.');
      setMessage('تم الحفظ.');
      router.refresh();
      onCreated?.();
    } catch (error) {
      setMessage(
        error instanceof SyntaxError
          ? 'تفاصيل المنتج يجب أن تكون JSON صالحاً.'
          : error instanceof Error
            ? error.message
            : 'تعذّر الاتصال.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          اسم المنتج
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            maxLength={150}
          />
        </label>
        <label>
          الرابط (لا يتغير بعد الإنشاء)
          <input
            className={inputClass}
            dir="ltr"
            value={form.slug}
            disabled={!!product}
            onChange={(e) => set('slug', e.target.value)}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
          />
        </label>
        <label>
          السعر بالليرة السورية
          <input
            className={inputClass}
            type="number"
            min={0}
            max={1000000000}
            value={form.price ?? ''}
            onChange={(e) => set('price', e.target.value === '' ? null : Number(e.target.value))}
          />
        </label>
        <label>
          الوزن (مثال: 500 غرام)
          <input
            className={inputClass}
            value={form.weight ?? ''}
            onChange={(e) => set('weight', e.target.value || null)}
          />
        </label>
        <label>
          الفئة
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => set('category', e.target.value as Input['category'])}
          >
            <option value="HONEY">عسل</option>
            <option value="SUPPLEMENT">منتجات الخلية</option>
          </select>
        </label>
        <label>
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
        <label>
          شارة البطاقة
          <input
            className={inputClass}
            value={form.badge ?? ''}
            onChange={(e) => set('badge', e.target.value || null)}
          />
        </label>
        <label>
          عبارة قصيرة
          <input
            className={inputClass}
            value={form.benefit ?? ''}
            onChange={(e) => set('benefit', e.target.value || null)}
          />
        </label>
      </div>
      <label className="block">
        رابط صورة المنتج
        <input
          className={inputClass}
          dir="ltr"
          value={form.image}
          onChange={(e) => set('image', e.target.value)}
          required
        />
      </label>
      <label className="block">
        الوصف
        <textarea
          className={inputClass}
          value={form.desc}
          onChange={(e) => set('desc', e.target.value)}
          minLength={10}
          maxLength={3000}
          rows={3}
          required
        />
      </label>
      <details>
        <summary className="cursor-pointer text-amber-400">تفاصيل إضافية (JSON)</summary>
        <p className="my-2 text-xs text-zinc-400">
          مصفوفات نصية: benefits، uses، properties. نص: howToUse. راجع دقة المحتوى قبل النشر.
        </p>
        <textarea
          aria-label="تفاصيل المنتج JSON"
          className={inputClass}
          dir="ltr"
          rows={8}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </details>
      <div className="flex flex-wrap gap-6">
        <label>
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
          />{' '}
          منشور
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => set('inStock', e.target.checked)}
          />{' '}
          متوفر
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button
          disabled={busy}
          className="rounded-lg bg-amber-500 px-6 py-3 font-bold text-zinc-950 disabled:opacity-50"
        >
          {busy ? 'جارٍ الحفظ…' : 'حفظ المنتج'}
        </button>
        <p role="status" className="text-sm">
          {message}
        </p>
      </div>
    </form>
  );
}

export function ProductsPanel({ products }: { products: ProductRow[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-5">
      <button
        className="rounded-lg border border-amber-500 px-4 py-3 text-amber-400"
        onClick={() => setCreating(!creating)}
      >
        {creating ? 'إلغاء الإضافة' : '+ منتج جديد'}
      </button>
      {creating && <Editor onCreated={() => setCreating(false)} />}
      {products.map((product) => (
        <details key={product.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
          <summary className="cursor-pointer p-4">
            {product.name}{' '}
            <span className="text-sm text-zinc-400">
              — {product.published ? 'منشور' : 'مخفي'} · {product.inStock ? 'متوفر' : 'غير متوفر'}
            </span>
          </summary>
          <Editor product={product} />
        </details>
      ))}
    </div>
  );
}
