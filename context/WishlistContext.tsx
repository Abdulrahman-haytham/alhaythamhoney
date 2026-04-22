/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useReducer, ReactNode, useCallback, useEffect, useMemo } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  image?: string;
  benefit?: string;
  addedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  isOpen: boolean;
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: { id: string; name: string; image?: string; benefit?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'TOGGLE_WISHLIST' }
  | { type: 'OPEN_WISHLIST' }
  | { type: 'CLOSE_WISHLIST' }
  | { type: 'LOAD_FROM_STORAGE'; payload: WishlistItem[] };

const WISHLIST_STORAGE_KEY = 'alhaytham-wishlist';

function getStoredWishlist(): WishlistItem[] {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: WishlistItem[]) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silently fail if storage is full
  }
}

const initialState: WishlistState = {
  items: getStoredWishlist(),
  isOpen: false,
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (exists) return state;
      return {
        ...state,
        items: [...state.items, { ...action.payload, addedAt: Date.now() }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case 'TOGGLE_WISHLIST':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_WISHLIST':
      return { ...state, isOpen: true };
    case 'CLOSE_WISHLIST':
      return { ...state, isOpen: false };
    case 'LOAD_FROM_STORAGE':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

export const WishlistContext = createContext<{
  state: WishlistState;
  addItem: (item: { id: string; name: string; image?: string; benefit?: string }) => void;
  removeItem: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (item: { id: string; name: string; image?: string; benefit?: string }) => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleOpen: () => void;
  totalItems: number;
} | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    saveToStorage(state.items);
  }, [state.items]);

  const addItem = useCallback((item: { id: string; name: string; image?: string; benefit?: string }) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const isWishlisted = useCallback(
    (id: string) => state.items.some((item) => item.id === id),
    [state.items]
  );

  const toggleWishlist = useCallback(
    (item: { id: string; name: string; image?: string; benefit?: string }) => {
      if (isWishlisted(item.id)) {
        removeItem(item.id);
      } else {
        addItem(item);
      }
    },
    [isWishlisted, addItem, removeItem]
  );

  const openWishlist = useCallback(() => {
    dispatch({ type: 'OPEN_WISHLIST' });
  }, []);

  const closeWishlist = useCallback(() => {
    dispatch({ type: 'CLOSE_WISHLIST' });
  }, []);

  const toggleOpen = useCallback(() => {
    dispatch({ type: 'TOGGLE_WISHLIST' });
  }, []);

  const totalItems = state.items.length;

  const contextValue = useMemo(
    () => ({ state, addItem, removeItem, isWishlisted, toggleWishlist, openWishlist, closeWishlist, toggleOpen, totalItems }),
    [state, addItem, removeItem, isWishlisted, toggleWishlist, openWishlist, closeWishlist, toggleOpen, totalItems]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}
