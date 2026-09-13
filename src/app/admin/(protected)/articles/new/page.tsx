import { db } from '@/lib/db';
import { ArticleEditor } from '../ArticleEditor';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const products = await db.product.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  });
  return (
    <>
      <h1 className="mb-6 font-amiri text-3xl font-bold">مقال جديد</h1>
      <ArticleEditor products={products} />
    </>
  );
}
