import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { toIsoDay } from '@/lib/articles';
import { ArticleEditor } from '../ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <>
      <h1 className="mb-6 font-amiri text-3xl font-bold">تعديل المقال</h1>
      <ArticleEditor
        article={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          description: article.description,
          keywords: article.keywords,
          image: article.image,
          body: article.body,
          published: article.published,
          publishedAt: toIsoDay(article.publishedAt),
        }}
      />
    </>
  );
}
