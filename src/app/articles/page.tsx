import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Clock, FileText, MessageCircle } from 'lucide-react';
import { getAllArticles, formatArticleDate, formatReadingTime } from '@/lib/articles';
import { SITE, getWhatsAppLink } from '@/lib/config';
import { getSettings } from '@/lib/settings.server';

// الاستعلام وقت الطلب: بناء الإنتاج لا يحتاج قاعدة بيانات حيّة.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'المدونة',
  description:
    'مدونة الهيثم: أدلة موثوقة عن العسل الطبيعي ومنتجات النحل — فوائده، كيف تميّز الأصلي من المغشوش، وأفضل أنواع العسل في سوريا.',
  alternates: { canonical: '/articles' },
  openGraph: {
    title: `المدونة | ${SITE.name}`,
    description: 'أدلة وحقائق موثوقة عن العسل الطبيعي ومملكة النحل من أهل الخبرة.',
    url: `${SITE.url}/articles`,
    type: 'website',
  },
};

export default async function ArticlesPage() {
  const [articles] = await Promise.all([getAllArticles(), getSettings()]);

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-16 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <BookOpen className="h-7 w-7 text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="mb-4 font-amiri text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            مدونة الهيثم
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            اقرأ، تعلّم، وارتقِ بثقافتك حول العسل الطبيعي ومملكة النحل — فوائد، حقائق، وأدلة موثوقة
            من أهل الخبرة.
          </p>
        </div>

        {articles.length === 0 && (
          <p className="mb-16 text-center text-zinc-500">لا مقالات منشورة بعد — عُد قريباً.</p>
        )}

        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition-all duration-500 hover:border-amber-500/40 luxury-shadow"
            >
              <Link
                href={`/articles/${article.slug}`}
                className="relative block h-44 w-full overflow-hidden sm:h-48"
                aria-label={article.title}
              >
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950">
                    <FileText
                      className="h-14 w-14 text-amber-500/60 transition-transform duration-700 group-hover:scale-110"
                      strokeWidth={1.25}
                    />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
              </Link>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-500/70" />
                    <time dateTime={article.publishedAt}>
                      {formatArticleDate(article.publishedAt)}
                    </time>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500/70" />
                    {formatReadingTime(article.readingMinutes)}
                  </span>
                </div>

                <h2 className="mb-3 font-amiri text-xl font-bold leading-snug text-white transition-colors group-hover:text-amber-400">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className="mb-6 line-clamp-3 leading-relaxed text-zinc-400">
                  {article.description}
                </p>

                <Link
                  href={`/articles/${article.slug}`}
                  className="mt-auto inline-flex items-center gap-2 font-bold text-amber-500 transition-colors hover:text-amber-400"
                >
                  اقرأ المزيد
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-8 text-center sm:p-12">
          <h2 className="mb-4 font-amiri text-2xl font-bold text-white sm:text-3xl">
            جاهز لتجربة عسلنا الطبيعي؟
          </h2>
          <p className="mb-8 text-lg text-zinc-400">
            اطلب الآن واحصل على عسل طبيعي 100% مفحوص مخبرياً
          </p>
          <a
            href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl gold-gradient px-8 py-4 font-black text-zinc-950 luxury-shadow transition-transform hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            اطلب الآن عبر واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
