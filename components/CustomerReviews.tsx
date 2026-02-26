import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { getWhatsAppLink } from '../config/site';

interface Review {
  id: number;
  name: string;
  image: string;
  imageLink?: string; // رابط الصورة
  rating: number;
  comment: string;
  location?: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "أحمد الخبي ",
    image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1768652005/my-app-uploads/qxcxatbnzr37uiroaft2.jpg",
    imageLink: "https://www.facebook.com/share/p/1Bdab9zbW3/", // يمكن تغيير الرابط
    rating: 5,
    comment: "عسل ممتاز جداً! جودة عالية وطعم رائع. أنصح الجميع بتجربته.",
    location: "القنيطرة"
  },
  {
    id: 2,
    name: "Lamis ",
    image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1768652175/my-app-uploads/peqwajlwn5gqbfpq6wpu.jpg",
    imageLink: "https://www.facebook.com/share/p/1Bdab9zbW3/",
    rating: 5,
    comment: "استخدمت عسل حبة البركة لمدة شهر وشعرت بتحسن كبير في مناعتي. شكراً لكم!",
    location: "حلب"
  },
  {
    id: 3,
    name:" أنس مقداد",
    image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1768652005/my-app-uploads/qxcxatbnzr37uiroaft2.jpg",
    imageLink: "https://www.facebook.com/share/p/1Bdab9zbW3/",
    rating: 5,
    comment: "منتج طبيعي 100% كما وعدتم. التوصيل سريع والتغليف احترافي.",
    location: "درعا "
  },
  {
    id: 4,
    name: "Ruba Hamzee",
    image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1768652175/my-app-uploads/peqwajlwn5gqbfpq6wpu.jpg",
    imageLink: "https://www.facebook.com/share/p/1Bdab9zbW3/",
    rating: 5,
    comment: "بعتمد على العسل تبعكم كـ 'صيدلية طبيعية' بالبيت، خاصة ايام الشتوية ",
    location: "طرطوس"
  },
  {
    id: 5,
    name: "جابر طماس ",
    image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1768652005/my-app-uploads/qxcxatbnzr37uiroaft2.jpg",
    imageLink: "https://www.facebook.com/share/p/1Bdab9zbW3/",
    rating: 5,
    comment: "عسل الدردار خيار ممتاز لدعم النشاط والحيوية، ويساعد بشكل ملحوظ في تهدئة السعال وتعزيز المناعة، خاصة في أيام البرد.",
    location: "حماة"
  },
  {
    id: 6,
    name: "ليلى أحمد",
    image: "https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1768652175/my-app-uploads/peqwajlwn5gqbfpq6wpu.jpg",
    imageLink: "https://www.facebook.com/share/p/1Bdab9zbW3/",
    rating: 5,
    comment: "خدمة عملاء ممتازة ومنتجات أصلية. أنصح بشراء العكبر للوقاية من الأمراض.",
    location: "حماة"
  }
];

export const CustomerReviews: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkArrows();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkArrows);
      window.addEventListener('resize', checkArrows);
      return () => {
        scrollElement.removeEventListener('scroll', checkArrows);
        window.removeEventListener('resize', checkArrows);
      };
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 350;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section id="reviews" className="py-20 px-6 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"></div>
      
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <Quote className="w-5 h-5 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Customer Reviews
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-amiri font-bold mb-4 text-white">
            ماذا يقول عملاؤنا؟
          </h2>
          <p className="text-zinc-400 text-base font-light max-w-2xl mx-auto">
            ثقة عملائنا هي شهادتنا الحقيقية على جودة منتجاتنا
          </p>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-6 rounded-full"></div>
        </motion.div>

        {/* Slider Container */}
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/90 backdrop-blur-sm rounded-full p-2 border border-amber-500/20 hover:bg-amber-500/10 transition-all duration-300 group"
            >
              <ChevronLeft className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/90 backdrop-blur-sm rounded-full p-2 border border-amber-500/20 hover:bg-amber-500/10 transition-all duration-300 group"
            >
              <ChevronRight className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex gap-5 overflow-x-auto scroll-smooth cursor-grab active:cursor-grabbing scrollbar-hide pb-4"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex-shrink-0 w-72"
              >
                <div className="group relative bg-zinc-900/40 rounded-xl p-6 border border-white/5 hover:border-amber-500/30 transition-all duration-500 h-full">
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'fill-zinc-700 text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-zinc-300 mb-4 leading-relaxed text-right text-sm line-clamp-4">
                    "{review.comment}"
                  </p>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <a
                      href={review.imageLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group/image"
                      onClick={(e) => {
                        if (!review.imageLink) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <img
                        src={review.image}
                        alt={review.name}
                        loading="lazy"
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/20 group-hover/image:border-amber-500 transition-all duration-300"
                      />
                      {review.imageLink && (
                        <div className="absolute inset-0 bg-amber-500/20 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-3 h-3 text-amber-500" />
                        </div>
                      )}
                    </a>
                    <div className="flex-1 text-right">
                      <h4 className="text-white font-bold text-sm mb-0.5">{review.name}</h4>
                      {review.location && (
                        <p className="text-zinc-500 text-xs">{review.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          <p className="text-zinc-500 text-xs">
            اسحب يميناً ويساراً للتمرير
          </p>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-zinc-400 mb-4 text-sm">
            شاركنا تجربتك مع منتجاتنا
          </p>
          <a
            href={getWhatsAppLink('أريد مشاركة تجربتي مع منتجاتكم')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-zinc-950 rounded-full font-bold hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-sm"
          >
            شارك رأيك
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
