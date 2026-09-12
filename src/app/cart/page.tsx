import type { Metadata } from 'next';
import { ShoppingCart } from 'lucide-react';
import { CartClient } from './CartClient';

export const metadata: Metadata = {
  title: 'سلة الطلبات',
  description: 'راجع طلبك وأرسله عبر واتساب — الدفع عند الاستلام والشحن لكل المحافظات السورية.',
  robots: { index: false },
};

export default function CartPage() {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-16 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3 sm:mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
            <ShoppingCart className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-amiri text-3xl font-bold text-white sm:text-4xl">سلة الطلبات</h1>
        </div>
        <CartClient />
      </div>
    </section>
  );
}
