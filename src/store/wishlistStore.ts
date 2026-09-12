'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartProduct } from '@/store/cartStore';

interface WishlistState {
  items: CartProduct[];
  addItem: (product: CartProduct) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isWishlisted: (id: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) =>
        set((state) =>
          state.items.some((item) => item.id === product.id)
            ? state
            : { items: [...state.items, product] },
        ),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clearWishlist: () => set({ items: [] }),
      isWishlisted: (id) => get().items.some((item) => item.id === id),
    }),
    { name: 'alhaytham-wishlist' },
  ),
);
