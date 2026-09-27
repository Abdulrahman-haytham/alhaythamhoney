'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import type { CartProduct } from '@/store/cartStore';

/**
 * ما تقوله الصفحة الحالية للشريط السفلي ولأزرار واتساب العامة (الرأس والتذييل).
 * كل خانة تحمل مالكها: مغادرة صفحة لا تمسح ما سجّلته الصفحة التالية.
 */
type Slot<T> = { owner: number; value: T } | null;

export interface BuySlot {
  product: CartProduct;
  /** الزر الأصلي في الصفحة خارج الشاشة الآن */
  show: boolean;
}
export interface ActionSlot {
  label: string;
  run: () => void;
  busy?: boolean;
}

interface PageActionState {
  message: Slot<string>;
  buy: Slot<BuySlot>;
  action: Slot<ActionSlot>;
}

export const usePageActions = create<PageActionState>()(() => ({
  message: null,
  buy: null,
  action: null,
}));

let nextOwner = 1;

function useSlot<K extends keyof PageActionState>(
  key: K,
  value: NonNullable<PageActionState[K]>['value'] | null,
) {
  useEffect(() => {
    if (value == null) return;
    const owner = nextOwner++;
    usePageActions.setState({ [key]: { owner, value } } as Partial<PageActionState>);
    return () => {
      if (usePageActions.getState()[key]?.owner === owner)
        usePageActions.setState({ [key]: null } as Partial<PageActionState>);
    };
  }, [key, value]);
}

/** رسالة واتساب هذه الصفحة (منتج، خلطة…) */
export const usePageWhatsAppMessage = (message: string | null) => useSlot('message', message);
/** منتج صفحة المنتج — يظهر زر «أضف إلى السلة» في الشريط السفلي حين يغيب الزر الأصلي */
export const usePageBuy = (buy: BuySlot | null) => useSlot('buy', buy);
/** يستبدل زر واتساب في الشريط السفلي بإجراء الصفحة (إتمام الطلب في السلة) */
export const usePagePrimaryAction = (action: ActionSlot | null) => useSlot('action', action);
