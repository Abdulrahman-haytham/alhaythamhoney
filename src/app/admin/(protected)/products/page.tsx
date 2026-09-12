import { db } from '@/lib/db';
import { ProductsPanel } from './ProductsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await db.product.findMany({ orderBy: { sortOrder: 'asc' } });
  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">المنتجات</h1>
      <p className="mb-6 text-sm text-zinc-400">
        راجع الأسعار والمحتوى قبل النشر. يمكنك إخفاء المنتج دون حذفه أو تغيير رابطه. تُرفع الصور من
        الاستديو ثم يُنسخ رابطها هنا.
      </p>
      <ProductsPanel
        products={products.map(({ createdAt: _createdAt, updatedAt: _updatedAt, ...p }) => p)}
      />
    </>
  );
}
