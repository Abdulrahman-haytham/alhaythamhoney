import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Story from "@/components/Story";
import Products from "@/components/Products";
import { CustomMixtures } from "@/components/CustomMixtures";
import { SpecialOffers } from "@/components/SpecialOffers";
import CustomerReviews from "@/components/CustomerReviews";
import WhyChooseUs from "@/components/WhyChooseUs";
import FAQ from "@/components/FAQ";
import { Location } from "@/components/Location";
import { getProducts } from "@/lib/products.server";

export const revalidate = 60;

/**
 * ترتيب الأقسام مبنيّ على قمع الشراء لا على السرد:
 * خطاف ← ثقة ← بضاعة ← عرض ← دليل اجتماعي ← تمايز ← خدمة ← حكاية ← اعتراضات ← ختام.
 * الحكاية أُخّرت لأن الزائر على الجوال يريد رؤية ما يُباع قبل تاريخ العلامة.
 */
export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Hero />
      <Stats />
      <Products products={products} mobileCarousel />
      <SpecialOffers />
      <CustomerReviews />
      <WhyChooseUs />
      <CustomMixtures isTeaser={true} />
      <Story />
      <FAQ limit={3} />
      <Location />
    </>
  );
}