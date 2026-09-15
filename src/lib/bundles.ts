/**
 * الباقات (Odoo kits): منتج فئته BUNDLE يتكوّن من منتجات أخرى بكميات.
 * توفر الباقة = توفر كل مكوّناتها؛ و«توفّر X» = مجموع أسعار المكوّنات − سعر الباقة.
 */
import { isAvailable } from '@/lib/settings';
import { priceFrom, productAvailable, type VariantLite } from '@/lib/variants';

export interface BundleComponentLite {
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
    price: number | null;
    inStock: boolean;
    stockQty: number | null;
    published: boolean;
    variants?: VariantLite[];
  };
}

export function componentAvailable(c: BundleComponentLite) {
  return c.product.published && isAvailable(c.product) && productAvailable(c.product);
}

export function bundleAvailable(items: BundleComponentLite[]) {
  return items.length > 0 && items.every(componentAvailable);
}

/** مجموع أسعار المكوّنات لو اشتُريت منفصلة (بأقل سعر لكل مكوّن) — null إن كان أحدها بلا سعر */
export function bundleComponentsValue(items: BundleComponentLite[]): number | null {
  let total = 0;
  for (const c of items) {
    const price = priceFrom(c.product).price;
    if (price == null) return null;
    total += price * c.quantity;
  }
  return total;
}

/** توفر منتج في الكتالوج بكل قواعده: التوفر الأساسي، المتغيّرات، ومكوّنات الباقة */
export function catalogAvailable(product: {
  category: string;
  inStock: boolean;
  stockQty?: number | null;
  variants?: VariantLite[];
  bundleItems?: BundleComponentLite[];
}) {
  if (!isAvailable(product) || !productAvailable(product)) return false;
  if (product.category === 'BUNDLE') return bundleAvailable(product.bundleItems ?? []);
  return true;
}

export const CATEGORY_LABELS: Record<string, string> = {
  HONEY: 'عسل',
  SUPPLEMENT: 'منتجات الخلية',
  BUNDLE: 'باقات',
};
