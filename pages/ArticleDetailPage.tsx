import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingCart } from 'lucide-react';
import { articles } from '../data/articles';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SITE, getWhatsAppLink } from '../config/site';
import { MarkdownContent } from '../components/MarkdownContent';
import { Meta } from '../components/Meta';
import { Image } from '../components/Image';

export const ArticleDetailPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const normalizedId = articleId ? decodeURIComponent(articleId).trim() : '';
  const article = articles.find(a => a.id === normalizedId);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) {
    return (
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">المقال غير موجود</h1>
          <Link to="/articles" className="text-amber-500 hover:text-amber-400">
            العودة إلى المقالات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <Meta
        title={`${article.title} - مدونة الهيثم`}
        description={article.description}
        keywords={article.keywords}
        image={article.image}
        type="article"
      />

      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <Breadcrumbs items={[
          { label: 'المقالات', href: '/articles' },
          { label: article.title }
        ]} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-wider uppercase text-xs">
              Article
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-6">
            {article.description}
          </p>
          {article.image && (
            <div className="mt-6 rounded-3xl overflow-hidden border border-amber-500/20 bg-zinc-900/40">
              <Image
                src={article.image}
                alt={article.title}
                className="w-full h-full max-h-[360px] object-cover"
              />
            </div>
          )}
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MarkdownContent content={article.content} className="text-zinc-300 leading-relaxed" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center bg-gradient-to-br from-amber-500/10 to-transparent p-12 rounded-2xl border border-amber-500/20"
        >
          <h2 className="text-3xl font-amiri font-bold text-white mb-4">
            جاهز لتجربة عسلنا الطبيعي؟
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
            اطلب الآن واحصل على عسل طبيعي 100% مفحوص مخبرياً
          </p>
          <a
            href={getWhatsAppLink(SITE.whatsappDefaultMessage)}
            className="inline-flex items-center gap-3 px-10 py-5 bg-amber-500 text-zinc-950 rounded-full font-black hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-xl"
          >
            <ShoppingCart className="w-6 h-6" />
            🍯 اطلب الآن عبر واتساب
          </a>
        </motion.div>
      </div>
    </div>
  );
};
