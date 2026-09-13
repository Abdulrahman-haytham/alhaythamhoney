'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  name: string;
  phone: string;
  city: string | null;
  marketingOptIn: boolean;
}
const inputClass =
  'mt-1 h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-base text-white focus:border-amber-500/60 focus:outline-none';

export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMsg({ text: data.error || 'تعذّر الحفظ.', ok: false });
    setMsg({ text: 'تم الحفظ.', ok: true });
    router.refresh();
  }

  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-zinc-300">
        الاسم الكامل
        <input
          className={inputClass}
          value={p.name}
          onChange={(e) => setP({ ...p, name: e.target.value })}
          required
          minLength={2}
        />
      </label>
      <label className="text-sm text-zinc-300">
        رقم الهاتف
        <input
          className={inputClass}
          dir="ltr"
          type="tel"
          value={p.phone}
          onChange={(e) => setP({ ...p, phone: e.target.value })}
          required
        />
      </label>
      <label className="text-sm text-zinc-300">
        المدينة
        <input
          className={inputClass}
          value={p.city ?? ''}
          onChange={(e) => setP({ ...p, city: e.target.value || null })}
        />
      </label>
      <label className="flex items-center gap-2 self-end pb-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={p.marketingOptIn}
          onChange={(e) => setP({ ...p, marketingOptIn: e.target.checked })}
          className="h-4 w-4 accent-amber-500"
        />
        أرغب باستلام العروض ونتائج السحب
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          disabled={busy}
          className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {busy ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
        {msg && (
          <p role="status" className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
