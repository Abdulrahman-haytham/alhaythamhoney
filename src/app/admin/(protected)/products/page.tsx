import { getAdminProducts, getAttributeOptions } from '@/lib/products.admin';
import { ProductsPanel } from './ProductsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [products, attributes] = await Promise.all([getAdminProducts(), getAttributeOptions()]);
  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">المنتجات</h1>
      <p className="mb-6 text-sm text-zinc-400">
        راجع الأسعار والمحتوى قبل النشر. يمكنك إخفاء المنتج دون حذفه أو تغيير رابطه. تُرفع الصور من
        الاستديو ثم يُنسخ رابطها هنا. لا يتتبّع الموقع أرصدة المنتجات؛ استقبال الطلبات خيار يدوي،
        والتوفر وموعد التسليم يؤكدان عبر واتساب. الأحجام (المتغيّرات) اختيارية: إن أضفتها صار السعر
        الأساسي «يبدأ من» ويختار الزبون الحجم في صفحة المنتج.
      </p>
      <ProductsPanel
        attributes={attributes}
        products={products.map(
          ({
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            related,
            variants,
            tiers,
            bundleItems,
            attributes: attrs,
            stockQty: _legacyStock,
            ...p
          }) => ({
            ...p,
            relatedIds: related.map((r) => r.relatedId),
            bundleItems,
            attributeValueIds: attrs.map((a) => a.id),
            variants: variants.map((v) => ({
              id: v.id,
              label: v.label,
              price: v.price,
              inStock: v.inStock,
              isDefault: v.isDefault,
            })),
            tiers: tiers.map((t) => ({ minQty: t.minQty, discountPercent: t.discountPercent })),
          }),
        )}
      />
    </>
  );
}
