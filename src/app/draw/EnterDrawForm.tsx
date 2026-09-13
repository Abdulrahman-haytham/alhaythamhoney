'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Loader2, PartyPopper } from 'lucide-react';

export function EnterDrawForm({
  initialEntries,
  maxEntries,
}: {
  initialEntries: number;
  maxEntries: number;
}) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [entries, setEntries] = useState(initialEntries);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/draws/enter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMsg({ text: data.error || 'تعذّر التسجيل.', ok: false });
    setEntries(data.entries);
    setCode('');
    setMsg({ text: 'تم! رمزك مسجّل في السحب. حظاً موفقاً 🍯', ok: true });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm text-zinc-300">
        رمز المرطبان
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="HY-XXXX-XXXX"
          dir="ltr"
          autoComplete="off"
          className="mt-1 h-14 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-center font-mono text-xl tracking-widest text-white placeholder:text-zinc-700 focus:border-amber-500/60 focus:outline-none"
          required
        />
      </label>
      <button
        disabled={busy || !code.trim()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-5 w-5" />}
        شارك في السحب
      </button>
      {msg && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}
        >
          {msg.ok && <PartyPopper className="h-4 w-4" />}
          {msg.text}
        </p>
      )}
      <p className="text-center text-xs text-zinc-500">
        مشاركاتك في هذا السحب: <b className="text-amber-300">{entries}</b>
        {maxEntries > 0 && ` من ${maxEntries}`}
      </p>
    </form>
  );
}
