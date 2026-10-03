'use client';

import { useId, useState } from 'react';
import { ImagePlus, Loader2, Play, Star, X } from 'lucide-react';
import { uploadMedia } from '@/lib/upload-client';
import { isVideoUrl } from '@/lib/media';

/**
 * حقل وسائط لوحة التحكم (منتج أو خلطة): يرفع من الجهاز مباشرة — صوراً وفيديو، عدة
 * ملفات معاً، بلا روابط. الصور أولاً ثم الفيديو؛ أول صورة هي الرئيسية، وزر النجمة
 * يقدّم أي صورة لتصير الأولى.
 */
export function MediaField({
  label,
  value,
  onChange,
  maxImages = 12,
  maxVideos = 4,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  maxImages?: number;
  maxVideos?: number;
  hint?: string;
}) {
  const inputId = useId();
  const max = maxImages + maxVideos;
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    fraction: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** الصور قبل الفيديو دائماً — الترتيب نفسه الذي يراه الزبون في المعرض */
  const ordered = (list: string[]) => [
    ...list.filter((u) => !isVideoUrl(u)),
    ...list.filter(isVideoUrl),
  ];
  const mainImage = value.find((u) => !isVideoUrl(u));

  async function upload(files: File[]) {
    setError(null);
    const picked = files.slice(0, max - value.length);
    const skipped = files.length - picked.length;
    const failed: string[] = [];
    let next = value;
    for (const [done, file] of picked.entries()) {
      // الحدّان يفرضهما الخادم عند الحفظ أيضاً؛ هنا نوفّر رفعاً لن يُقبل
      const video = file.type.startsWith('video/');
      const count = next.filter((u) => isVideoUrl(u) === video).length;
      if (count >= (video ? maxVideos : maxImages)) {
        failed.push(
          `${file.name}: ${video ? `الحد ${maxVideos} مقاطع فيديو` : `الحد ${maxImages} صورة`}.`,
        );
        continue;
      }
      setProgress({ done, total: picked.length, fraction: 0 });
      try {
        const { url } = await uploadMedia(file, 'media', (fraction) =>
          setProgress({ done, total: picked.length, fraction }),
        );
        next = ordered([...next, url]);
        onChange(next);
      } catch (e) {
        failed.push(`${file.name}: ${e instanceof Error ? e.message : 'تعذّر الرفع.'}`);
      }
    }
    setProgress(null);
    if (skipped > 0) failed.push(`الحد ${max} ملفاً — لم يُرفع ${skipped}.`);
    if (failed.length) setError(failed.join('\n'));
  }

  return (
    <div>
      <p className="mb-2">{label}</p>
      <div className="flex flex-wrap gap-3">
        {value.map((url) => {
          const video = isVideoUrl(url);
          const main = url === mainImage;
          return (
            <div
              key={url}
              className={`relative h-24 w-24 overflow-hidden rounded-xl border bg-zinc-900 ${
                main ? 'border-amber-500' : 'border-zinc-700'
              }`}
            >
              {video ? (
                <>
                  {/* #t=0.1 يجعل المتصفح يرسم أول لقطة بدل مربع أسود */}
                  <video
                    src={`${url}#t=0.1`}
                    preload="metadata"
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/70 text-white">
                      <Play className="h-4 w-4" fill="currentColor" />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 bg-zinc-950/80 py-0.5 text-center text-[10px] font-bold text-zinc-200">
                    فيديو
                  </span>
                </>
              ) : (
                <img src={url} alt="" className="h-full w-full object-cover" />
              )}
              {main && (
                <span className="absolute inset-x-0 bottom-0 bg-amber-500 py-0.5 text-center text-[10px] font-bold text-zinc-950">
                  الرئيسية
                </span>
              )}
              {!video && !main && (
                <button
                  type="button"
                  onClick={() => onChange(ordered([url, ...value.filter((u) => u !== url)]))}
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
                aria-label={video ? 'إزالة الفيديو' : 'إزالة الصورة'}
                title="إزالة"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        {value.length < max && (
          <label
            htmlFor={inputId}
            className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-amber-500/50 px-1 text-center text-xs font-bold text-amber-400 ${
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
                رفع صور أو فيديو
              </>
            )}
          </label>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
          multiple
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
