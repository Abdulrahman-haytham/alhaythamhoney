'use client';

import { useState } from 'react';
import { MessageCircle, Layers, BadgePercent, Gift } from 'lucide-react';
import type { CartProduct } from '@/store/cartStore';
import { getWhatsAppLink } from '@/lib/config';
import { lowStockLabel } from '@/lib/settings';
import { useSettings } from '@/components/SettingsProvider';
import { trackWhatsAppClick } from '@/lib/analytics';
import { defaultVariant, variantAvailable, variantCartId, type VariantLite } from '@/lib/variants';
import { bestTier, fmtSyp, type PriceTierRule } from '@/lib/pricing';
import AddToCartButton from './AddToCartButton';
import StickyBuyBar from './StickyBuyBar';

/**
 * صندوق الشراء (Odoo variants): اختيار الحجم يبدّل السعر والتوفر وشارة «بقي X»
 * وما يُضاف إلى السلة، مع جدول خصم الكمية والعروض السارية على المنتج.
 */
export default function BuyBox({
  product,
  variants,
  tiers,
  promotionLabels,
  available,
  stockQty,
}: {
  product: CartProduct & { productId: string };
  stockQty: number | null;
  variants: VariantLite[];
  tiers: PriceTierRule[];
  promotionLabels: string[];
  /** توفر المنتج ككل (inStock + الكمية) بلا اعتبار المتغيّرات */
  available: boolean;
}) {
  const { lowStockThreshold, tieredPricingEnabled } = useSettings();
  const [variantId, setVariantId] = useState(() => defaultVariant(variants)?.id ?? null);
  const variant = variants.find((v) => v.id === variantId) ?? null;

  const price = variant ? variant.price : product.price;
  const canOrder = available && (variant ? variantAvailable(variant) : true);
  const lowStock = lowStockLabel(variant ? variant.stockQty : stockQty, lowStockThreshold);
  const cartProduct: CartProduct = {
    ...product,
    id: variant ? variantCartId(product.productId, variant.id) : product.productId,
    variantId: variant?.id,
    price,
    weight: variant ? variant.label : product.weight,
  };
  const visibleTiers = tieredPricingEnabled ? tiers : [];
  const sampleTier = bestTier(visibleTiers, 999);

  return (
    <>
      {price != null && (
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold gold-text tabular-nums">{fmtSyp(price)}</span>
          <span className="text-zinc-500">ل.س</span>
          {cartProduct.weight && (
            <span className="text-zinc-500 border-r border-zinc-700 pr-3">
              {cartProduct.weight}
            </span>
          )}
        </div>
      )}

      {variants.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-zinc-300">
            <Layers className="h-4 w-4 text-amber-500" /> اختر الحجم
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="الحجم">
            {variants.map((v) => {
              const on = v.id === variantId;
              const ok = variantAvailable(v);
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-xl border px-4 py-2 text-sm transition ${
                    on
                      ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                      : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  } ${ok ? '' : 'opacity-50 line-through'}`}
                >
                  <span className="font-bold">{v.label}</span>
                  <span className="mr-2 text-xs text-zinc-400 tabular-nums">{fmtSyp(v.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {lowStock && canOrder && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-bold text-red-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          {lowStock} — اطلبه قبل أن ينفد
        </p>
      )}

      {(visibleTiers.length > 0 || promotionLabels.length > 0) && (
        <div className="space-y-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-sm">
          {visibleTiers.length > 0 && price != null && (
            <div>
              <p className="mb-1 flex items-center gap-1.5 font-bold text-green-300">
                <BadgePercent className="h-4 w-4" /> وفّر أكثر مع الكمية
              </p>
              <ul className="flex flex-wrap gap-2 text-xs text-zinc-300">
                {visibleTiers.map((t) => (
                  <li
                    key={t.minQty}
                    className="rounded-lg border border-green-500/20 bg-zinc-950/40 px-2.5 py-1"
                  >
                    {t.minQty}+ قطع:{' '}
                    <b className="tabular-nums text-green-300">
                      {fmtSyp(Math.floor((price * (100 - t.discountPercent)) / 100))}
                    </b>{' '}
                    للقطعة
                  </li>
                ))}
              </ul>
              {sampleTier && (
                <p className="mt-1 text-[11px] text-zinc-500">
                  الخصم يُطبَّق تلقائياً في السلة — حتى {sampleTier.discountPercent}%.
                </p>
              )}
            </div>
          )}
          {promotionLabels.map((l) => (
            <p key={l} className="flex items-center gap-1.5 font-bold text-amber-300">
              <Gift className="h-4 w-4" /> {l}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-3" id="buy-box">
        <AddToCartButton available={canOrder} product={cartProduct} />
        <a
          href={getWhatsAppLink(
            `مرحباً عسل الهيثم، أود الاستفسار عن المنتج المعروض في الموقع: ${product.name}${cartProduct.weight ? ` (${cartProduct.weight})` : ''}`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('product-page')}
          className="w-full flex items-center justify-center gap-2 border border-amber-500/30 text-amber-400 py-3.5 rounded-xl font-bold hover:bg-amber-500/10 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span>اطلب الآن عبر واتساب</span>
        </a>
      </div>
      <StickyBuyBar product={cartProduct} available={canOrder} anchorId="buy-box" />
    </>
  );
}
