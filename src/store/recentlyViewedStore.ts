'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number | null;
  at: number;
}

interface RecentState {
  items: RecentProduct[];
  push: (p: Omit<RecentProduct, 'at'>) => void;
}

const LIMIT = 8;

/** «شوهد مؤخراً» — على جهاز الزائر فقط، لا يصل إلى الخادم. */
export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      push: (p) =>
        set((s) => ({
          items: [{ ...p, at: Date.now() }, ...s.items.filter((i) => i.id !== p.id)].slice(
            0,
            LIMIT,
          ),
        })),
    }),
    { name: 'alhaytham-recent' },
  ),
);
