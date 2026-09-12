import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  MessageCircle,
} from 'lucide-react';
import {
  getAllArticles,
  getArticleBySlug,
  formatArticleDate,
  formatReadingTime,
} from '@/lib/articles';
import { SITE, getWhatsAppLink } from '@/lib/config';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllArticles().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: `${article.title} | ${SITE.name}`,
      description: article.description,
      url: `${SITE.url}/articles/${article.slug}`,
      type: 'article',
      publishedTime: `${article.publishedAt}T00:00:00Z`,
      authors: [SITE.name],
      tags: article.keywords,
      ...(article.image ? { images: [{ url: article.image, alt: article.title }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  const articleUrl = `${SITE.url}/articles/${article.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    keywords: article.keywords.join(', '),
    datePublished: `${article.publishedAt}T00:00:00Z`,
    inLanguage: 'ar',
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    ...(article.image ? { image: [article.image] } : {}),
  };

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="container mx-auto max-w-4xl">
        <Link
          href="/articles"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-amber-400"
        >
          <ArrowRight className="h-4 w-4" />
          كل المقالات
        </Link>

        <header className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
            <span className="text-xs font-bold tracking-wide text-amber-500">مدونة الهيثم</span>
          </div>
          <h1 className="mb-5 font-amiri text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {article.title}
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-zinc-400">{article.description}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-800 pt-5 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-500/70" />
              <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500/70" />
              {formatReadingTime(article.readingMinutes)}
            </span>
          </div>

          {article.image && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-900/40">
              {}
              <img
                src={article.image}
                alt={article.title}
                loading="lazy"
                className="max-h-[420px] w-full object-cover"
              />
            </div>
          )}
        </header>

        {/* المحتوى ملفات HTML موثوقة من داخل المستودع (content/articles). */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: article.html }} />

        <div className="mt-16 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-8 text-center sm:p-12">
          <h2 className="mb-4 font-amiri text-2xl font-bold text-white sm:text-3xl">
            جاهز لتجربة عسلنا الطبيعي؟
          </h2>
          <p className="mb-8 text-lg text-zinc-400">
            اطلب الآن واحصل على عسل طبيعي 100% مفحوص مخبرياً
          </p>
          <a
            href={getWhatsAppLink(
              `مرحباً عسل الهيثم، قرأت مقال «${article.title}» في الموقع وأود الاستفسار عن منتجاتكم.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl gold-gradient px-8 py-4 font-black text-zinc-950 luxury-shadow transition-transform hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            اطلب الآن عبر واتساب
          </a>
        </div>

        {related.length > 0 && (
          <aside className="mt-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-amiri text-2xl font-bold text-white">مقالات أخرى</h2>
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 transition-colors hover:text-amber-400"
              >
                كل المقالات
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/articles/${item.slug}`}
                  className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-amber-500/40"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                    <FileText className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 font-amiri text-lg font-bold leading-snug text-white transition-colors group-hover:text-amber-400">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                    {item.description}
                  </p>
                  <time dateTime={item.publishedAt} className="mt-auto pt-4 text-xs text-zinc-600">
                    {formatArticleDate(item.publishedAt)}
                  </time>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
