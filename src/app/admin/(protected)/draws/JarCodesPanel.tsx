'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Download } from 'lucide-react';

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-base text-white focus:border-amber-500/50 focus:outline-none';

export function JarCodesPanel({
  batches,
  passports,
}: {
  batches: { batch: string; total: number; unused: number; passport: string | null }[];
  /** جوازات الدفعات لربط الرموز بها */
  passports: { id: string; code: string; title: string }[];
}) {
  const router = useRouter();
  const [batch, setBatch] = useState('');
  const [count, setCount] = useState(100);
  const [batchId, setBatchId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const res = await fetch('/api/admin/jar-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch, count, batchId: batchId || null }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMsg(data.error || 'تعذّر التوليد.');
    setMsg(`وُلّد ${data.count} رمزاً — نزّل الـ CSV وأرسله للمطبعة.`);
    setBatch('');
    router.refresh();
  }

  return (
    <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="mb-1 flex items-center gap-2 font-amiri text-xl font-bold text-white">
        <QrCode className="h-5 w-5 text-amber-500" /> رموز المرطبانات
      </h2>
      <p className="mb-4 text-xs text-zinc-500">
        كل رمز بصيغة HY-XXXX-XXXX ويُستخدم مرة واحدة إلى الأبد. سمِّ الدفعة باسم يذكّرك بها (مثل
        «تموز 2026 — حبة البركة 500غ»). عمود url في الـ CSV هو رابط QR المرطبان: يفتح جواز الدفعة إن
        ربطتها هنا، وإلا صفحة السحب.
      </p>
      <form
        onSubmit={generate}
        className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-end"
      >
        <label className="text-sm text-zinc-300">
          اسم الدفعة
          <input
            className={inputClass}
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            required
            maxLength={60}
          />
        </label>
        <label className="text-sm text-zinc-300">
          جواز الدفعة (اختياري)
          <select
            className={inputClass}
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          >
            <option value="">— بلا جواز —</option>
            {passports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-zinc-300">
          العدد
          <input
            className={inputClass}
            type="number"
            min={1}
            max={5000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            required
          />
        </label>
        <button
          disabled={busy}
          className="h-[42px] rounded-lg bg-amber-500 px-5 font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {busy ? 'جارٍ التوليد…' : 'توليد'}
        </button>
      </form>
      {msg && (
        <p role="status" className="mt-3 text-sm text-amber-300">
          {msg}
        </p>
      )}
      {batches.length > 0 && (
        <ul className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {batches.map((b) => (
            <li key={b.batch} className="flex flex-wrap items-center gap-3 p-3 text-sm">
              <span className="flex-1 font-bold text-zinc-200">
                {b.batch}
                {b.passport && (
                  <span className="mr-2 font-mono text-xs font-normal text-amber-300" dir="ltr">
                    {b.passport}
                  </span>
                )}
              </span>
              <span className="text-zinc-500">
                {b.total} رمز · <span className="text-green-400">{b.unused} غير مستخدم</span>
              </span>
              <a
                href={`/api/admin/jar-codes?batch=${encodeURIComponent(b.batch)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:border-amber-500/50"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
