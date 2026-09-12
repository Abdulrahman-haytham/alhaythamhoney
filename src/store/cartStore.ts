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

interface CartState {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return state;
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, ...product, quantity: Math.min(999, item.quantity + quantity) }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity }] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) =>
          !Number.isInteger(quantity) || quantity > 999
            ? state
            : {
                items:
                  quantity <= 0
                    ? state.items.filter((item) => item.id !== id)
                    : state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
              },
        ),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    }),
    { name: 'alhaytham-cart' },
  ),
);
