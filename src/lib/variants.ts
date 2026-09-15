/**
 * متغيّرات المنتج (أحجام/أوزان) — منطق مشترك بين المتصفح والخادم.
 * معرّف البند في السلة لمتغيّر: `<productId>@<variantId>`؛ للمنتج بلا متغيّرات: `<productId>`.
 */
export interface VariantLite {
  id: string;
  label: string;
  price: number;
  stockQty: number | null;
  inStock: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export const VARIANT_SEPARATOR = '@';

export function variantCartId(productId: string, variantId: string) {
  return `${productId}${VARIANT_SEPARATOR}${variantId}`;
}

export function parseCartId(cartId: string): { productId: string; variantId: string | null } {
  const idx = cartId.indexOf(VARIANT_SEPARATOR);
  return idx === -1
    ? { productId: cartId, variantId: null }
    : { productId: cartId.slice(0, idx), variantId: cartId.slice(idx + 1) };
}

export const variantAvailable = (v: { inStock: boolean; stockQty: number | null }) =>
  v.inStock && v.stockQty !== 0;

/** المتغيّر الافتراضي: ما حدده الأدمن، وإلا أول متغيّر متاح، وإلا الأول. */
export function defaultVariant<T extends VariantLite>(variants: T[]): T | null {
  if (variants.length === 0) return null;
  const sorted = [...variants].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    sorted.find((v) => v.isDefault && variantAvailable(v)) ??
    sorted.find((v) => variantAvailable(v)) ??
    sorted[0]
  );
}

/** «يبدأ من»: أقل سعر بين المتغيّرات المتاحة، وإلا سعر المنتج الأساسي. */
export function priceFrom(product: { price: number | null; variants?: VariantLite[] }) {
  const available = (product.variants ?? []).filter(variantAvailable);
  if (available.length === 0) return { price: product.price, from: false };
  const prices = available.map((v) => v.price);
  return { price: Math.min(...prices), from: new Set(prices).size > 1 };
}

/** المنتج متاح إن كان متاحاً بذاته وله متغيّر متاح واحد على الأقل (إن وُجدت متغيّرات). */
export function productAvailable(product: {
  inStock: boolean;
  stockQty?: number | null;
  variants?: VariantLite[];
}) {
  if (!product.inStock || product.stockQty === 0) return false;
  return !product.variants?.length || product.variants.some(variantAvailable);
}
