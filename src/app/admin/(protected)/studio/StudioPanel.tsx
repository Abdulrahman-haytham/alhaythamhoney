'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, ImageOff } from 'lucide-react';

export interface StudioPhoto {
  id: string;
  url: string;
  caption: string | null;
  type: 'IMAGE' | 'VIDEO';
  createdAt: string;
}

const MAX_SIZE = 8 * 1024 * 1024;

export function StudioPanel({ initialPhotos }: { initialPhotos: StudioPhoto[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError('حجم الملف أكبر من الحد المسموح (8 ميغابايت).');
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    if (caption.trim()) form.append('caption', caption.trim());

    const res = await fetch('/api/admin/studio', { method: 'POST', body: form });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'فشل رفع الصورة.');
      return;
    }

    const { photo } = await res.json();
    setPhotos((prev) => [photo, ...prev]);
    setCaption('');
    if (fileRef.current) fileRef.current.value = '';
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('حذف هذه الصورة نهائياً؟')) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/studio/${id}`, { method: 'DELETE' });
    setBusyId(null);
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
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
            <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
              {p.type === 'VIDEO' ? (
                <video src={p.url} controls preload="metadata" playsInline className="aspect-square w-full bg-black object-cover" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.url} alt={p.caption ?? ''} className="aspect-square w-full object-cover" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                {p.caption && <p className="mb-2 truncate text-xs text-zinc-200">{p.caption}</p>}
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
