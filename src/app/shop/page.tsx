import type { Metadata } from 'next';
import { ShoppingCart } from 'lucide-react';
import { Suspense } from 'react';
import { getProducts, getFilterAttributes } from '@/lib/products.server';
import Products from '@/components/Products';
import ShopBrowser from '@/components/ShopBrowser';
import { ShopFilterSkeleton } from '@/components/ShopFilterSkeleton';

// Query at request time: production builds do not need a live database.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'المتجر',
  description:
    'تسوق أفضل أنواع العسل الطبيعي والمكملات الحيوية من الهيثم — نحل وعسل — منتجات طبيعية 100% من قلب حماة.',
  alternates: { canonical: '/shop' },
};

export default async function ShopPage() {
  const [products, attributes] = await Promise.all([getProducts(), getFilterAttributes()]);

  return (
    <div className="pt-24 pb-16 bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Our Store
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-amiri font-bold text-white mb-6">المتجر</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            اخترنا لك أجود أنواع العسل ومنتجات النحل من الطبيعة السورية مباشرة إليك
          </p>
        </div>
      </div>

      {/* الفلاتر تقرأ عنوان الصفحة في المتصفح؛ الخادم يقدّم القائمة كاملة كبديل فوري */}
      <Suspense
        fallback={
          <>
            <ShopFilterSkeleton count={products.length} />
            <Products products={products} />
          </>
        }
      >
        <ShopBrowser products={products} attributes={attributes} />
      </Suspense>
    </div>
  );
}
