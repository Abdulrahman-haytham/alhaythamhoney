'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MessageCircle, Trash2 } from 'lucide-react';
import type { LeadStatus } from '@prisma/client';

export interface LeadRow {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string | null;
  city: string;
  quantity: string | null;
  message: string;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
}

const STATUSES: { value: LeadStatus; label: string; cls: string }[] = [
  { value: 'NEW', label: 'جديد', cls: 'bg-amber-500/15 text-amber-300' },
  { value: 'CONTACTED', label: 'تم التواصل', cls: 'bg-blue-500/15 text-blue-300' },
  { value: 'QUOTED', label: 'أُرسل عرض', cls: 'bg-purple-500/15 text-purple-300' },
  { value: 'WON', label: 'تم البيع', cls: 'bg-green-500/15 text-green-300' },
  { value: 'LOST', label: 'لم يتم', cls: 'bg-zinc-800 text-zinc-400' },
];
const dateFmt = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });

function LeadCard({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const st = STATUSES.find((s) => s.value === lead.status)!;

  async function save() {
    setBusy(true);
    setMessage('');
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes: notes.trim() || null }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setMessage('تعذّر الحفظ.');
    setMessage('تم الحفظ.');
    router.refresh();
  }
  async function remove() {
    if (!confirm(`حذف طلب ${lead.business}؟`)) return;
    const res = await fetch(`/api/admin/leads/${lead.id}`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) router.refresh();
  }

  return (
    <details className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4 text-sm">
        <Building2 className="h-4 w-4 text-amber-500" />
        <span className="font-bold text-white">{lead.business}</span>
        <span className="text-zinc-400">
          {lead.name} · {lead.city}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${st.cls}`}>
          {st.label}
        </span>
        <time className="mr-auto text-xs text-zinc-500">
          {dateFmt.format(new Date(lead.createdAt))}
        </time>
      </summary>
      <div className="grid gap-4 border-t border-zinc-800 p-4 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <p className="whitespace-pre-wrap text-zinc-200">{lead.message}</p>
          {lead.quantity && (
            <p className="text-zinc-400">
              <span className="text-zinc-500">الكميات:</span> {lead.quantity}
            </p>
          )}
          <p dir="ltr" className="text-left">
            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${lead.name}، بخصوص طلب الجملة لـ${lead.business}`)}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-green-400 hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" /> {lead.phone}
            </a>
            {lead.email && <span className="mr-3 text-zinc-500">{lead.email}</span>}
          </p>
        </div>
        <div className="space-y-3">
          <label className="block text-sm">
            الحالة
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            ملاحظات (المكالمات، السعر المعروض…)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 disabled:opacity-50"
            >
              {busy ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={remove}
              className="mr-auto inline-flex items-center gap-1 text-xs text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" /> حذف
            </button>
            <p role="status" className="w-full text-xs text-zinc-400">
              {message}
            </p>
          </div>
        </div>
      </div>
    </details>
  );
}

export function LeadsPanel({ leads }: { leads: LeadRow[] }) {
  const [filter, setFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const shown = filter === 'ALL' ? leads : leads.filter((l) => l.status === filter);
  const count = (s: LeadStatus) => leads.filter((l) => l.status === s).length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`rounded-full border px-3 py-1 ${filter === 'ALL' ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}
        >
          الكل ({leads.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setFilter(s.value)}
            className={`rounded-full border px-3 py-1 ${filter === s.value ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}
          >
            {s.label} ({count(s.value)})
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          لا طلبات جملة هنا.
        </p>
      ) : (
        shown.map((l) => <LeadCard key={l.id} lead={l} />)
      )}
    </div>
  );
}
