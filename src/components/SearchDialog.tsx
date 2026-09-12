'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X, FileText, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SearchDoc {
  kind: 'product' | 'article';
  slug: string;
  title: string;
  desc: string;
  image?: string;
  terms: string;
}

export function SearchDialog({
  open,
  onClose,
  docs,
}: {
  open: boolean;
  onClose: () => void;
  docs: SearchDoc[];
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // نؤخر التركيز إطاراً حتى يُركّب الحقل فعلياً
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
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
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return docs.filter((d) => d.terms.includes(q)).slice(0, 8);
  }, [docs, query]);

  const products = results.filter((r) => r.kind === 'product');
  const articles = results.filter((r) => r.kind === 'article');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-sm px-4 pt-24 sm:pt-32"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative border-b border-zinc-800">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن منتج أو مقال..."
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
                    اكتب كلمة للبحث في المنتجات والمقالات
                  </p>
                ) : results.length === 0 ? (
                  <p className="px-5 py-8 text-center text-zinc-500 text-sm">
                    لا توجد نتائج مطابقة لـ «{query}»
                  </p>
                ) : (
                  <>
                    {products.length > 0 && (
                      <Section title="المنتجات" icon={<Package className="w-3.5 h-3.5" />}>
                        {products.map((r) => (
                          <ResultRow
                            key={`p-${r.slug}`}
                            doc={r}
                            href={`/product/${r.slug}`}
                            onNavigate={onClose}
                          />
                        ))}
                      </Section>
                    )}
                    {articles.length > 0 && (
                      <Section title="المقالات" icon={<FileText className="w-3.5 h-3.5" />}>
                        {articles.map((r) => (
                          <ResultRow
                            key={`a-${r.slug}`}
                            doc={r}
                            href={`/articles/${r.slug}`}
                            onNavigate={onClose}
                          />
                        ))}
                      </Section>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="py-2">
      <div className="flex items-center gap-1.5 px-5 py-2 text-[11px] font-bold text-amber-500/80 tracking-wide">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function ResultRow({
  doc,
  href,
  onNavigate,
}: {
  doc: SearchDoc;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
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
      <div className="min-w-0">
        <p className="text-zinc-100 font-bold text-sm truncate">{doc.title}</p>
        <p className="text-zinc-500 text-xs line-clamp-1">{doc.desc}</p>
      </div>
    </Link>
  );
}
