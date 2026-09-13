'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartProduct {
  id: string;
  slug?: string;
  name: string;
  desc?: string | null;
  image: string;
  price?: number | null;
  weight?: string | null;
  badge?: string | null;
  benefit?: string | null;
  /** وصف الوصفة للخلطات المخصّصة — يصل حرفياً إلى الطلب ورسالة واتساب */
  recipe?: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

/** آخر إضافة — يقرؤها CartToast لإظهار تأكيد «أُضيف للسلة» دون لمس مواضع الاستدعاء. */
export interface LastAdded {
  item: CartItem;
  at: number;
}

interface CartState {
  items: CartItem[];
  /** آخر تعديل على السلة (ms) — أساس تذكير «سلتك بانتظارك» */
  updatedAt: number | null;
  /** كوبون كتبه الزبون؛ يُتحقق منه عند كل عرض للسلة */
  couponCode: string | null;
  lastAdded: LastAdded | null;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string | null) => void;
  dismissLastAdded: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      updatedAt: null,
      couponCode: null,
      lastAdded: null,
      addItem: (product, quantity = 1) =>
        set((state) => {
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return state;
          const existing = state.items.find((item) => item.id === product.id);
          const items = existing
            ? state.items.map((item) =>
                item.id === product.id
                  ? { ...item, ...product, quantity: Math.min(999, item.quantity + quantity) }
                  : item,
              )
            : [...state.items, { ...product, quantity }];
          const item = items.find((i) => i.id === product.id)!;
          return { items, updatedAt: Date.now(), lastAdded: { item, at: Date.now() } };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          updatedAt: Date.now(),
        })),
      updateQuantity: (id, quantity) =>
        set((state) =>
          !Number.isInteger(quantity) || quantity > 999
            ? state
            : {
                updatedAt: Date.now(),
                items:
                  quantity <= 0
                    ? state.items.filter((item) => item.id !== id)
                    : state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
              },
        ),
      clearCart: () => set({ items: [], updatedAt: Date.now(), couponCode: null }),
      setCoupon: (couponCode) => set({ couponCode }),
      dismissLastAdded: () => set({ lastAdded: null }),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    }),
    {
      name: 'alhaytham-cart',
      // lastAdded حالة عابرة للواجهة — لا تُحفظ حتى لا يظهر التوست عند إعادة الفتح
      partialize: (s) => ({ items: s.items, updatedAt: s.updatedAt, couponCode: s.couponCode }),
    },
  ),
);
