'use client';

import { useEffect, useRef, useState } from 'react';
import { toArabicIndic, type GlossaryStageMeta } from '@/lib/glossary';
import { StageIcon } from '@/components/glossary/StageIcon';

/**
 * شريط المراحل اللاصق: يميّز المرحلة الظاهرة أثناء التمرير (IntersectionObserver على
 * `[data-stage]`، بلا اختطاف للتمرير)، والنقر ينزل برأس المرحلة تحت الشريط.
 * الروابط `#stage-N` حقيقية فتعمل بلا JavaScript. الإزاحة العلوية تُقاس من ارتفاع
 * الرأس الثابت في effect وتُكتب كمتغيّر CSS عبر ref — لا حالة، فلا اختلاف هيدريشن.
 */
export function StageNav({ stages }: { stages: GlossaryStageMeta[] }) {
  const navRef = useRef<HTMLElement>(null);
  const chipRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [active, setActive] = useState(stages[0]?.id ?? '');

  // ارتفاع الرأس الثابت (مع شريط الإعلان أو بدونه) → --stage-nav-top
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const header = document.querySelector('header');
      nav.style.setProperty('--stage-nav-top', `${header?.offsetHeight ?? 0}px`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // المرحلة التي تشغل نطاق منتصف الشاشة هي النشطة
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-stage]');
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    // قرب نهاية الصفحة قد لا تصل آخر مرحلة قصيرة إلى نطاق المنتصف — نعتبرها نشطة عند الوصول للأسفل
    const last = sections[sections.length - 1];
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 40)
        setActive(last.id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // الرقاقة النشطة تُبقى مرئية في الشريط الأفقي (scrollIntoView آمن مع RTL)
  useEffect(() => {
    chipRefs.current
      .get(active)
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [active]);

  function jump(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const offset = (navRef.current?.getBoundingClientRect().bottom ?? 0) + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
  }

  return (
    <nav
      ref={navRef}
      aria-label="مراحل الرحلة"
      className="sticky top-[var(--stage-nav-top,5rem)] z-30 -mx-4 mb-8 border-y border-zinc-800/80 bg-zinc-950/90 px-4 py-2 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border"
    >
      <div className="flex snap-x gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stages.map((s) => {
          const on = s.id === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              ref={(el) => {
                if (el) chipRefs.current.set(s.id, el);
                else chipRefs.current.delete(s.id);
              }}
              onClick={(e) => jump(e, s.id)}
              aria-current={on ? 'true' : undefined}
              className={`inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                on
                  ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              <span className="font-amiri text-sm font-bold">{toArabicIndic(s.index)}</span>
              <StageIcon icon={s.icon} className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{s.name}</span>
              <span className="text-[10px] text-zinc-500">({s.count})</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
