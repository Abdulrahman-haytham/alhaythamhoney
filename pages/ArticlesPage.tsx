import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { articles } from '../data/articles';
import { Helmet } from 'react-helmet-async';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const ArticlesPage: React.FC = () => {
  const phoneNumber = "+963947931959";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16">
      <Helmet>
        <title>مدونة الهيثم - الهيثم لنحل وعسل</title>
        <meta name="description" content="اكتشف فوائد العسل الطبيعي، طرق التمييز بين العسل الأصلي والمغشوش، ونصائح صحية لاستخدام منتجات النحل." />
        <meta property="og:title" content="مدونة الهيثم - الهيثم لنحل وعسل" />
        <meta property="og:description" content="اكتشف فوائد العسل الطبيعي، طرق التمييز بين العسل الأصلي والمغشوش، ونصائح صحية لاستخدام منتجات النحل." />
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[{ label: 'المقالات' }]} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Al-Haitham Blog
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-amiri font-bold mb-6 text-white">
            مدونة الهيثم
          </h1>
          <p className="text-zinc-400 text-xl font-light max-w-3xl mx-auto leading-relaxed">
            📌 اقرأ، تَعلّم، وارتقِ بثقافتك حول العسل الطبيعي ومملكة النحل — فوائد، حقائق، وأدلة موثوقة من أهل الخبرة.
          </p>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {articles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-zinc-900/40 rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-amiri font-bold text-white group-hover:text-amber-400 transition-colors">
                  {article.title}
                </h2>
              </div>
              <p className="text-zinc-400 mb-6 leading-relaxed line-clamp-3">
                {article.description}
              </p>
              <Link
                to={`/articles/${article.id}`}
                className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors font-bold"
              >
                اقرأ المزيد
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-br from-amber-500/10 to-transparent p-12 rounded-2xl border border-amber-500/20"
        >
          <h2 className="text-3xl font-amiri font-bold text-white mb-4">
            جاهز لتجربة عسلنا الطبيعي؟
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
            اطلب الآن واحصل على عسل طبيعي 100% مفحوص مخبرياً
          </p>
          <a
            href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=أريد طلب عسل طبيعي`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-amber-500 text-zinc-950 rounded-full font-black hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-xl"
          >
            🍯 اطلب الآن عبر واتساب
          </a>
        </motion.div>
      </div>
    </div>
  );
};
