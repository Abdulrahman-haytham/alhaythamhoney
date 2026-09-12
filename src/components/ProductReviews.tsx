'use client';

import { useState } from 'react';
import { Star, BadgeCheck, MessageSquarePlus } from 'lucide-react';
import type { PublicReview, RatingSummary } from '@/lib/reviews.server';

function Stars({ value, size = 'w-4 h-4' }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(value) ? 'text-amber-500' : 'text-zinc-700'}`}
          fill={i <= Math.round(value) ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}

export function ProductReviews({
  productSlug,
  reviews,
  rating,
}: {
  productSlug: string;
  reviews: PublicReview[];
  rating: RatingSummary | null;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug,
          authorName: name,
          authorCity: city || undefined,
          rating: stars,
          body,
          orderRef: orderRef || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'تعذّر الإرسال. حاول مجدداً.');
        setState('idle');
        return;
      }
      setState('done');
    } catch {
      setError('تعذّر الاتصال. تحقق من الإنترنت.');
      setState('idle');
    }
  }

  return (
    <section className="mt-16 border-t border-zinc-800 pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-amiri font-bold text-white">آراء العملاء</h2>
          {rating ? (
            <div className="mt-2 flex items-center gap-2">
              <Stars value={rating.average} size="w-5 h-5" />
              <span className="font-bold text-amber-400 tabular-nums">{rating.average}</span>
              <span className="text-sm text-zinc-500">({rating.count} تقييم)</span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              لا توجد تقييمات بعد — كن أول من يشارك رأيه.
            </p>
          )}
        </div>
        {!open && state !== 'done' && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            <MessageSquarePlus className="h-4 w-4" />
            أضف تقييمك
          </button>
        )}
      </div>

      {state === 'done' && (
        <div className="mb-6 rounded-xl border border-green-600/30 bg-green-600/10 px-5 py-4 text-green-300">
          شكراً لك! سيظهر رأيك بعد مراجعته.
        </div>
      )}

      {open && state !== 'done' && (
        <form
          onSubmit={submit}
          className="mb-8 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">الاسم</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">المحافظة (اختياري)</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level1"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm text-zinc-400">تقييمك</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStars(i)}
                  aria-label={`${i} نجوم`}
                  className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800"
                >
                  <Star
                    className={`h-6 w-6 ${i <= stars ? 'text-amber-500' : 'text-zinc-600'}`}
                    fill={i <= stars ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">رأيك</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={10}
              rows={3}
              placeholder="كيف كانت تجربتك مع المنتج؟"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">
              رقم طلبك (اختياري — يمنحك وسم «شراء موثّق»)
            </label>
            <input
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="ORD-XXXXX-XXXX"
              dir="ltr"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={state === 'sending'}
              className="h-12 flex-1 rounded-xl bg-amber-500 font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {state === 'sending' ? 'جارٍ الإرسال…' : 'إرسال التقييم'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-12 rounded-xl border border-zinc-700 px-5 text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {reviews.length > 0 && (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-bold text-white">{r.authorName}</span>
                {r.authorCity && <span className="text-xs text-zinc-500">{r.authorCity}</span>}
                {r.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-600/15 px-2 py-0.5 text-[11px] font-medium text-green-400">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    شراء موثّق
                  </span>
                )}
              </div>
              <Stars value={r.rating} />
              <p className="mt-2 leading-relaxed text-zinc-300">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
