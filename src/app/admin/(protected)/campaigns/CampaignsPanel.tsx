'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Send, Eye, PenLine, Trash2, FlaskConical } from 'lucide-react';
import type { CampaignStatus } from '@prisma/client';

export interface CampaignRow {
  id: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  recipientsCount: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  sentAt: string | null;
  createdAt: string;
}

const STATUS: Record<CampaignStatus, { label: string; cls: string }> = {
  DRAFT: { label: 'مسودّة', cls: 'bg-zinc-800 text-zinc-300' },
  SENDING: { label: 'جارٍ الإرسال', cls: 'bg-amber-500/15 text-amber-300' },
  SENT: { label: 'أُرسلت', cls: 'bg-green-500/15 text-green-300' },
};

const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none';
const dateFmt = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });

function Editor({
  campaign,
  adminEmail,
  onDone,
}: {
  campaign?: CampaignRow;
  adminEmail: string | null;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(campaign?.subject ?? '');
  const [body, setBody] = useState(campaign?.body ?? '');
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [preview, setPreview] = useState('');
  const [testEmail, setTestEmail] = useState(adminEmail ?? '');
  const [busy, setBusy] = useState<'' | 'save' | 'test' | 'send'>('');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [progress, _setProgress] = useState<{ sent: number; remaining: number } | null>(null);
  const locked = campaign ? campaign.status !== 'DRAFT' : false;

  async function save(): Promise<string | null> {
    setBusy('save');
    setMessage(null);
    const res = await fetch(
      campaign ? `/api/admin/campaigns/${campaign.id}` : '/api/admin/campaigns',
      {
        method: campaign ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      },
    ).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy('');
    if (!res?.ok) {
      setMessage({ text: data.error || 'تعذّر الحفظ.', ok: false });
      return null;
    }
    setMessage({ text: 'تم الحفظ.', ok: true });
    router.refresh();
    return campaign?.id ?? (data.id as string);
  }

  async function showPreview() {
    setTab('preview');
    const res = await fetch('/api/admin/articles/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setPreview(data.html ?? '<p>تعذّر توليد المعاينة.</p>');
  }

  async function sendTest() {
    const id = locked ? campaign!.id : await save();
    if (!id) return;
    setBusy('test');
    const res = await fetch(`/api/admin/campaigns/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy('');
    setMessage(
      res?.ok
        ? { text: `أُرسلت رسالة تجريبية إلى ${testEmail}.`, ok: true }
        : { text: data.error || 'تعذّر الإرسال.', ok: false },
    );
  }

  async function sendAll() {
    if (!confirm('إرسال الحملة إلى كل الموافقين على العروض الآن؟ لا يمكن التراجع.')) return;
    const id = locked ? campaign!.id : await save();
    if (!id) return;
    setBusy('send');
    const res = await fetch(`/api/admin/campaigns/${id}/send`, { method: 'POST' }).catch(
      () => null,
    );
    const data = res ? await res.json().catch(() => ({})) : {};
    setMessage(
      res?.ok
        ? {
            text: 'أُدرجت الحملة للإرسال. يمكنك إغلاق الصفحة؛ حدّثها لاحقاً لمراجعة النتائج.',
            ok: true,
          }
        : { text: data.error || 'تعذّر بدء الإرسال.', ok: false },
    );
    setBusy('');
    router.refresh();
    onDone?.();
  }

  async function remove() {
    if (!campaign || !confirm('حذف الحملة؟')) return;
    const res = await fetch(`/api/admin/campaigns/${campaign.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (res?.ok) router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 p-4">
      <label className="block text-sm">
        عنوان الرسالة
        <input
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={locked}
          required
          maxLength={150}
          placeholder="وصل عسل السدر الجديد 🍯"
        />
      </label>
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 ${tab === 'write' ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-400'}`}
          >
            <PenLine className="h-3.5 w-3.5" /> كتابة
          </button>
          <button
            type="button"
            onClick={showPreview}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 ${tab === 'preview' ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-400'}`}
          >
            <Eye className="h-3.5 w-3.5" /> معاينة
          </button>
          <span className="mr-auto text-zinc-600">
            Markdown: **غامق**، [رابط](https://…)، ## عنوان
          </span>
        </div>
        {tab === 'write' ? (
          <textarea
            className={`${inputClass} min-h-[220px] font-mono text-xs leading-relaxed`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={locked}
            placeholder={'مرحباً،\n\nوصل قطاف السدر لهذا الموسم…\n\n[اطلب الآن](https://…/shop)'}
          />
        ) : (
          <div
            className="prose prose-invert min-h-[220px] max-w-none rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm"
            dangerouslySetInnerHTML={{
              __html: preview || '<p class="text-zinc-500">جارٍ التحضير…</p>',
            }}
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!locked && (
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy !== ''}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {busy === 'save' ? 'جارٍ الحفظ…' : 'حفظ المسودّة'}
          </button>
        )}
        <div className="flex items-center gap-1">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="بريدك للتجربة"
            dir="ltr"
            className="h-9 w-48 rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-xs text-white"
          />
          <button
            type="button"
            onClick={sendTest}
            disabled={busy !== '' || !testEmail}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-200 hover:border-amber-500/50 disabled:opacity-50"
          >
            <FlaskConical className="h-3.5 w-3.5" /> رسالة تجريبية
          </button>
        </div>
        {campaign?.status !== 'SENT' && (
          <button
            type="button"
            onClick={sendAll}
            disabled={busy !== '' || !subject || !body}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {busy === 'send'
              ? 'جارٍ الإرسال…'
              : campaign?.status === 'SENDING'
                ? 'متابعة الإرسال'
                : 'إرسال للجميع'}
          </button>
        )}
        {campaign && !locked && (
          <button
            type="button"
            onClick={remove}
            className="mr-auto inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> حذف
          </button>
        )}
      </div>
      {progress && (
        <p className="text-xs text-amber-200">
          أُرسل {progress.sent} · بقي {progress.remaining}
        </p>
      )}
      {message && (
        <p role="status" className={`text-sm ${message.ok ? 'text-green-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export function CampaignsPanel({
  campaigns,
  adminEmail,
}: {
  campaigns: CampaignRow[];
  adminEmail: string | null;
}) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-4">
      <button
        className="rounded-lg border border-amber-500 px-4 py-2.5 text-sm text-amber-400"
        onClick={() => setCreating(!creating)}
      >
        {creating ? 'إلغاء' : '+ حملة جديدة'}
      </button>
      {creating && <Editor adminEmail={adminEmail} onDone={() => setCreating(false)} />}
      {campaigns.map((c) => {
        const st = STATUS[c.status];
        const openRate = c.sentCount ? Math.round((c.openCount / c.sentCount) * 100) : 0;
        return (
          <details key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
            <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4 text-sm">
              <Mail className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-white">{c.subject}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${st.cls}`}>
                {st.label}
              </span>
              {c.status !== 'DRAFT' && (
                <span className="text-xs text-zinc-400">
                  {c.sentCount}/{c.recipientsCount} أُرسلت · {c.openCount} فتحاً مرصوداً ({openRate}
                  %)
                  {c.failedCount > 0 && ` · ${c.failedCount} فشلت`}
                </span>
              )}
              <time className="mr-auto text-xs text-zinc-500">
                {dateFmt.format(new Date(c.sentAt ?? c.createdAt))}
              </time>
            </summary>
            <div className="border-t border-zinc-800 p-4">
              <Editor campaign={c} adminEmail={adminEmail} />
            </div>
          </details>
        );
      })}
      {campaigns.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          لا حملات بعد. أول حملة جيدة: «وصل قطاف الموسم» مع صورة ورابط للمتجر.
        </p>
      )}
    </div>
  );
}
