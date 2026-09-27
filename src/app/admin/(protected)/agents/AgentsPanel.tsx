'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';

export interface AgentRow {
  id: string;
  name: string;
  governorate: string;
  city: string;
  address: string;
  addressDetail: string | null;
  mapUrl: string | null;
  whatsapp: string | null;
  facebookUrl: string | null;
  active: boolean;
  sortOrder: number;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';

function AgentEditor({ agent, onDone }: { agent?: AgentRow; onDone: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: agent?.name ?? '',
    governorate: agent?.governorate ?? 'حماة',
    city: agent?.city ?? '',
    address: agent?.address ?? '',
    addressDetail: agent?.addressDetail ?? '',
    mapUrl: agent?.mapUrl ?? '',
    whatsapp: agent?.whatsapp ?? '',
    facebookUrl: agent?.facebookUrl ?? '',
    active: agent?.active ?? true,
    sortOrder: agent?.sortOrder ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch(agent ? `/api/admin/agents/${agent.id}` : '/api/admin/agents', {
      method: agent ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, addressDetail: form.addressDetail || null }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحفظ.');
    router.refresh();
    onDone();
  }

  return (
    <form
      onSubmit={save}
      className="grid grid-cols-1 gap-3 rounded-2xl border border-amber-500/20 bg-zinc-900/60 p-4 sm:grid-cols-2"
    >
      <label className="text-xs">
        اسم الوكيل / المحل
        <input
          className={inputClass}
          value={form.name}
          onChange={set('name')}
          required
          maxLength={100}
        />
      </label>
      <label className="text-xs">
        المحافظة
        <input
          className={inputClass}
          value={form.governorate}
          onChange={set('governorate')}
          required
          maxLength={40}
        />
      </label>
      <label className="text-xs">
        المدينة أو المنطقة
        <input
          className={inputClass}
          value={form.city}
          onChange={set('city')}
          placeholder="حماة — حي البعث"
          required
          maxLength={80}
        />
      </label>
      <label className="text-xs">
        العنوان
        <input
          className={inputClass}
          value={form.address}
          onChange={set('address')}
          placeholder="شارع…، بجانب…"
          required
          maxLength={200}
        />
      </label>
      <label className="text-xs sm:col-span-2">
        العنوان التفصيلي (اختياري)
        <input
          className={inputClass}
          value={form.addressDetail}
          onChange={set('addressDetail')}
          placeholder="معلم قريب، الطابق، ساعات الدوام…"
          maxLength={300}
        />
      </label>
      <label className="text-xs sm:col-span-2">
        رابط الموقع على الخريطة (اختياري)
        <input
          className={inputClass}
          value={form.mapUrl}
          onChange={set('mapUrl')}
          placeholder="https://maps.app.goo.gl/…"
          dir="ltr"
          maxLength={300}
        />
        <span className="mt-1 block text-[11px] text-zinc-500">
          من خرائط غوغل: افتح المكان ← مشاركة ← نسخ الرابط، والصقه هنا.
        </span>
      </label>
      <label className="text-xs">
        واتساب الوكيل (اختياري)
        <input
          className={inputClass}
          value={form.whatsapp}
          onChange={set('whatsapp')}
          placeholder="963912345678"
          dir="ltr"
          inputMode="tel"
          maxLength={20}
        />
      </label>
      <label className="text-xs">
        صفحة فيسبوك (اختياري)
        <input
          className={inputClass}
          value={form.facebookUrl}
          onChange={set('facebookUrl')}
          placeholder="https://facebook.com/…"
          dir="ltr"
          maxLength={300}
        />
      </label>
      <label className="text-xs">
        الترتيب
        <input
          className={inputClass}
          type="number"
          min={0}
          max={1000}
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
        />
      </label>
      <label className="flex items-center gap-2 pt-5 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        ظاهر للزوار
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50"
        >
          {busy ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-zinc-400 hover:text-white">
          إلغاء
        </button>
        {message && <span className="text-sm text-red-300">{message}</span>}
      </div>
    </form>
  );
}

export function AgentsPanel({ agents }: { agents: AgentRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | 'new' | null>(agents.length === 0 ? 'new' : null);

  async function remove(agent: AgentRow) {
    if (!confirm(`حذف «${agent.name}» نهائياً؟ لإخفائه مؤقتاً ألغِ «ظاهر للزوار» بدل الحذف.`))
      return;
    const res = await fetch(`/api/admin/agents/${agent.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (res?.ok) router.refresh();
  }

  return (
    <div className="space-y-3">
      {agents.map((a) =>
        editing === a.id ? (
          <AgentEditor key={a.id} agent={a} onDone={() => setEditing(null)} />
        ) : (
          <div
            key={a.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">
                {a.name}{' '}
                {!a.active && (
                  <span className="mr-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                    مخفي
                  </span>
                )}
              </p>
              <p className="text-sm text-zinc-400">
                {a.city} — {a.address}
              </p>
            </div>
            {a.mapUrl && (
              <a
                href={a.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-amber-400"
                aria-label="الخريطة"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setEditing(a.id)}
              className="text-zinc-400 hover:text-amber-400"
              aria-label="تعديل"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => remove(a)}
              className="text-zinc-500 hover:text-red-400"
              aria-label="حذف"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      )}
      {editing === 'new' ? (
        <AgentEditor onDone={() => setEditing(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-amber-500/40 px-4 py-3 text-sm font-bold text-amber-300 hover:bg-amber-500/10"
        >
          <Plus className="h-4 w-4" /> إضافة وكيل
        </button>
      )}
    </div>
  );
}
