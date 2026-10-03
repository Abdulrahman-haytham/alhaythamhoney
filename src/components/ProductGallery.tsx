'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { isVideoUrl } from '@/lib/media';

/**
 * معرض المنتج أو الخلطة: صورة واحدة تُعرض كما كانت؛ أكثر من ملف (صور ثم فيديو) يصير
 * شريطاً يُسحب بالإصبع (scroll-snap، بلا مكتبة) مع مصغّرات تحته. الأولى فقط `priority`
 * لأنها صورة LCP، والبقية تُحمَّل عند الاقتراب منها. الفيديو لا يُحمَّل منه إلا بياناته
 * حتى يضغط الزائر تشغيل، ويتوقف حين يُسحب بعيداً عنه.
 */
export default function ProductGallery({
  images,
  alt,
  children,
}: {
  images: string[];
  alt: string;
  /** ما يُرسم فوق الصورة (الشارة، «نفدت الكمية») */
  children?: React.ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const go = (i: number) =>
    track.current?.children[i]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-900/50">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            // في RTL يكون scrollLeft سالباً — نأخذ المطلق
            const index = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
            if (index === active) return;
            setActive(index);
            el.querySelectorAll('video').forEach((v) => v.pause());
          }}
          className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center">
              {isVideoUrl(src) ? (
                <video
                  src={`${src}#t=0.1`}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${alt} — فيديو`}
                  className="h-full w-full bg-black object-contain"
                />
              ) : (
                <Image
                  src={src}
                  alt={i === 0 ? alt : `${alt} — صورة ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
          ))}
        </div>
        {children}
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-5 bg-amber-500' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={isVideoUrl(src) ? `عرض الفيديو ${i + 1}` : `عرض الصورة ${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === active ? 'border-amber-500' : 'border-zinc-800 opacity-70'
              }`}
            >
              {isVideoUrl(src) ? (
                <>
                  <video
                    src={`${src}#t=0.1`}
                    preload="metadata"
                    muted
                    playsInline
                    tabIndex={-1}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/30 text-white">
                    <Play className="h-5 w-5" fill="currentColor" />
                  </span>
                </>
              ) : (
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
