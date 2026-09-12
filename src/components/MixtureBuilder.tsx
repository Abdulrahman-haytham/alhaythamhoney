'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  MessageCircle,
  RotateCcw,
  ShoppingCart,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { getWhatsAppLink } from '@/lib/config';
import { trackAddToCart, trackWhatsAppClick } from '@/lib/analytics';
import {
  JAR_SIZES,
  computePrice,
  clampToStep,
  describeRecipe,
  scaleSpec,
  type HoneyOption,
  type IngredientSpec,
  type JarSize,
} from '@/lib/mixturePricing';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

export interface MixtureData {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  baseSize: number;
  prepFee: number;
  ingredients: IngredientSpec[];
}

export function MixtureBuilder({
  mixture,
  honeys,
}: {
  mixture: MixtureData;
  honeys: HoneyOption[];
}) {
  const { addItem } = useCart();
  const [honeySlug, setHoneySlug] = useState(honeys[0]?.slug ?? '');
  const [size, setSize] = useState<JarSize>(mixture.baseSize as JarSize);
  const [advanced, setAdvanced] = useState(false);
  // الغرامات المعدّلة يدوياً فقط — ما لم يُلمس يتبع الموصى به تلقائياً عند تغيير الحجم
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  const honey = honeys.find((h) => h.slug === honeySlug) ?? honeys[0];
  const specs = useMemo(
    () => mixture.ingredients.map((s) => scaleSpec(s, size, mixture.baseSize)),
    [mixture.ingredients, size, mixture.baseSize],
  );
  const grams = useMemo(() => {
    const g: Record<string, number> = {};
    for (const s of specs)
      g[s.id] = overrides[s.id] !== undefined ? clampToStep(overrides[s.id], s) : s.recommended;
    return g;
  }, [specs, overrides]);

  const price = useMemo(
    () => (honey ? computePrice({ size, honey, specs, grams, prepFee: mixture.prepFee }) : null),
    [size, honey, specs, grams, mixture.prepFee],
  );

  const isCustomized = specs.some((s) => grams[s.id] !== s.recommended);
  const aboveRecommended = specs.filter((s) => grams[s.id] > s.recommended);

  function changeSize(next: JarSize) {
    setSize(next);
    setOverrides({});
  }

  if (!honey || !price) {
    return <p className="text-zinc-500">لا يتوفر عسل أساسي حالياً — تواصل معنا عبر واتساب.</p>;
  }

  const recipe = describeRecipe({ size, honeyName: honey.name, ingredients: price.ingredients });
  const cartId = `mix:${mixture.slug}:${size}:${honey.slug}:${specs.map((s) => grams[s.id]).join('-')}`;
  const displayName = `خلطة ${mixture.name}`;

  function addToCart() {
    if (!price?.valid) return;
    addItem({
      id: cartId,
      slug: mixture.slug,
      name: displayName,
      image: honey!.image,
      price: price!.total,
      weight: `${size} غرام`,
      recipe,
    });
    trackAddToCart({ id: cartId, name: displayName, price: price!.total });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  const waMessage = [
    `مرحباً، أود طلب خلطة «${mixture.name}»:`,
    `• الحجم: ${size} غرام`,
    `• العسل الأساسي: ${honey.name}`,
    ...price.ingredients.filter((i) => i.grams > 0).map((i) => `• ${i.name}: ${i.grams} غرام`),
    `السعر: ${fmt(price.total)} ل.س`,
  ].join('\n');

  return (
    <div className="space-y-8">
      {/* اختيار العسل — القرار الوحيد الذي يتخذه الجميع */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-zinc-300">
          <span className="text-amber-500">١.</span> اختر عسلك الأساسي
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
          {honeys.map((h) => {
            const active = h.slug === honey.slug;
            return (
              <button
                key={h.slug}
                type="button"
                onClick={() => setHoneySlug(h.slug)}
                aria-pressed={active}
                className={`group relative overflow-hidden rounded-xl border text-right transition-all ${
                  active
                    ? 'border-amber-500 ring-2 ring-amber-500/30'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {}
                <img
                  src={h.image}
                  alt=""
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <span className="block bg-zinc-900/90 px-2 py-1.5 text-[11px] font-bold leading-tight text-zinc-100 sm:text-xs">
                  {h.name}
                </span>
                {active && (
                  <span className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-zinc-950">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* الحجم */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-zinc-300">
          <span className="text-amber-500">٢.</span> اختر الحجم
        </h2>
        <div className="flex gap-2">
          {JAR_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeSize(s)}
              aria-pressed={s === size}
              className={`h-11 flex-1 rounded-xl border text-sm font-bold transition-colors ${
                s === size
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              {s >= 1000 ? `${s / 1000} كغ` : `${s} غ`}
            </button>
          ))}
        </div>
      </section>

      {/* الوصفة — الافتراضي هو وصفة الخبير؛ التعديل مطويّ لمن يريده */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          aria-expanded={advanced}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-right"
        >
          <span className="flex items-center gap-2.5 text-sm font-bold text-zinc-200">
            <SlidersHorizontal className="h-4 w-4 text-amber-500" />
            {advanced ? 'المكوّنات — عدّل ما تشاء' : 'الوصفة الموصى بها'}
            {isCustomized && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                معدّلة
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            {advanced ? 'إخفاء' : 'تعديل المكوّنات'}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${advanced ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {/* ملخص الوصفة يظهر دائماً */}
        <ul className="flex flex-wrap gap-2 px-5 pb-4">
          <li className="rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300">
            {honey.name} <span className="text-zinc-500">{price.honeyGrams}غ</span>
          </li>
          {price.ingredients
            .filter((i) => i.grams > 0)
            .map((i) => (
              <li
                key={i.name}
                className="rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300"
              >
                {i.name} <span className="text-zinc-500">{i.grams}غ</span>
              </li>
            ))}
        </ul>

        <AnimatePresence initial={false}>
          {advanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-5 border-t border-zinc-800 px-5 py-5">
                {specs.map((s) => {
                  const value = grams[s.id];
                  const pct = ((value - s.minGrams) / (s.maxGrams - s.minGrams)) * 100;
                  const recPct = ((s.recommended - s.minGrams) / (s.maxGrams - s.minGrams)) * 100;
                  return (
                    <div key={s.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <label htmlFor={`ing-${s.id}`} className="text-sm font-bold text-zinc-200">
                          {s.name}
                        </label>
                        <span className="text-sm tabular-nums">
                          <span
                            className={value !== s.recommended ? 'text-amber-300' : 'text-zinc-300'}
                          >
                            {value}غ
                          </span>
                          <span className="mr-2 text-xs text-zinc-600">
                            {fmt(value * s.pricePerGram)} ل.س
                          </span>
                        </span>
                      </div>
                      <div className="relative">
                        {/* علامة الموصى به فوق المنزلق */}
                        <span
                          className="pointer-events-none absolute -top-1 h-5 w-0.5 rounded bg-amber-500/60"
                          style={{ right: `calc(${recPct}% - 1px)` }}
                          aria-hidden
                        />
                        <input
                          id={`ing-${s.id}`}
                          type="range"
                          dir="rtl"
                          min={s.minGrams}
                          max={s.maxGrams}
                          step={s.step}
                          value={value}
                          onChange={(e) =>
                            setOverrides((o) => ({ ...o, [s.id]: Number(e.target.value) }))
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-amber-500"
                          style={{
                            background: `linear-gradient(to left, #f59e0b ${pct}%, #27272a ${pct}%)`,
                          }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
                        <span>{s.maxGrams}غ</span>
                        <span className="text-amber-500/80">
                          الموصى به {s.recommended}غ{s.note ? ` — ${s.note}` : ''}
                        </span>
                        <span>{s.minGrams}غ</span>
                      </div>
                    </div>
                  );
                })}

                {aboveRecommended.length > 0 && (
                  <p className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs leading-relaxed text-amber-200/90">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      {aboveRecommended.map((s) => s.name).join('، ')} أعلى من المقدار المقترح —
                      استشر مختصاً قبل تعديل المكونات، خصوصاً إن كنت تتناول أدوية أو لديك حساسية.
                    </span>
                  </p>
                )}

                {isCustomized && (
                  <button
                    type="button"
                    onClick={() => setOverrides({})}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    إعادة الوصفة الموصى بها
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* السعر وتفصيله */}
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500">السعر الإجمالي</p>
            <p className="text-3xl font-extrabold leading-none tabular-nums">
              <span className="gold-text">{fmt(price.total)}</span>
              <span className="mr-2 text-base font-semibold text-zinc-400">ل.س</span>
            </p>
          </div>
          <p className="text-left text-xs text-zinc-500">
            مرطبان {size >= 1000 ? `${size / 1000} كغ` : `${size} غ`}
          </p>
        </div>
        <details className="group text-xs text-zinc-500">
          <summary className="cursor-pointer select-none list-none text-zinc-400 hover:text-zinc-200">
            تفصيل السعر{' '}
            <ChevronDown className="inline h-3 w-3 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3 tabular-nums">
            <li className="flex justify-between">
              <span>
                {honey.name} × {price.honeyGrams}غ
              </span>
              <span>{fmt(price.honeyCost)}</span>
            </li>
            {price.ingredients
              .filter((i) => i.grams > 0)
              .map((i) => (
                <li key={i.name} className="flex justify-between">
                  <span>
                    {i.name} × {i.grams}غ
                  </span>
                  <span>{fmt(i.cost)}</span>
                </li>
              ))}
            {price.prepFee > 0 && (
              <li className="flex justify-between">
                <span>تحضير وتعبئة</span>
                <span>{fmt(price.prepFee)}</span>
              </li>
            )}
          </ul>
        </details>
      </section>

      {/* الإجراءات */}
      {!price.valid && (
        <p role="alert" className="text-red-400">
          المكونات تملأ المرطبان أو تتجاوز حدوده. خفّض الكميات لتبقى مساحة للعسل.
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={addToCart}
          disabled={!price.valid}
          className={`inline-flex h-13 flex-1 items-center justify-center gap-2.5 rounded-xl py-4 font-bold transition-colors ${
            added ? 'bg-green-600 text-white' : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
          }`}
        >
          {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          {added ? 'أُضيفت إلى السلة' : 'أضف إلى السلة'}
        </button>
        <a
          href={price.valid ? getWhatsAppLink(waMessage) : undefined}
          aria-disabled={!price.valid}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!price.valid) e.preventDefault();
            else trackWhatsAppClick('mixture-builder');
          }}
          className="inline-flex h-13 flex-1 items-center justify-center gap-2.5 rounded-xl border border-green-600/50 bg-green-600/10 py-4 font-bold text-green-300 transition-colors hover:bg-green-600/20"
        >
          <MessageCircle className="h-5 w-5" />
          اطلبها عبر واتساب
        </a>
      </div>
    </div>
  );
}
