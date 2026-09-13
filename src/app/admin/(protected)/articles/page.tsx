import Link from 'next/link';
import { Plus, Pencil, ExternalLink } from 'lucide-react';
import { db } from '@/lib/db';
import { formatArticleDate, toIsoDay } from '@/lib/articles';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const articles = await db.article.findMany({
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const now = new Date();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 font-amiri text-3xl font-bold">المدونة</h1>
          <p className="text-sm text-zinc-400">
            {articles.length} مقالات · المسودّات والمقالات المجدولة لا تظهر للزوار.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          مقال جديد
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
          لا مقالات بعد — ابدأ بكتابة أول مقال.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
          {articles.map((a) => {
            const status = !a.published
              ? { label: 'مسودّة', cls: 'bg-zinc-800 text-zinc-300' }
              : a.publishedAt > now
                ? { label: 'مجدول', cls: 'bg-sky-500/15 text-sky-300' }
                : { label: 'منشور', cls: 'bg-green-500/15 text-green-300' };
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="block truncate font-bold text-white hover:text-amber-400"
                  >
                    {a.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-zinc-500" dir="ltr">
                    /articles/{a.slug}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.cls}`}>
                  {status.label}
                </span>
                <time className="text-xs text-zinc-500" dateTime={toIsoDay(a.publishedAt)}>
                  {formatArticleDate(toIsoDay(a.publishedAt))}
                </time>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    aria-label="تعديل"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <a
                    href={`/articles/${a.slug}`}
                    target="_blank"
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    aria-label="معاينة"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
