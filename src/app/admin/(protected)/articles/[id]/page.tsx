import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { toIsoDay } from '@/lib/articles';
import { ArticleEditor } from '../ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, products, revisions] = await Promise.all([
    db.article.findUnique({ where: { id }, include: { products: { select: { id: true } } } }),
    db.product.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
    db.articleRevision.findMany({
      where: { articleId: id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, createdAt: true, body: true },
    }),
  ]);
  if (!article) notFound();

  return (
    <>
      <h1 className="mb-6 font-amiri text-3xl font-bold">تعديل المقال</h1>
      <ArticleEditor
        products={products}
        revisions={revisions.map((r) => ({
          id: r.id,
          title: r.title,
          createdAt: r.createdAt.toISOString(),
          size: Buffer.byteLength(r.body),
        }))}
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
          productIds: article.products.map((p) => p.id),
        }}
      />
    </>
  );
}
