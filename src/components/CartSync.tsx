'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/store/cartStore';
import { useCustomer } from '@/components/CustomerProvider';
import { useHydrated } from '@/lib/useHydrated';

/** يرفع نسخة من سلة الزبون المسجّل إلى حسابه (مؤجَّلاً) — لبريد السلة المتروكة */
export default function CartSync() {
  const customer = useCustomer();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const last = useRef<string>('');
  useEffect(() => {
    if (!customer || !hydrated) return;
    const payload = JSON.stringify({
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price ?? null,
        image: i.image ?? null,
      })),
    });
    if (payload === last.current) return;
    const timer = setTimeout(() => {
      last.current = payload;
      void fetch('/api/account/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => null);
    }, 1500);
    return () => clearTimeout(timer);
  }, [customer, hydrated, items]);
  return null;
}
