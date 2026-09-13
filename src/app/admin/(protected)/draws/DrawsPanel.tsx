'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Trophy, Gift } from 'lucide-react';
import type { z } from 'zod';
import type { drawInput } from '@/lib/validation';

type Input = z.infer<typeof drawInput>;
interface Winner {
  name: string;
  phone: string;
  email: string;
  city: string | null;
  code: string;
}
type Row = Input & { id: string; entries: number; winner: Winner | null };

const today = () => new Date().toISOString().slice(0, 10);
const inWeek = () => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
const empty = (): Input => ({
  title: 'سحب هذا الأسبوع',
  prize: 'مرطبان عسل حبة البركة 500غ',
  description: null,
  startsAt: today(),
  endsAt: inWeek(),
  status: 'OPEN',
  maxEntries: 0,
});
const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-base text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none disabled:text-zinc-500';
const STATUS: Record<Input['status'], { label: string; cls: string }> = {
  DRAFT: { label: 'مسودّة', cls: 'bg-zinc-800 text-zinc-300' },
  OPEN: { label: 'مفتوح', cls: 'bg-green-500/15 text-green-300' },
  CLOSED: { label: 'مغلق', cls: 'bg-sky-500/15 text-sky-300' },
  DRAWN: { label: 'أُعلن الفائز', cls: 'bg-amber-500 text-zinc-950' },
};

function Editor({ draw, onDone }: { draw?: Row; onDone?: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<Input>(() => {
    if (!draw) return empty();
    const { id: _id, entries: _e, winner: _w, ...rest } = draw;
    return rest;
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const drawn = draw?.status === 'DRAWN';
  function set<K extends keyof Input>(key: K, value: Input[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    setMessage('');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) {
      setMessage(data.error || 'تعذّر التنفيذ.');
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          await call(
            draw ? `/api/admin/draws/${draw.id}` : '/api/admin/draws',
            draw ? 'PATCH' : 'POST',
            form,
          )
        ) {
          setMessage('تم الحفظ.');
          onDone?.();
        }
      }}
      className="space-y-4 p-4 sm:p-5"
    >
      {draw?.winner && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="mb-2 flex items-center gap-2 font-bold text-amber-300">
            <Trophy className="h-5 w-5" /> الفائز
          </p>
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-zinc-500">الاسم:</dt>
              <dd className="text-white">{draw.winner.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-zinc-500">الهاتف:</dt>
              <dd className="text-white" dir="ltr">
                {draw.winner.phone}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-zinc-500">البريد:</dt>
              <dd className="text-white" dir="ltr">
                {draw.winner.email}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-zinc-500">الرمز الفائز:</dt>
              <dd className="font-mono text-white" dir="ltr">
                {draw.winner.code}
              </dd>
            </div>
            {draw.winner.city && (
              <div className="flex gap-2">
                <dt className="text-zinc-500">المدينة:</dt>
                <dd className="text-white">{draw.winner.city}</dd>
              </div>
            )}
          </dl>
          <a
            href={`https://wa.me/${draw.winner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مبروك ${draw.winner.name}! فزت في «${draw.title}» بجائزة ${draw.prize} من الهيثم — نحل وعسل 🍯`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-500"
          >
            أبلغه على واتساب
          </a>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          العنوان
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            disabled={drawn}
          />
        </label>
        <label>
          الجائزة
          <input
            className={inputClass}
            value={form.prize}
            onChange={(e) => set('prize', e.target.value)}
            required
            disabled={drawn}
          />
        </label>
        <label>
          يبدأ
          <input
            className={inputClass}
            type="date"
            value={form.startsAt}
            onChange={(e) => set('startsAt', e.target.value)}
            required
            disabled={drawn}
          />
        </label>
        <label>
          ينتهي (يشمل اليوم)
          <input
            className={inputClass}
            type="date"
            value={form.endsAt}
            onChange={(e) => set('endsAt', e.target.value)}
            required
            disabled={drawn}
          />
        </label>
        <label>
          الحالة
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => set('status', e.target.value as Input['status'])}
            disabled={drawn}
          >
            <option value="DRAFT">مسودّة (غير ظاهر)</option>
            <option value="OPEN">مفتوح للمشاركة</option>
            <option value="CLOSED">مغلق (بانتظار السحب)</option>
            {drawn && <option value="DRAWN">أُعلن الفائز</option>}
          </select>
        </label>
        <label>
          حد المشاركات لكل حساب (0 = بلا حد)
          <input
            className={inputClass}
            type="number"
            min={0}
            max={1000}
            value={form.maxEntries}
            onChange={(e) => set('maxEntries', Number(e.target.value) || 0)}
            disabled={drawn}
          />
        </label>
        <label className="sm:col-span-2">
          وصف قصير (اختياري)
          <textarea
            className={inputClass}
            rows={2}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value || null)}
            disabled={drawn}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {!drawn && (
          <button
            disabled={busy}
            className="rounded-lg bg-amber-500 px-6 py-2.5 font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {busy ? 'جارٍ الحفظ…' : draw ? 'حفظ' : 'إنشاء السحب'}
          </button>
        )}
        {draw && !drawn && (
          <button
            type="button"
            disabled={busy || draw.entries === 0}
            onClick={async () => {
              if (
                !window.confirm(`اختيار فائز عشوائياً من ${draw.entries} مشاركة؟ لا يمكن التراجع.`)
              )
                return;
              await call(`/api/admin/draws/${draw.id}/pick`, 'POST');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500 px-5 py-2.5 font-bold text-amber-300 hover:bg-amber-500/10 disabled:opacity-40"
          >
            <Trophy className="h-4 w-4" /> اسحب الفائز ({draw.entries})
          </button>
        )}
        {draw && !drawn && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (window.confirm(`حذف «${draw.title}» ومشاركاته؟`))
                await call(`/api/admin/draws/${draw.id}`, 'DELETE');
            }}
            className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" /> حذف
          </button>
        )}
        <p role="status" className="text-sm text-zinc-300">
          {message}
        </p>
      </div>
    </form>
  );
}

export function DrawsPanel({ draws }: { draws: Row[] }) {
  const [creating, setCreating] = useState(false);
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-amiri text-xl font-bold text-white">
          <Gift className="h-5 w-5 text-amber-500" /> السحوبات
        </h2>
        <button
          type="button"
          onClick={() => setCreating(!creating)}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-500 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10"
        >
          <Plus className="h-4 w-4" /> {creating ? 'إلغاء' : 'سحب جديد'}
        </button>
      </div>
      {creating && (
        <div className="rounded-xl border border-amber-500/30 bg-zinc-900/40">
          <Editor onDone={() => setCreating(false)} />
        </div>
      )}
      {draws.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
          لا سحوبات بعد.
        </p>
      )}
      {draws.map((d) => (
        <details
          key={d.id}
          open={d.status === 'OPEN'}
          className="rounded-xl border border-zinc-800 bg-zinc-900/40"
        >
          <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4">
            <span className="font-bold text-white">{d.title}</span>
            <span className="text-sm text-zinc-400">
              {d.prize} · {d.startsAt} → {d.endsAt}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS[d.status].cls}`}
            >
              {STATUS[d.status].label}
            </span>
            <span className="text-xs text-zinc-500">{d.entries} مشاركة</span>
            {d.winner && <span className="text-xs text-amber-300">🏆 {d.winner.name}</span>}
          </summary>
          <Editor draw={d} />
        </details>
      ))}
    </section>
  );
}
