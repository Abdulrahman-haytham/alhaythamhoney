'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, FileUp, ShieldCheck, Trash2 } from 'lucide-react';
import type { z } from 'zod';
import type { batchInput } from '@/lib/validation';

type Input = z.infer<typeof batchInput>;
export type BatchRow = Input & { id: string; productName: string | null; jarCodes: number };
type ProductOpt = { id: string; name: string };
type VideoOpt = { url: string; caption: string | null };

const empty: Input = {
  code: '',
  title: '',
  productId: null,
  region: null,
  harvestDate: null,
  floralSource: null,
  moisture: null,
  labReportUrl: null,
  videoUrl: null,
  notes: null,
  published: false,
};
const inputClass =
  'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none disabled:text-zinc-500';

function Editor({
  batch,
  products,
  videos,
  onDone,
}: {
  batch?: BatchRow;
  products: ProductOpt[];
  videos: VideoOpt[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Input>(() => {
    if (!batch) return empty;
    const { id: _i, productName: _p, jarCodes: _j, ...rest } = batch;
    return rest;
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Input>(k: K, v: Input[K]) => setForm((f) => ({ ...f, [k]: v }));
  const opt = (v: string) => (v.trim() ? v : null);

  async function uploadPdf(file: File) {
    setMessage('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/files', { method: 'POST', body: fd }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) return setMessage(data.error || 'تعذّر رفع الملف.');
    set('labReportUrl', data.url);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch(batch ? `/api/admin/batches/${batch.id}` : '/api/admin/batches', {
      method: batch ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMessage(data.error || 'تعذّر الحفظ.');
    setMessage('تم الحفظ.');
    router.refresh();
    onDone?.();
  }

  async function remove() {
    if (!batch || !confirm(`حذف الدفعة ${batch.code}؟ رموز المرطبانات تبقى لكنها تفقد الجواز.`))
      return;
    const res = await fetch(`/api/admin/batches/${batch.id}`, { method: 'DELETE' }).catch(
      () => null,
    );
    if (res?.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          رمز الدفعة (يُطبع على الملصق)
          <input
            className={inputClass}
            dir="ltr"
            value={form.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())}
            required
            placeholder="B-2026-SDR-01"
            pattern="[A-Z0-9]+(-[A-Z0-9]+)*"
          />
        </label>
        <label className="text-sm">
          العنوان
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            maxLength={120}
            placeholder="قطاف السدر — أيلول 2026"
          />
        </label>
        <label className="text-sm">
          المنتج
          <select
            className={inputClass}
            value={form.productId ?? ''}
            onChange={(e) => set('productId', e.target.value || null)}
          >
            <option value="">— بلا —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          تاريخ القطاف
          <input
            className={inputClass}
            type="date"
            value={form.harvestDate ?? ''}
            onChange={(e) => set('harvestDate', e.target.value || null)}
          />
        </label>
        <label className="text-sm">
          المنحل / المنطقة
          <input
            className={inputClass}
            value={form.region ?? ''}
            onChange={(e) => set('region', opt(e.target.value))}
            placeholder="منحل الغاب — ريف حماة"
          />
        </label>
        <label className="text-sm">
          المصدر الزهري
          <input
            className={inputClass}
            value={form.floralSource ?? ''}
            onChange={(e) => set('floralSource', opt(e.target.value))}
            placeholder="سدر بري"
          />
        </label>
        <label className="text-sm">
          ملخّص الفحص (رطوبة، نقاء…)
          <input
            className={inputClass}
            value={form.moisture ?? ''}
            onChange={(e) => set('moisture', opt(e.target.value))}
            placeholder="رطوبة 17.2% — خالٍ من السكر المضاف"
          />
        </label>
        <label className="text-sm">
          فيديو القطاف (من الاستديو أو رابط https)
          <input
            className={inputClass}
            dir="ltr"
            list={`videos-${batch?.id ?? 'new'}`}
            value={form.videoUrl ?? ''}
            onChange={(e) => set('videoUrl', opt(e.target.value))}
            placeholder="/uploads/studio/… أو https://…"
          />
          <datalist id={`videos-${batch?.id ?? 'new'}`}>
            {videos.map((v) => (
              <option key={v.url} value={v.url}>
                {v.caption ?? ''}
              </option>
            ))}
          </datalist>
        </label>
      </div>
      <div className="rounded-lg border border-zinc-800 p-3 text-sm">
        <p className="mb-2 text-zinc-300">تقرير المخبر (PDF حتى 8MB)</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadPdf(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:border-amber-500/50"
          >
            <FileUp className="h-3.5 w-3.5" /> رفع PDF
          </button>
          {form.labReportUrl ? (
            <>
              <a
                href={form.labReportUrl}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-green-300 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> عرض الملف
              </a>
              <button
                type="button"
                onClick={() => set('labReportUrl', null)}
                className="text-xs text-red-400"
              >
                إزالة
              </button>
            </>
          ) : (
            <span className="text-xs text-zinc-500">لا ملف بعد</span>
          )}
        </div>
      </div>
      <label className="block text-sm">
        قصة الدفعة (Markdown — اختياري)
        <textarea
          className={`${inputClass} min-h-[120px]`}
          value={form.notes ?? ''}
          onChange={(e) => set('notes', opt(e.target.value))}
          placeholder="قُطفت هذه الدفعة في …"
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
          />{' '}
          منشور (يفتحه الزوار)
        </label>
        <button
          disabled={busy}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50"
        >
          {busy ? 'جارٍ الحفظ…' : batch ? 'حفظ' : 'إنشاء الجواز'}
        </button>
        {batch && (
          <>
            <a
              href={`/batch/${batch.code}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-amber-400"
            >
              <ExternalLink className="h-3.5 w-3.5" /> عرض الجواز
            </a>
            <button
              type="button"
              onClick={remove}
              className="mr-auto inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" /> حذف
            </button>
          </>
        )}
        <p role="status" className="w-full text-sm text-zinc-400">
          {message}
        </p>
      </div>
    </form>
  );
}

export function BatchesPanel({
  batches,
  products,
  videos,
}: {
  batches: BatchRow[];
  products: ProductOpt[];
  videos: VideoOpt[];
}) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-4">
      <button
        className="rounded-lg border border-amber-500 px-4 py-2.5 text-sm text-amber-400"
        onClick={() => setCreating(!creating)}
      >
        {creating ? 'إلغاء' : '+ دفعة جديدة'}
      </button>
      {creating && <Editor products={products} videos={videos} onDone={() => setCreating(false)} />}
      {batches.map((b) => (
        <details key={b.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
          <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-4 text-sm">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span className="font-mono font-bold text-white" dir="ltr">
              {b.code}
            </span>
            <span className="text-zinc-300">{b.title}</span>
            {b.productName && <span className="text-xs text-zinc-500">· {b.productName}</span>}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${b.published ? 'bg-green-500/15 text-green-300' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {b.published ? 'منشور' : 'مسودّة'}
            </span>
            <span className="mr-auto text-xs text-zinc-500">
              {b.jarCodes} رمز مرطبان{b.labReportUrl ? ' · فحص مرفق' : ''}
            </span>
          </summary>
          <div className="border-t border-zinc-800 p-4">
            <Editor batch={b} products={products} videos={videos} />
          </div>
        </details>
      ))}
      {batches.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          لا دفعات بعد. أنشئ جواز أول قطاف وارفع تقرير المخبر — هذا ما يميّزك عن كل بائع عسل.
        </p>
      )}
    </div>
  );
}
