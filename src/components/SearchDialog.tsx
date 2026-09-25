'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { trackSearch } from '@/lib/analytics';
import Link from 'next/link';
import { Search, X, FileText, Package, SlidersHorizontal, Loader2, BookOpen } from 'lucide-react';
import { CURRENCY, formatAmount } from '@/lib/money';

export interface SearchDoc {
  kind: 'product' | 'mixture' | 'article' | 'glossary';
  slug: string;
  title: string;
  desc: string;
  image: string | null;
  price: number | null;
  inStock: boolean;
  terms: string;
}

const HREF: Record<SearchDoc['kind'], string> = {
  product: '/product/',
  mixture: '/custom-mixtures/',
  article: '/articles/',
  glossary: '/beekeeping/',
};

let cachedDocs: SearchDoc[] | null = null;

/** تطبيع عربي بسيط حتى يجد «عسل» ما كُتب «العسل» أو بهمزات مختلفة */
function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ً-ْ]/g, '')
    .replace(/\bال/g, '');
}

/**
 * بحث فوري على طريقة Odoo: يجلب فهرساً صغيراً مرة واحدة عند أول فتح
 * ويبحث محلياً مع كل ضغطة، ويعرض الصورة والسعر مباشرة في النتيجة.
 */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  // null = الفهرس لم يُجلب بعد (حالة التحميل)
  const [docs, setDocs] = useState<SearchDoc[] | null>(cachedDocs);
  const loading = docs === null;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    if (!cachedDocs) {
      fetch('/api/search')
        .then((r) => r.json())
        .then((data: { docs: SearchDoc[] }) => {
          cachedDocs = data.docs;
          setDocs(data.docs);
        })
        .catch(() => setDocs([]));
    }
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q || !docs) return [];
    const words = q.split(/\s+/).filter(Boolean);
    return docs
      .map((d) => {
        const hay = normalize(d.terms);
        const title = normalize(d.title);
        if (!words.every((w) => hay.includes(w))) return null;
        // العنوان المطابق يتقدّم على الوصف المطابق
        const score = words.reduce((s, w) => s + (title.includes(w) ? 2 : 1), 0);
        return { d, score };
      })
      .filter((x): x is { d: SearchDoc; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.d)
      .slice(0, 10);
  }, [docs, query]);

  // يُسجَّل البحث بعد توقف الكتابة (لا مع كل حرف) — «بحث بلا نتيجة» يذهب إلى لوحة المؤشرات
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2 || !docs) return;
    const id = setTimeout(() => trackSearch(term, results.length), 900);
    return () => clearTimeout(id);
  }, [query, docs, results.length]);

  const groups: { kind: SearchDoc['kind']; title: string; icon: React.ReactNode }[] = [
    { kind: 'product', title: 'المنتجات', icon: <Package className="w-3.5 h-3.5" /> },
    { kind: 'mixture', title: 'الخلطات', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { kind: 'article', title: 'المقالات', icon: <FileText className="w-3.5 h-3.5" /> },
    { kind: 'glossary', title: 'موسوعة النحّال', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      {open && (
        <div
          className="fade-in fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-sm px-4 pt-24 sm:pt-32"
          onClick={onClose}
        >
          <div
            className="pop-in container mx-auto max-w-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="البحث في الموقع"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative border-b border-zinc-800">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن عسل، خلطة، أو مقال…"
                  aria-label="البحث في الموقع"
                  className="w-full bg-transparent pr-12 pl-12 py-5 text-zinc-100 placeholder-zinc-500 focus:outline-none text-lg"
                />
                <button
                  onClick={onClose}
                  aria-label="إغلاق البحث"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-amber-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() === '' ? (
                  <p className="px-5 py-8 text-center text-zinc-500 text-sm">
                    اكتب كلمة للبحث في المنتجات والخلطات والمقالات
                  </p>
                ) : loading ? (
                  <p className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> جارٍ تجهيز البحث…
                  </p>
                ) : results.length === 0 ? (
                  <p className="px-5 py-8 text-center text-zinc-500 text-sm">
                    لا توجد نتائج مطابقة لـ «{query}»
                  </p>
                ) : (
                  groups.map((g) => {
                    const rows = results.filter((r) => r.kind === g.kind);
                    if (rows.length === 0) return null;
                    return (
                      <div key={g.kind} className="py-2">
                        <div className="flex items-center gap-1.5 px-5 py-2 text-[11px] font-bold text-amber-500/80 tracking-wide">
                          {g.icon}
                          {g.title}
                        </div>
                        {rows.map((doc) => (
                          <Link
                            key={`${doc.kind}-${doc.slug}`}
                            href={`${HREF[doc.kind]}${doc.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/60 transition-colors"
                          >
                            {doc.image ? (
                              <img
                                src={doc.image}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-zinc-800 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-zinc-100 font-bold text-sm truncate">
                                {doc.title}
                              </p>
                              <p className="text-zinc-500 text-xs line-clamp-1">{doc.desc}</p>
                            </div>
                            {doc.kind === 'product' &&
                              (doc.inStock ? (
                                doc.price != null && (
                                  <span className="gold-text shrink-0 text-sm font-bold tabular-nums">
                                    {formatAmount(doc.price)}{' '}
                                    <span className="text-[10px] text-zinc-500">
                                      {CURRENCY.label}
                                    </span>
                                  </span>
                                )
                              ) : (
                                <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                                  غير متوفر
                                </span>
                              ))}
                          </Link>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
