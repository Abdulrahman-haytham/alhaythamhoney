import { it, expect, beforeEach, vi } from 'vitest';

const memory = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => memory.set(k, v),
  removeItem: (k: string) => memory.delete(k),
});
vi.stubGlobal('window', { localStorage });
const { useCart } = await import('@/store/cartStore');
const { useWishlist } = await import('@/store/wishlistStore');
beforeEach(() => {
  useCart.getState().clearCart();
  useWishlist.getState().clearWishlist();
});
const product = {
  id: 'p',
  slug: 'black-seed-honey',
  name: 'عسل',
  image: '/honey.webp',
  price: 1000,
};

it('adds, merges, reprices and removes cart items', () => {
  useCart.getState().addItem(product, 2);
  useCart.getState().addItem({ ...product, price: 2000 });
  expect(useCart.getState().getTotalItems()).toBe(3);
  expect(useCart.getState().getTotalPrice()).toBe(6000);
  useCart.getState().updateQuantity('p', 0);
  expect(useCart.getState().items).toEqual([]);
});
it('rejects invalid quantities', () => {
  for (const q of [-1, NaN, Infinity, 0.5, 1000]) useCart.getState().addItem(product, q);
  expect(useCart.getState().items).toEqual([]);
});
it('retains product slugs and deduplicates the wishlist', () => {
  useWishlist.getState().addItem(product);
  useWishlist.getState().addItem(product);
  expect(useWishlist.getState().items).toHaveLength(1);
  expect(useWishlist.getState().items[0].slug).toBe('black-seed-honey');
});
