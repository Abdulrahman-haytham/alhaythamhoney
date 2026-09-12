import { Star, BadgeCheck, Quote, MessageCircle } from 'lucide-react';
import { getApprovedReviews } from '@/lib/reviews.server';
import { getWhatsAppLink } from '@/lib/config';

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= value ? 'fill-amber-500 text-amber-500' : 'fill-zinc-700 text-zinc-700'}`}
        />
      ))}
    </span>
  );
}

export default async function CustomerReviews() {
  const reviews = await getApprovedReviews(undefined, 6);

  return (
    <section id="reviews" className="py-20 px-6 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />

      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <Quote className="w-5 h-5 text-amber-500" />
            <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-xs italic">
              Customer Reviews
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-amiri font-bold mb-4 text-white">ماذا يقول عملاؤنا؟</h2>
          <p className="text-zinc-400 text-base font-light max-w-2xl mx-auto">
            ثقة عملائنا هي شهادتنا الحقيقية على جودة منتجاتنا
          </p>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* Reviews */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="group relative bg-zinc-900/40 rounded-xl p-6 border border-white/5 hover:border-amber-500/30 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-3">
                  <Stars value={review.rating} />
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-600/15 px-2 py-0.5 text-[11px] font-medium text-green-400">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      شراء موثّق
                    </span>
                  )}
                </div>

                <p className="text-zinc-300 mb-4 leading-relaxed text-right text-sm line-clamp-4">
                  &quot;{review.body}&quot;
                </p>

                <div className="pt-4 border-t border-white/5 text-right">
                  <h4 className="text-white font-bold text-sm mb-0.5">{review.authorName}</h4>
                  {review.authorCity && <p className="text-zinc-500 text-xs">{review.authorCity}</p>}
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-500">لا توجد تقييمات بعد — كن أول من يشارك رأيه.</p>
        )}

        {/* Call to Action */}
        <div className="text-center mt-10">
          <p className="text-zinc-400 mb-4 text-sm">شاركنا تجربتك مع منتجاتنا</p>
          <a
            href={getWhatsAppLink('أريد مشاركة تجربتي مع منتجاتكم')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-zinc-950 rounded-full font-bold hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-sm"
          >
            شارك رأيك
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
