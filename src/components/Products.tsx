import type { Product } from '@prisma/client';
import { Droplets, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

/**
 * تجميع اختياري حسب فئة المنتج — يعيد إحساس المجموعات في النسخة القديمة
 * (data/products.tsx) لكن مبنيّاً على حقل `category` من قاعدة البيانات
 * بدل مصفوفة ثابتة.
 */
const CATEGORY_META: Record<
  Product['category'],
  { title: string; subtitle: string; icon: React.ReactNode }
> = {
  HONEY: {
    title: 'كنوز النحل – عسل صافي من مراعي مختارة',
    subtitle: 'نبدأ بما هو مألوف لنصل إلى أعماق النقاء',
    icon: <Droplets className="w-6 h-6 text-amber-500" />,
  },
  SUPPLEMENT: {
    title: 'المكملات الحيوية – رفع القيمة',
    subtitle: 'منتجات طبيعية تُستخدم منذ قرون لدعم الجسد بذكاء',
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
  },
};

const CATEGORY_ORDER: Product['category'][] = ['HONEY', 'SUPPLEMENT'];

/**
 * `mobileCarousel`: على الجوال تُعرض بطاقتان جنباً إلى جنب وتُمرَّر البقية أفقياً.
 * تُفعَّل في الصفحة الرئيسية فقط — صفحة المتجر تبقى شبكة كاملة لأن الزائر جاء ليتصفّح كل شيء.
 */
export default function Products({
  products,
  mobileCarousel = false,
}: {
  products: Product[];
  mobileCarousel?: boolean;
}) {
  if (products.length === 0) {
    return (
      <section id="products" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-zinc-950">
        <div className="container mx-auto text-center text-zinc-500">
          لا توجد منتجات متاحة حالياً — تابعونا قريباً.
        </div>
      </section>
    );
  }

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    meta: CATEGORY_META[category],
    items: products.filter((p) => p.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <section id="products" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-zinc-950">
      <div className="container mx-auto">
        {groups.map((group) => (
          <div key={group.category} className="mb-16 sm:mb-24 md:mb-32 last:mb-0">
            <div className="mb-8 sm:mb-12 md:mb-16">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="p-2 sm:p-2.5 md:p-3 bg-amber-500/10 rounded-lg sm:rounded-xl border border-amber-500/20">
                  {group.meta.icon}
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-amiri font-black text-white leading-tight">
                  {group.meta.title}
                </h3>
              </div>
              <div className="w-12 h-1 bg-amber-500/70 rounded-full mb-4 sm:mb-5" />
              <p className="text-zinc-400 text-sm sm:text-base max-w-2xl border-r-2 border-amber-500/20 pr-3 sm:pr-4">
                {group.meta.subtitle}
              </p>
            </div>

            <div
              className={
                mobileCarousel
                  ? // الجوال: بطاقتان ظاهرتان في صف واحد + لمحة من الثالثة تدل على إمكانية السحب
                    '-mx-4 grid snap-x snap-mandatory auto-cols-[46%] grid-flow-col grid-rows-1 gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:snap-none sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 md:gap-10 lg:grid-cols-3'
                  : 'grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-8 md:gap-10 lg:grid-cols-3'
              }
            >
              {group.items.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
