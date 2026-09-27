'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CartProduct } from '@/store/cartStore';
import { usePageBuy } from '@/store/pageActionStore';

/**
 * زر شراء لاصق للجوال: حين يغيب زر «أضف إلى السلة» الأصلي عن الشاشة يظهر
 * بديله داخل الشريط السفلي نفسه (BottomNav) — كان شريطاً ثانياً فوقه يأكل
 * سدس الشاشة ويكرّر زر واتساب. `anchorId` هو عنصر زر الشراء الأصلي الذي نراقب اختفاءه.
 */
export default function StickyBuyBar({
  product,
  available,
  anchorId,
}: {
  product: CartProduct;
  available: boolean;
  anchorId: string;
}) {
  const [show, setShow] = useState(false);
  const seen = useRef(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // لا نُظهر الزر قبل أن يمرّ الزائر على الأصلي مرة (يمنع الوميض عند التحميل)
        if (entry.isIntersecting) seen.current = true;
        setShow(seen.current && !entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, [anchorId]);

  const canOrder = available && product.price != null;
  const buy = useMemo(() => (canOrder ? { product, show } : null), [canOrder, product, show]);
  usePageBuy(buy);
  return null;
}
