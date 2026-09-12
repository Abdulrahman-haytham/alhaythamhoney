import type { Metadata } from 'next';
import { WishlistClient } from './WishlistClient';

export const metadata: Metadata = {
  title: 'المفضلة',
  description: 'المنتجات التي حفظتها من متجر الهيثم — نحل وعسل للعودة إليها لاحقاً.',
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6 bg-zinc-950">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-amiri font-bold text-white mb-4">
            المفضلة
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            منتجاتك المحفوظة، جاهزة متى قررت الطلب
          </p>
        </div>
        <WishlistClient />
      </div>
    </section>
  );
}
