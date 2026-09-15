'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** زر صغير بجانب رصيد الزبون: + أو − نقاط مع سبب */
export function PointsAdjust({ customerId, points }: { customerId: string; points: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(10);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch(`/api/admin/customers/${customerId}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta, note }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(data.error || 'تعذّر الحفظ.');
    setOpen(false);
    setNote('');
    router.refresh();
  }

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tabular-nums text-amber-300 underline decoration-dotted underline-offset-2"
        title="تعديل النقاط"
      >
        {points}
      </button>
    );
  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-1">
      <input
        type="number"
        value={delta}
        onChange={(e) => setDelta(Number(e.target.value))}
        aria-label="الفرق"
        className="w-16 rounded border border-zinc-700 bg-zinc-950 px-1 py-0.5 text-xs text-white"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="السبب"
        required
        minLength={2}
        maxLength={200}
        className="w-28 rounded border border-zinc-700 bg-zinc-950 px-1 py-0.5 text-xs text-white"
      />
      <button
        disabled={busy}
        className="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold text-zinc-950"
      >
        حفظ
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500">
        إلغاء
      </button>
      {error && <span className="w-full text-[11px] text-red-400">{error}</span>}
    </form>
  );
}
