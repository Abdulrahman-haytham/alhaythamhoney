import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, X, ShoppingCart, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProductItem } from '../data/products';
import { useProductGroups } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { getWhatsAppLink } from '../config/site';
import { Image } from './Image';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const { data: groups } = useProductGroups();

  const allProducts = useMemo(() => {
    return (groups ?? []).flatMap((group) =>
      group.items.map((item) => ({ ...item, groupTitle: group.title }))
    );
  }, [groups]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        (p.benefit && p.benefit.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q))
    );
  }, [query, allProducts]);

  const handleAddToCart = useCallback(
    (product: ProductItem & { groupTitle: string }) => {
      addToCart({ id: product.id, name: product.name, image: product.image });
    },
    [addToCart]
  );

  const handleToggleWishlist = useCallback(
    (product: ProductItem & { groupTitle: string }) => {
      if (isWishlisted(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist({ id: product.id, name: product.name, image: product.image, benefit: product.benefit });
      }
    },
    [isWishlisted, addToWishlist, removeFromWishlist]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-md"
          dir="rtl"
        >
          <div className="container mx-auto px-4 pt-6 pb-20 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن العسل، المكملات..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3.5 pr-12 pl-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-lg"
                  aria-label="البحث عن المنتجات"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
                    aria-label="مسح البحث"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
                aria-label="إغلاق البحث"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
              {!query.trim() && (
                <div className="text-center py-16 text-zinc-600">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">اكتب للبحث عن منتجاتنا</p>
                  <p className="text-sm mt-2">مثال: عسل حبة البركة، العكبر، غذاء ملكات النحل...</p>
                </div>
              )}

              {query.trim() && filteredProducts.length === 0 && (
                <div className="text-center py-16 text-zinc-600">
                  <p className="text-lg">لم يتم العثور على نتائج لـ &ldquo;{query}&rdquo;</p>
                  <p className="text-sm mt-2">جرب كلمات بحث مختلفة</p>
                </div>
              )}

              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex gap-4 p-4">
                    <Link to={`/product/${product.id}`} className="flex-shrink-0" onClick={onClose}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${product.id}`} onClick={onClose}>
                        <h3 className="font-bold text-zinc-100 hover:text-amber-400 transition-colors truncate">
                          {product.name}
                        </h3>
                      </Link>
                      {product.benefit && (
                        <span className="inline-block text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded mt-1">
                          {product.benefit}
                        </span>
                      )}
                      <p className="text-zinc-500 text-sm mt-2 line-clamp-1">{product.desc}</p>
                      <div className="flex gap-2 mt-3">
                        <a
                          href={getWhatsAppLink(`مرحباً، أريد طلب ${product.name}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          طلب
                        </a>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                          aria-label={`أضف ${product.name} إلى السلة`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          للسلة
                        </button>
                        <button
                          onClick={() => handleToggleWishlist(product)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                            isWishlisted(product.id)
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                          aria-label={isWishlisted(product.id) ? `إزالة ${product.name} من المفضلة` : `أضف ${product.name} إلى المفضلة`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
