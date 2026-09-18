'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { toArabicIndic } from '@/lib/glossary';
import type { HiveLayerKind } from '@/lib/hive';

export type HiveLayerView = {
  key: string;
  kind: HiveLayerKind;
  height: number;
  position: string;
  slug: string;
  name: string;
  summary: string;
  image: string;
  /** ما بداخل الصندوق — الإطار (إن كان مدخله منشوراً) */
  frames: { slug: string; name: string } | null;
};

// هندسة الرسم: viewBox ثابت، الصناديق يساراً والتسميات يميناً (العربية تنتهي عند x=332)
const VB_W = 340;
const BOX_X = 18;
const BOX_W = 158;
const DEPTH = 12;
const TOP = 26;
const GAP = 16; // المسافة بين الطبقات عند «فكّ الطبقات»
// النص عربي: `direction="rtl"` + `text-anchor: start` يضع بداية الكلمة (يمينها) عند هذه النقطة
const LABEL_X = VB_W - 8;

/** عرض الطبقة حسب نوعها — الغطاء الخارجي أعرض قليلاً (يغلّف الصندوق)، والمدخل أضيق */
function widthFor(kind: HiveLayerKind) {
  if (kind === 'lid') return { x: BOX_X - 6, w: BOX_W + 12 };
  if (kind === 'entrance') return { x: BOX_X + 44, w: BOX_W - 88 };
  if (kind === 'board') return { x: BOX_X - 3, w: BOX_W + 6 };
  return { x: BOX_X, w: BOX_W };
}

/**
 * خلية لانغستروث مرسومة بالكود: كل طبقة زرّ (فأرة/لمس/لوحة مفاتيح)، والتحديد يبرزها
 * ويعرض لوحتها. «فكّ الطبقات» يباعدها بانتقال CSS يُعطَّل مع prefers-reduced-motion.
 * قائمة الروابط الكاملة تحت الرسم في الصفحة (خادم) فتعمل الصفحة بلا JavaScript.
 */
