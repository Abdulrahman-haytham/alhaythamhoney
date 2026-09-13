import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Story from '@/components/Story';
import Products from '@/components/Products';
import MixturesSection from '@/components/MixturesSection';
import { SpecialOffers } from '@/components/SpecialOffers';
import CustomerReviews from '@/components/CustomerReviews';
import WhyChooseUs from '@/components/WhyChooseUs';
import FAQ from '@/components/FAQ';
import { Location } from '@/components/Location';
import { getProducts } from '@/lib/products.server';
import { getMixtureCards } from '@/lib/mixtures.server';
import { getSettings } from '@/lib/settings.server';
import RecentlyViewed from '@/components/RecentlyViewed';
import type { Metadata } from 'next';

export const metadata: Metadata = { alternates: { canonical: '/' } };

// Query at request time: production builds do not need a live database.
export const dynamic = 'force-dynamic';

/**
 * ترتيب الأقسام مبنيّ على قمع الشراء لا على السرد:
 * خطاف ← ثقة ← بضاعة ← عرض ← دليل اجتماعي ← تمايز ← خدمة ← حكاية ← اعتراضات ← ختام.
 * الحكاية أُخّرت لأن الزائر على الجوال يريد رؤية ما يُباع قبل تاريخ العلامة.
 */
export default async function HomePage() {
  const [products, mixtures] = await Promise.all([getProducts(), getMixtureCards(), getSettings()]);

  return (
    <>
      <Hero />
      <Stats />
      <Products products={products} mobileCarousel />
      <MixturesSection mixtures={mixtures} mobileCarousel />
      <RecentlyViewed />
      <SpecialOffers />
      <CustomerReviews />
      <WhyChooseUs />
      <Story />
      <FAQ limit={3} />
      <Location />
    </>
  );
}
