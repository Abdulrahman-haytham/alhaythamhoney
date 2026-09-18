import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  FileCheck2,
  Flower2,
  MapPin,
  Droplets,
  ShieldCheck,
  Ticket,
  ArrowLeft,
  PlayCircle,
  Droplets as DropletsIcon,
} from 'lucide-react';
import { getBatchByCode } from '@/lib/batches.server';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings.server';
import { renderMarkdown } from '@/lib/markdown';
import { formatArticleDate, toIsoDay } from '@/lib/articles';
import { jarCodeInput } from '@/lib/validation';
import { SITE } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const batch = await getBatchByCode(code.toUpperCase());
  if (!batch) return {};
  return {
    title: `جواز الدفعة ${batch.code} — ${batch.title}`,
    description: `من أين جاء هذا العسل ومتى قُطف وما نتيجة فحصه — ${batch.title}`,
    alternates: { canonical: `/batch/${batch.code}` },
  };
}

/**
 * جواز الدفعة (Odoo lots + quality): يفتحه الزبون من QR المرطبان فيرى المنحل،
 * تاريخ القطاف، المصدر الزهري، تقرير المخبر، والفيديو — وهو ما يميّز عسلاً حقيقياً.
 */
export default async function BatchPassportPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ jar?: string }>;
}) {
  const [{ code }, { jar: jarRaw }, admin] = await Promise.all([
    params,
    searchParams,
    requireAdmin(),
  ]);
  await getSettings();
  const batch = await getBatchByCode(code.toUpperCase(), !!admin);
  if (!batch) notFound();
  const jar = jarRaw ? jarCodeInput.safeParse(jarRaw) : null;
  const jarCode = jar?.success ? jar.data : null;
  const notesHtml = batch.notes ? renderMarkdown(batch.notes) : null;
  const localVideo = batch.videoUrl?.startsWith('/uploads/') ? batch.videoUrl : null;
  const facts = [
    batch.harvestDate && {
      icon: Calendar,
      label: 'تاريخ القطاف',
      value: formatArticleDate(toIsoDay(batch.harvestDate)),
    },
    batch.region && { icon: MapPin, label: 'المنحل / المنطقة', value: batch.region },
    batch.floralSource && { icon: Flower2, label: 'المصدر الزهري', value: batch.floralSource },
    batch.moisture && { icon: Droplets, label: 'الفحص', value: batch.moisture },
  ].filter((f): f is { icon: typeof Calendar; label: string; value: string } => !!f);

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {!batch.published && (
          <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            مسودّة — لا يراها الزوار حتى تُنشر.
          </p>
        )}
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-amber-500">
            <ShieldCheck className="h-4 w-4" /> جواز الدفعة
          </p>
          <h1 className="mt-2 font-amiri text-3xl font-bold text-white sm:text-4xl">
            {batch.title}
          </h1>
          <p className="mt-1 font-mono text-sm text-zinc-400" dir="ltr">
            {batch.code}
          </p>
          {jarCode && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm text-green-200">
              مرطبانك <b dir="ltr">{jarCode}</b> من هذه الدفعة ✓
            </p>
          )}
          {batch.product && (
            <Link
              href={`/product/${batch.product.slug}`}
              className="mt-5 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-amber-500/40"
            >
              <img src={batch.product.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <span className="flex-1">
                <span className="block text-xs text-zinc-500">المنتج</span>
                <span className="font-amiri text-lg font-bold text-white">
                  {batch.product.name}
                </span>
              </span>
              <ArrowLeft className="h-4 w-4 text-amber-500" />
            </Link>
          )}
        </div>

        {facts.length > 0 && (
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {facts.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <dt className="text-xs text-zinc-500">{f.label}</dt>
                  <dd className="font-bold text-white">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}

        {batch.labReportUrl && (
          <a
            href={batch.labReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/5 p-4 transition hover:bg-green-500/10"
          >
            <FileCheck2 className="h-6 w-6 text-green-400" />
            <span className="flex-1">
              <span className="block font-bold text-white">تقرير الفحص المخبري</span>
              <span className="text-xs text-zinc-400">PDF — يُفتح في تبويب جديد</span>
            </span>
            <ArrowLeft className="h-4 w-4 text-green-400" />
          </a>
        )}

        {batch.videoUrl &&
          (localVideo ? (
            <video
              src={localVideo}
              controls
              playsInline
              preload="metadata"
              className="mt-4 w-full rounded-2xl border border-zinc-800 bg-black"
            />
          ) : (
            <a
              href={batch.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-amber-500/40"
            >
              <PlayCircle className="h-6 w-6 text-amber-500" />
              <span className="font-bold text-white">شاهد فيديو القطاف</span>
            </a>
          ))}

        {notesHtml && (
          <article
            className="prose prose-invert mt-6 max-w-none rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
            dangerouslySetInnerHTML={{ __html: notesHtml }}
          />
        )}

        <Link
          href="/beekeeping/harvest"
          className="group mt-6 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-amber-500/40"
        >
          <DropletsIcon className="h-5 w-5 shrink-0 text-amber-500" />
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-white group-hover:text-amber-400">
              كيف قُطف هذا العسل؟
            </span>
            <span className="block text-xs text-zinc-500">
              ثماني خطوات من ختم القرص إلى هذا المرطبان — بالأدوات والصور.
            </span>
          </span>
          <ArrowLeft className="h-4 w-4 shrink-0 text-amber-500" />
        </Link>

        <div className="mt-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6">
          <h2 className="flex items-center gap-2 font-amiri text-2xl font-bold text-white">
            <Ticket className="h-5 w-5 text-amber-500" /> مرطبانك يدخلك السحب
          </h2>
          <p className="mt-1 mb-4 text-sm text-zinc-400">
            كل مرطبان من {SITE.name} يحمل رمزاً على الملصق — أدخله لتشارك في السحب الأسبوعي.
          </p>
          <Link
            href={jarCode ? `/draw?code=${encodeURIComponent(jarCode)}` : '/draw'}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400"
          >
            <Ticket className="h-4 w-4" /> {jarCode ? 'شارك بهذا الرمز' : 'شارك الآن'}
          </Link>
        </div>
      </div>
    </section>
  );
}
