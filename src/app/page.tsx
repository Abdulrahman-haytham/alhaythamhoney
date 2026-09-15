import Hero from '@/components/Hero';
import Since1997 from '@/components/Since1997';
import Story from '@/components/Story';
import Products from '@/components/Products';
import HoneyShowcase from '@/components/HoneyShowcase';
import FinalCta from '@/components/FinalCta';
import { SectionDivider } from '@/components/motion/SectionDivider';
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
 * رحلة قصيرة لا مربعات منفصلة: خطاف ← أنواع العسل (البطل) ← منذ 1997 ← بقية البضاعة
 * ← عرض ← دليل اجتماعي ← تمايز ← حكاية ← اعتراضات ← مشهد ختامي ← موقع.
 * البضاعة تبقى قبل الحكاية لأن زائر الجوال يريد رؤية ما يُباع أولاً.
 */
export default async function HomePage() {
  const [products, mixtures] = await Promise.all([getProducts(), getMixtureCards(), getSettings()]);
  const honey = products.filter((p) => p.category === 'HONEY');
  const rest = products.filter((p) => p.category !== 'HONEY');

  return (
    <>
      <Hero />
      <HoneyShowcase products={honey} />
      <SectionDivider variant="wave" />
      <Since1997 />
      <Products products={rest} mobileCarousel />
      <MixturesSection mixtures={mixtures} mobileCarousel />
      <RecentlyViewed />
      <SpecialOffers />
      <CustomerReviews />
      <WhyChooseUs />
      <SectionDivider />
      <Story />
      <FAQ limit={3} />
      <FinalCta />
      <Location />
    </>
  );
}
