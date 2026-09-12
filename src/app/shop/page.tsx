import type { Metadata } from 'next';
import { ShoppingCart } from 'lucide-react';
import { getProducts } from '@/lib/products.server';
import Products from '@/components/Products';

// Query at request time: production builds do not need a live database.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'المتجر',
  description:
    'تسوق أفضل أنواع العسل الطبيعي والمكملات الحيوية من الهيثم — نحل وعسل — منتجات طبيعية 100% من قلب حماة.',
  alternates: { canonical: '/shop' },
};

export default async function ShopPage() {
  const products = await getProducts();

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

      <Products products={products} />
    </div>
  );
}
