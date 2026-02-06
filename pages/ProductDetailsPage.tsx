
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, CheckCircle2, Leaf, Heart, Zap, Award, ShieldCheck, Truck, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { groups, ProductItem } from '../data/products';

import { Breadcrumbs } from '../components/Breadcrumbs';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const phoneNumber = "963947931959";

  // Find product by slug
  const product = groups
    .flatMap(group => group.items)
    .find(item => item.id === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-amiri font-bold text-amber-500 mb-4">المنتج غير موجود</h2>
        <p className="text-zinc-400 mb-8">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
        <Link 
          to="/shop" 
          className="bg-amber-500 text-zinc-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors"
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <Helmet>
        <title>{`${product.name} - الهيثم لنحل وعسل`}</title>
        <meta name="description" content={product.desc} />
        {/* Schema.org Product Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "description": product.desc,
            "image": product.image,
            "brand": {
              "@type": "Brand",
              "name": "الهيثم لنحل وعسل"
            },
            "offers": {
              "@type": "Offer",
              "availability": "https://schema.org/InStock",
              "priceCurrency": "SYP"
            }
          })}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={[
          { label: 'المتجر', href: '/shop' },
          { label: product.name }
        ]} />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden border border-amber-500/20 bg-zinc-900/50">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-6 right-6 bg-amber-500 text-zinc-950 text-sm font-black px-4 py-2 rounded-full uppercase z-10 shadow-lg shadow-amber-500/20">
                  {product.badge}
                </div>
              )}
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
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

            <p className="text-lg text-zinc-300 leading-relaxed border-l-2 border-amber-500/30 pl-6">
              {product.desc}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={`https://wa.me/${phoneNumber}?text=مرحباً، أريد طلب ${product.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-amber-500 text-zinc-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20"
              >
                <ShoppingCart className="w-5 h-5" />
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
            {product.detailedInfo && (
              <div className="space-y-6">
                {product.detailedInfo.benefits && (
                  <div>
                    <h3 className="text-lg font-bold text-amber-500 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" /> فوائد المنتج
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.detailedInfo.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-500/50 mt-0.5 shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.detailedInfo.howToUse && (
                  <div>
                    <h3 className="text-lg font-bold text-amber-500 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5" /> طريقة الاستخدام
                    </h3>
                    <p className="text-sm text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                      {product.detailedInfo.howToUse}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
