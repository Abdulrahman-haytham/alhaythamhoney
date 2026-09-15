'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export interface AttributeRow {
  id: string;
  name: string;
  sortOrder: number;
  values: { id: string; value: string; products: number }[];
}

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';

const SUGGESTIONS: { name: string; values: string }[] = [
  { name: 'نوع الزهرة', values: 'سدر، حبة البركة، زهور برية، حمضيات، كينا، يانسون' },
  { name: 'المنطقة', values: 'حماة، إدلب، الساحل، حوران، الجزيرة' },
  { name: 'الموسم', values: 'ربيع، صيف، خريف' },
  { name: 'الطعم', values: 'خفيف، متوسط، قوي' },
];

function Editor({ attribute, onDone }: { attribute?: AttributeRow; onDone?: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(attribute?.name ?? '');
  const [values, setValues] = useState(attribute?.values.map((v) => v.value).join('، ') ?? '');
  const [sortOrder, setSortOrder] = useState(attribute?.sortOrder ?? 0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const list = values
      .split(/[،,\n]/)
      .map((v) => v.trim())
      .filter(Boolean);
    const res = await fetch(
      attribute ? `/api/admin/attributes/${attribute.id}` : '/api/admin/attributes',
      {
        method: attribute ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), sortOrder, values: list }),
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
    if (!attribute || !confirm(`حذف خاصية «${attribute.name}» وكل قيمها؟`)) return;
    const res = await fetch(`/api/admin/attributes/${attribute.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (res?.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm sm:col-span-3">
          اسم الخاصية
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            placeholder="نوع الزهرة"
          />
        </label>
        <label className="text-sm">
          الترتيب
          <input
            className={inputClass}
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </label>
      </div>
      <label className="block text-sm">
        القيم (افصل بينها بفاصلة)
        <textarea
          className={inputClass}
          rows={2}
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder="سدر، حبة البركة، زهور برية"
        />
      </label>
      {!attribute && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="text-zinc-500">اقتراحات:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => {
                setName(s.name);
                setValues(s.values);
              }}
              className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-zinc-300 hover:border-amber-500/50"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          disabled={busy}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 disabled:opacity-50"
        >
          {busy ? 'جارٍ الحفظ…' : attribute ? 'حفظ' : 'إنشاء'}
        </button>
        {attribute && (
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> حذف الخاصية
          </button>
        )}
        <p role="status" className="text-xs text-zinc-400">
          {message}
        </p>
      </div>
    </form>
  );
}

export function AttributesPanel({ attributes }: { attributes: AttributeRow[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-4">
      <button
        className="rounded-lg border border-amber-500 px-4 py-2.5 text-sm text-amber-400"
        onClick={() => setCreating(!creating)}
      >
        {creating ? 'إلغاء' : '+ خاصية جديدة'}
      </button>
      {creating && (
        <div className="rounded-xl border border-amber-500/30 p-4">
          <Editor onDone={() => setCreating(false)} />
        </div>
      )}
      {attributes.map((a) => (
        <details key={a.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
          <summary className="flex cursor-pointer flex-wrap items-center gap-2 p-4 text-sm">
            <span className="font-bold text-white">{a.name}</span>
            <span className="flex flex-wrap gap-1">
              {a.values.map((v) => (
                <span
                  key={v.id}
                  className="rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300"
                >
                  {v.value}
                  <span className="text-zinc-500"> ({v.products})</span>
                </span>
              ))}
            </span>
          </summary>
          <div className="border-t border-zinc-800 p-4">
            <Editor attribute={a} />
          </div>
        </details>
      ))}
      {attributes.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          لا خصائص بعد. ابدأ بـ«نوع الزهرة» — وهي أكثر ما يبحث عنه مشتري العسل.
        </p>
      )}
    </div>
  );
}