export function HiveExplorer({ layers }: { layers: HiveLayerView[] }) {
  const [selected, setSelected] = useState(0);
  const [exploded, setExploded] = useState(false);
  const panelId = useId();
  const layer = layers[selected];

  // مواضع y التراكمية (بلا فكّ) — الإزاحة عند الفكّ تُضاف كتحويل CSS لكل طبقة
  const tops: number[] = [];
  let y = TOP;
  for (const l of layers) {
    tops.push(y);
    y += l.height;
  }
  const stackHeight = y - TOP;
  const explodedExtra = GAP * (layers.length - 1);
  const vbH = TOP + stackHeight + explodedExtra + 20;

  const move = (delta: number) =>
    setSelected((i) => Math.min(layers.length - 1, Math.max(0, i + delta)));

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      move(-1);
      focusLayer(i - 1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      move(1);
      focusLayer(i + 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected(i);
    }
  };
  const focusLayer = (i: number) => {
    const el = document.querySelector<SVGGElement>(`[data-hive-layer="${i}"]`);
    el?.focus();
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-10">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">اضغط أي طبقة — أو تنقّل بأسهم لوحة المفاتيح</p>
          <button
            type="button"
            onClick={() => setExploded((v) => !v)}
            aria-pressed={exploded}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-700 px-3 text-xs font-bold text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300 aria-pressed:border-amber-500 aria-pressed:text-amber-300"
          >
            <Layers className="h-3.5 w-3.5" /> {exploded ? 'اجمع الطبقات' : 'فكّ الطبقات'}
          </button>
        </div>

        <svg
          viewBox={`0 0 ${VB_W} ${vbH}`}
          role="group"
          aria-label="رسم خلية النحل بطبقاتها"
          className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/40"
        >
          <defs>
            <pattern id="hive-grid" width="6" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </pattern>
          </defs>
          {/* الارتفاع محجوز لحالة الفكّ حتى لا يقفز التخطيط؛ المجمّعة تُتوسّط في المساحة نفسها */}
          <g
            style={{ transform: `translateY(${exploded ? 0 : explodedExtra / 2}px)` }}
            className="transition-transform duration-500 ease-out motion-reduce:transition-none"
          >
            {layers.map((l, i) => {
              const { x, w } = widthFor(l.kind);
              const top = tops[i];
              const h = l.height;
              const on = i === selected;
              const shift = exploded ? i * GAP : 0;
              const fill = on ? 'rgba(245,158,11,0.18)' : 'rgba(24,24,27,0.9)';
              const stroke = on ? '#fbbf24' : 'rgba(245,158,11,0.45)';
              return (
                <g
                  key={l.key}
                  data-hive-layer={i}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`${l.position}: ${l.name}`}
                  aria-controls={panelId}
                  onClick={() => setSelected(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  style={{ transform: `translateY(${shift}px)` }}
                  className="cursor-pointer outline-none transition-transform duration-500 ease-out focus-visible:[&>rect:first-of-type]:stroke-white motion-reduce:transition-none"
                >
                  {/* مساحة النقر: صفّ الطبقة كاملاً حتى التسمية — الطبقات الرقيقة (حاجز الملكة،
                    المدخل) لا مساحة مطلية كافية فيها ليقع النقر داخلها. الصفوف لا تتداخل
                    حتى لا تبتلع طبقةٌ سميكة نقرة جارتها الرقيقة. */}
                  <rect
                    x={BOX_X - 10}
                    y={top}
                    width={VB_W - (BOX_X - 10) - 2}
                    height={h}
                    fill="transparent"
                  />
                  {/* الوجه الأمامي */}
                  <rect
                    x={x}
                    y={top}
                    width={w}
                    height={h}
                    rx={1.5}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={on ? 1.6 : 1}
                  />
                  {/* الوجه العلوي (عمق) */}
                  <polygon
                    points={`${x},${top} ${x + DEPTH},${top - DEPTH * 0.7} ${x + w + DEPTH},${top - DEPTH * 0.7} ${x + w},${top}`}
                    fill={on ? 'rgba(251,191,36,0.32)' : 'rgba(245,158,11,0.16)'}
                    stroke={stroke}
                    strokeWidth={0.8}
                  />
                  {/* الوجه الجانبي */}
                  <polygon
                    points={`${x + w},${top} ${x + w + DEPTH},${top - DEPTH * 0.7} ${x + w + DEPTH},${top + h - DEPTH * 0.7} ${x + w},${top + h}`}
                    fill={on ? 'rgba(217,119,6,0.3)' : 'rgba(120,53,15,0.35)'}
                    stroke={stroke}
                    strokeWidth={0.8}
                  />
                  {/* تفاصيل حسب النوع */}
                  {l.kind === 'box' &&
                    Array.from({ length: 9 }, (_, k) => (
                      <rect
                        key={k}
                        x={x + 10 + k * ((w - 20) / 9)}
                        y={top + 8}
                        width={(w - 20) / 9 - 5}
                        height={h - 14}
                        rx={1}
                        fill={on ? 'rgba(251,191,36,0.16)' : 'rgba(245,158,11,0.08)'}
                        stroke="rgba(245,158,11,0.35)"
                        strokeWidth={0.6}
                      />
                    ))}
                  {l.kind === 'grid' && (
                    <rect
                      x={x + 6}
                      y={top + 1.5}
                      width={w - 12}
                      height={h - 3}
                      fill="url(#hive-grid)"
                      className="text-amber-500/60"
                    />
                  )}
                  {l.kind === 'lid' && (
                    <line
                      x1={x + 4}
                      y1={top + 4}
                      x2={x + w - 4}
                      y2={top + 4}
                      stroke="rgba(228,228,231,0.5)"
                      strokeWidth={1.2}
                    />
                  )}
                  {l.kind === 'entrance' && (
                    <rect
                      x={x + 26}
                      y={top + 3}
                      width={w - 52}
                      height={h - 6}
                      rx={1}
                      fill="rgba(9,9,11,0.9)"
                    />
                  )}
                  {/* خط الإشارة + التسمية (يمين) */}
                  <line
                    x1={x + w + DEPTH + 4}
                    y1={top + h / 2}
                    x2={LABEL_X - 112}
                    y2={top + h / 2}
                    stroke={on ? '#fbbf24' : 'rgba(113,113,122,0.7)'}
                    strokeWidth={0.8}
                    strokeDasharray={on ? undefined : '2 2'}
                  />
                  <text
                    x={LABEL_X}
                    y={top + h / 2 + 3.5}
                    textAnchor="start"
                    direction="rtl"
                    fontSize="10.5"
                    fontWeight={on ? 700 : 500}
                    fill={on ? '#fde68a' : '#a1a1aa'}
                    className="font-cairo select-none"
                  >
                    {toArabicIndic(i + 1)}. {l.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div
        id={panelId}
        aria-live="polite"
        className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.07] to-transparent p-4 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-28 shrink-0 overflow-hidden rounded-2xl bg-[#f6f1e7] sm:w-36">
            <img
              src={layer.image}
              alt={layer.name}
              width={400}
              height={400}
              className="aspect-square w-full object-contain p-2 mix-blend-multiply"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80">
              الطبقة {toArabicIndic(selected + 1)} من {toArabicIndic(layers.length)} ·{' '}
              {layer.position}
            </p>
            <h2 className="mt-1 font-amiri text-2xl font-bold leading-tight text-white sm:text-3xl">
              {layer.name}
            </h2>
            {layer.frames && (
              <p className="mt-1 text-xs text-zinc-400">
                بداخله:{' '}
                <Link
                  href={`/beekeeping/${layer.frames.slug}`}
                  className="font-bold text-amber-400 hover:underline"
                >
                  {layer.frames.name}
                </Link>
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 line-clamp-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
          {layer.summary}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={`/beekeeping/${layer.slug}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full gold-gradient px-4 text-xs font-black text-zinc-950"
          >
            اقرأ المدخل كاملاً <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <span className="mr-auto inline-flex gap-1">
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={selected === 0}
              aria-label="الطبقة الأعلى"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={selected === layers.length - 1}
              aria-label="الطبقة الأسفل"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
