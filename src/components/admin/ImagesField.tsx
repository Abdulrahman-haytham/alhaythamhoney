'use client';

import { useId, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import { uploadMedia } from '@/lib/upload-client';

/**
 * حقل صور لوحة التحكم: يرفع من الجهاز مباشرة (بلا روابط)، ويعرض ما رُفع مصغّراً.
 * الأولى في القائمة هي الصورة الرئيسية — زر النجمة يقدّم أي صورة لتصير الأولى.
 * `max = 1` يجعله حقل صورة واحدة تُستبدل بالرفع.
 */
export function ImagesField({
  label,
  value,
  onChange,
  max = 12,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  hint?: string;
}) {
  const inputId = useId();
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    fraction: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const single = max === 1;

  async function upload(files: File[]) {
    setError(null);
    const room = single ? 1 : max - value.length;
    const picked = files.slice(0, room);
    const skipped = files.length - picked.length;
    const failed: string[] = [];
    let next = value;
    for (const [done, file] of picked.entries()) {
      setProgress({ done, total: picked.length, fraction: 0 });
      try {
        const { url } = await uploadMedia(file, 'image', (fraction) =>
          setProgress({ done, total: picked.length, fraction }),
        );
        next = single ? [url] : [...next, url];
        onChange(next);
      } catch (e) {
        failed.push(`${file.name}: ${e instanceof Error ? e.message : 'تعذّر الرفع.'}`);
      }
    }
    setProgress(null);
    if (skipped > 0) failed.push(`الحد ${max} صورة — لم تُرفع ${skipped}.`);
    if (failed.length) setError(failed.join('\n'));
  }

  return (
    <div>
      <p className="mb-2">{label}</p>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={url}
            className={`relative h-24 w-24 overflow-hidden rounded-xl border bg-zinc-900 ${
              i === 0 && !single ? 'border-amber-500' : 'border-zinc-700'
            }`}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            {i === 0 && !single && (
              <span className="absolute inset-x-0 bottom-0 bg-amber-500 py-0.5 text-center text-[10px] font-bold text-zinc-950">
                الرئيسية
              </span>
            )}
            {i > 0 && (
              <button
                type="button"
                onClick={() => onChange([url, ...value.filter((u) => u !== url)])}
                disabled={progress !== null}
                className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950/80 text-amber-400"
                aria-label="اجعلها الصورة الرئيسية"
                title="اجعلها الرئيسية"
              >
                <Star className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              disabled={progress !== null}
              className="absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950/80 text-red-300"
              aria-label="إزالة الصورة"
              title="إزالة"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {(single || value.length < max) && (
          <label
            htmlFor={inputId}
            className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-amber-500/50 text-center text-xs font-bold text-amber-400 ${
              progress ? 'pointer-events-none opacity-70' : 'hover:bg-amber-500/10'
            }`}
          >
            {progress ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="tabular-nums">
                  {progress.total > 1 && `${progress.done + 1}/${progress.total} · `}
                  {Math.round(progress.fraction * 100)}%
                </span>
              </>
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                {single && value.length ? 'تغيير الصورة' : single ? 'رفع صورة' : 'رفع صور'}
              </>
            )}
          </label>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={!single}
          disabled={progress !== null}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = '';
            if (files.length) void upload(files);
          }}
        />
      </div>
      {hint && <p className="mt-2 text-xs text-zinc-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-2 whitespace-pre-line text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
