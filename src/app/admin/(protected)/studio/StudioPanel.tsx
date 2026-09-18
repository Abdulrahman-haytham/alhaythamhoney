'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, ImageOff } from 'lucide-react';
import { HARVEST_STEPS, isHarvestStepKey } from '@/lib/harvest';

export interface StudioPhoto {
  id: string;
  url: string;
  caption: string | null;
  tag: string | null;
  type: 'IMAGE' | 'VIDEO';
  createdAt: string;
}

const selectClass =
  'h-9 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-xs text-white focus:border-amber-500/50 focus:outline-none';

/** قائمة خطوات القطاف — القيمة الفارغة = لقطة عامة للاستديو فقط */
function TagSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={isHarvestStepKey(value) ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label="ربط بخطوة من رحلة القطاف"
      className={selectClass}
    >
      <option value="">— لقطة عامة (بلا خطوة)</option>
      {HARVEST_STEPS.map((s) => (
        <option key={s.key} value={s.key}>
          رحلة القطاف: {s.title}
        </option>
      ))}
    </select>
  );
}

export function StudioPanel({ initialPhotos }: { initialPhotos: StudioPhoto[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (file.size > (file.type.startsWith('video/') ? 60 : 8) * 1024 * 1024) {
      setError('الحد الأقصى 8 ميغابايت للصورة و60 ميغابايت للفيديو.');
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    if (caption.trim()) form.append('caption', caption.trim());
    if (tag) form.append('tag', tag);

    const res = await fetch('/api/admin/studio', { method: 'POST', body: form }).catch(() => null);
    setUploading(false);
    if (!res) {
      setError('تعذّر الاتصال. حاول مجدداً.');
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'فشل رفع الصورة.');
      return;
    }

    const { photo } = await res.json();
    setPhotos((prev) => [photo, ...prev]);
    setCaption('');
    setTag('');
    if (fileRef.current) fileRef.current.value = '';
    router.refresh();
  }

  async function retag(id: string, value: string) {
    setError(null);
    setBusyId(id);
    const res = await fetch(`/api/admin/studio/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: value || null }),
    }).catch(() => null);
    setBusyId(null);
    if (!res?.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data.error ?? 'تعذّر حفظ الوسم.');
      return;
    }
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, tag: value || null } : p)));
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('حذف هذه الصورة نهائياً؟')) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/studio/${id}`, { method: 'DELETE' }).catch(() => null);
    setBusyId(null);
    if (!res) {
      setError('تعذّر الاتصال. حاول مجدداً.');
      return;
    }
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'تعذّر الحذف.');
    }
  }

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <label className="mb-3 block text-sm font-medium text-zinc-300">وصف مختصر (اختياري)</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="مثال: جلسة تصوير عسل الدردار"
          className="mb-4 h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
        />
        <label className="mb-4 block text-sm font-medium text-zinc-300">
          ربط بخطوة من رحلة القطاف (اختياري)
          <div className="mt-1.5 max-w-sm">
            <TagSelect value={tag} onChange={setTag} disabled={uploading} />
          </div>
          <span className="mt-1 block text-xs font-normal text-zinc-600">
            اللقطة الموسومة تظهر تحت الخطوة نفسها في /beekeeping/harvest بعنوان «هكذا نعمل في مناحل
            الهيثم».
          </span>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
          disabled={uploading}
          className="hidden"
          id="studio-upload"
        />
        <label
          htmlFor="studio-upload"
          className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400 ${
            uploading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'جارٍ الرفع...' : 'رفع لقطة جديدة'}
        </label>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <p className="mt-3 text-xs text-zinc-600">
          صور (JPG, PNG, WEBP, AVIF) حتى 8 ميغابايت — فيديو (MP4, WEBM, MOV) حتى 60 ميغابايت.
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-zinc-600">
          <ImageOff className="h-10 w-10" />
          <p>لا توجد لقطات بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50"
            >
              {p.type === 'VIDEO' ? (
                <video
                  src={p.url}
                  controls
                  preload="metadata"
                  playsInline
                  className="aspect-square w-full bg-black object-cover"
                />
              ) : (
                <img
                  src={p.url}
                  alt={p.caption ?? ''}
                  className="aspect-square w-full object-cover"
                />
              )}
              <div className="bg-zinc-900 p-3">
                {p.caption && <p className="mb-2 truncate text-xs text-zinc-200">{p.caption}</p>}
                <div className="mb-2">
                  <TagSelect
                    value={p.tag ?? ''}
                    onChange={(v) => retag(p.id, v)}
                    disabled={busyId === p.id}
                  />
                </div>
                <label className="mb-2 block text-xs text-zinc-400">
                  رابط الملف (للنسخ)
                  <input
                    readOnly
                    value={p.url}
                    onFocus={(e) => e.target.select()}
                    className="mt-1 w-full rounded bg-zinc-950 p-2 text-xs"
                    dir="ltr"
                  />
                </label>
                <button
                  onClick={() => remove(p.id)}
                  disabled={busyId === p.id}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-600/90 px-3 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
