import { SlidersHorizontal } from 'lucide-react';

/**
 * هيكل شريط الفرز بالأصناف نفسها التي يستخدمها `ShopBrowser`.
 * يُعرض ريثما يجهز الشريط التفاعلي (الذي يقرأ عنوان الصفحة في المتصفح)، فيحجز
 * ارتفاعه بالضبط ولا تقفز المنتجات تحته — القفز يُحتسب في Core Web Vitals كـ CLS.
 */
export function ShopFilterSkeleton({ count }: { count: number }) {
  return (
    <div className="container mx-auto mt-6 px-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
        <span className="flex items-center gap-1.5 text-sm font-bold text-zinc-300">
          <SlidersHorizontal className="h-4 w-4 text-amber-500" />
          الفرز
        </span>
        <span className="h-9 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-xs leading-9 text-zinc-500">
          الترتيب المقترح
        </span>
        <span className="mr-auto text-xs text-zinc-500">
          {count} من {count} منتجاً
        </span>
      </div>
    </div>
  );
}
