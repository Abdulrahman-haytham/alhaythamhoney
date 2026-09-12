import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Heart,
  Zap,
  Award,
  ShieldCheck,
  Truck,
  Leaf,
  MessageCircle,
} from 'lucide-react';
import { getProductBySlug } from '@/lib/products.server';
import { getApprovedReviews, getRatingSummary } from '@/lib/reviews.server';
import { SITE, getWhatsAppLink } from '@/lib/config';
import { ProductReviews } from '@/components/ProductReviews';
import AddToCartButton from './AddToCartButton';
export const dynamic = 'force-dynamic';

interface DetailedInfo {
  uses?: string[];
  benefits?: string[];
  properties?: string[];
  howToUse?: string;
}

/** detailedInfo مخزّن كـ Json في قاعدة البيانات — نتحقق من شكله قبل استخدامه. */
function parseDetailedInfo(value: unknown): DetailedInfo | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as DetailedInfo;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US').format(price);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.desc,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.desc,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, rating] = await Promise.all([
    getApprovedReviews(product.slug),
    getRatingSummary(product.slug),
  ]);

  const detailedInfo = parseDetailedInfo(product.detailedInfo);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc,
    image: new URL(product.image, SITE.url).href,
    sku: product.slug,
    brand: { '@type': 'Brand', name: SITE.name },
    ...(product.price != null
      ? {
          offers: {
            '@type': 'Offer',
            url: `${SITE.url}/product/${product.slug}`,
            price: product.price,
            priceCurrency: 'SYP',
            availability: `https://schema.org/${product.inStock ? 'InStock' : 'OutOfStock'}`,
          },
        }
      : {}),
    ...(rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.average,
            reviewCount: rating.count,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden border border-amber-500/20 bg-zinc-900/50 relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && (
                <div className="absolute top-6 right-6 bg-amber-500 text-zinc-950 text-sm font-black px-4 py-2 rounded-full uppercase z-10 shadow-lg shadow-amber-500/20">
                  {product.badge}
                </div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-zinc-950/70 flex items-center justify-center">
                  <span className="text-zinc-300 font-bold text-lg">نفدت الكمية حالياً</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-amiri font-bold text-white mb-4">
                {product.name}
              </h1>
              {product.benefit && (
                <span className="inline-block text-sm bg-amber-500/10 text-amber-500 px-4 py-2 rounded-lg font-bold uppercase tracking-wider border border-amber-500/20">
                  {product.benefit}
                </span>
              )}
            </div>

            <p className="text-lg text-zinc-300 leading-relaxed border-r-2 border-amber-500/30 pr-6">
              {product.desc}
            </p>

            {product.price != null && (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold gold-text">{formatPrice(product.price)}</span>
                <span className="text-zinc-500">ل.س</span>
                {product.weight && (
                  <span className="text-zinc-500 border-r border-zinc-700 pr-3">
                    {product.weight}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <AddToCartButton
                available={product.inStock}
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  desc: product.desc,
                  image: product.image,
                  price: product.price,
                  weight: product.weight,
                  badge: product.badge,
                  benefit: product.benefit,
                }}
              />
              <a
                href={getWhatsAppLink(
                  `مرحباً عسل الهيثم، أود الاستفسار عن المنتج المعروض في الموقع: ${product.name}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-amber-500/30 text-amber-400 py-3.5 rounded-xl font-bold hover:bg-amber-500/10 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>اطلب الآن عبر واتساب</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-400">ضمان الجودة</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Truck className="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-400">شحن آمن</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-400">خبرة 25+ عاماً</p>
              </div>
            </div>

            {/* Detailed Info */}
            {detailedInfo && (
              <div className="space-y-6">
                {detailedInfo.benefits && detailedInfo.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-amber-500 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" /> الفوائد الصحية
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detailedInfo.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-500/50 mt-0.5 shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detailedInfo.uses && detailedInfo.uses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-amber-500 mb-3 flex items-center gap-2">
                      <Leaf className="w-5 h-5" /> الاستخدامات
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detailedInfo.uses.map((use, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                          <Zap className="w-4 h-4 text-amber-500/50 mt-0.5 shrink-0" />
                          <span>{use}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detailedInfo.properties && detailedInfo.properties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-amber-500 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> الخصائص
                    </h3>
                    <ul className="space-y-2">
                      {detailedInfo.properties.map((property, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{property}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detailedInfo.howToUse && (
                  <div>
                    <h3 className="text-lg font-bold text-amber-500 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5" /> طريقة الاستخدام
                    </h3>
                    <p className="text-sm text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                      {detailedInfo.howToUse}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ProductReviews productSlug={product.slug} reviews={reviews} rating={rating} />
      </div>
    </div>
  );
}
