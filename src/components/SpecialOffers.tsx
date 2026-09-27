import Link from 'next/link';
import { ArrowLeft, BadgePercent, Clock, Gift, Store } from 'lucide-react';
import type { PromotionCard } from '@/lib/promotions.server';
import OfferAddButton from '@/components/OfferAddButton';

/**
 * العروض — من لوحة التحكم (`/admin/promotions`) لا من الكود، وهي نفسها التي تطبّقها السلة.
 * على الجوال شريط أفقي قصير (بطاقة وجزء من التالية) بدل ثلاث بطاقات تأخذ شاشة ونصف.
 * لا عرض فعّال ⇒ لا قسم: وعد لا تطبّقه السلة يهدم الثقة. «ينتهي في…» فقط حين يحدّد
 * الأدمن تاريخاً — لا استعجال مختلَق.
 */
export function SpecialOffers({ offers }: { offers: PromotionCard[] }) {
  if (offers.length === 0) return null;

  return (
    <section id="offers" className="bg-zinc-950 px-4 py-10 sm:px-6 sm:py-16">
      <div className="container mx-auto">
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <h2 className="font-amiri text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              العروض الحالية
            </h2>
            <p className="mt-1 text-sm text-zinc-400">يُطبَّق الخصم تلقائياً في السلة</p>
          </div>
          <BadgePercent className="h-7 w-7 shrink-0 text-amber-500" strokeWidth={1.5} />
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {offers.map((o) => (
            <li
              key={o.id}
              className={`flex shrink-0 snap-start items-center gap-3 rounded-2xl border border-amber-500/25 bg-gradient-to-l from-amber-500/[0.08] to-zinc-900/60 p-3 sm:w-auto ${
                offers.length > 1 ? 'w-[82%]' : 'w-full'
              }`}
            >
              {o.image ? (
                <img
                  src={o.image}
                  alt=""
                  loading="lazy"
                  className="h-20 w-20 shrink-0 rounded-xl bg-white object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  {o.product ? (
                    <Gift className="h-8 w-8 text-amber-500" />
                  ) : (
                    <BadgePercent className="h-8 w-8 text-amber-500" />
                  )}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-base font-black leading-snug text-amber-300">{o.headline}</p>
                {o.condition && <p className="truncate text-xs text-zinc-400">{o.condition}</p>}
                {o.endsAt && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock className="h-3 w-3" />
                    ينتهي{' '}
                    {new Date(o.endsAt).toLocaleDateString('ar-SY', {
                      day: 'numeric',
                      month: 'long',
                      timeZone: 'Asia/Damascus',
                    })}
                  </p>
                )}
                <div className="mt-2">
                  {o.product ? (
                    <OfferAddButton product={o.product} quantity={o.quantity} />
                  ) : (
                    <Link
                      href="/shop"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-bold text-zinc-950"
                    >
                      تسوّق الآن <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/wholesale"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-400"
        >
          <Store className="h-4 w-4" /> لديك محل؟ أسعار الجملة
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
