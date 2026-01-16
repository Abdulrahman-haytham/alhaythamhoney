import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingCart } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { articles } from '../data/articles'; // استيراد البيانات

export const ArticleDetailPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  // البحث عن المقال في المصفوفة المستوردة
  const article = articles.find(a => a.id === articleId);
  const phoneNumber = "963930112994";

  if (!article) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header />
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-6 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">المقال غير موجود</h1>
            <Link to="/articles" className="text-amber-500 hover:text-amber-400">
              العودة إلى المقالات
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">الرئيسية</Link>
            <span>/</span>
            <Link to="/articles" className="hover:text-amber-500 transition-colors">المقالات</Link>
            <span>/</span>
            <span className="text-amber-500 truncate max-w-[200px]">{article.title}</span>
          </nav>

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
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <div 
              className="text-zinc-300 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                lineHeight: '1.8'
              }}
            />
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
              href={`https://wa.me/${phoneNumber}?text=أريد طلب عسل طبيعي`}
              className="inline-flex items-center gap-3 px-10 py-5 bg-amber-500 text-zinc-950 rounded-full font-black hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-xl"
            >
              <ShoppingCart className="w-6 h-6" />
              🍯 اطلب الآن عبر واتساب
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};