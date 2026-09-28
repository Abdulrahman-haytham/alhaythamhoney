import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  ChevronDown,
  Phone,
  ShieldCheck,
  Snowflake,
  Star,
  Store,
  UserPlus,
} from 'lucide-react';
import { getContact } from '@/lib/contacts';
import { SITE } from '@/lib/config';
import { GREETING } from '@/lib/whatsappMessage';
import { getSettings } from '@/lib/settings.server';
import { getSiteContentFlags } from '@/lib/content.server';
import { FacebookIcon } from '@/components/BrandIcons';
import WhatsAppButton from '@/components/WhatsAppButton';

type Params = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const contact = getContact(slug);
  if (!contact) notFound();
  return {
    title: 'شكراً لاختيارك عسل الهيثم',
    alternates: { canonical: `/q/${slug}` },
    description: contact.note,
  };
}

const REORDER = `${GREETING} اشتريت مرطبان عسل الهيثم وأود الطلب مجدداً.`;
const TILE =
  'flex h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 text-xs font-medium text-zinc-300 transition hover:border-amber-500/40 active:scale-95';
const TILE_ICON = 'h-5 w-5 text-amber-400';
const SUMMARY =
  'flex cursor-pointer list-none items-center gap-2 py-3 text-sm font-bold text-zinc-200 [&::-webkit-details-marker]:hidden';
const REVIEW = `${GREETING} أود تقييم العسل الذي اشتريته:\n• النوع:\n• رأيي:`;

/**
 * الصفحة التي يفتحها رمز QR المطبوع على كل مرطبان (الرابط ثابت: /q/haytham).
 * من يصل إليها اشترى العسل ويمسكه بيده — فالصفحة له: الطلب مجدداً، التأكد من الأصالة،
 * ما يقلقه عادة (التبلور)، وصفحتنا على فيسبوك. بطاقة التواصل صارت في الأسفل.
 */
export default async function JarWelcome({ params }: Params) {
  const [, flags] = await Promise.all([getSettings(), getSiteContentFlags()]);
  const { slug } = await params;
  const c = getContact(slug);
  if (!c) notFound();

  return (
    <section className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-6">
      <header className="text-center">
        <Link
          href="/"
          aria-label="الصفحة الرئيسية للموقع"
          className="group mx-auto inline-flex flex-col items-center gap-1 rounded-2xl transition-transform active:scale-95"
        >
          <img
            src="/images/logo.webp"
            width={80}
            height={80}
            alt={SITE.name}
            className="h-20 w-auto rounded-2xl object-contain ring-1 ring-amber-500/40 brightness-110 drop-shadow-[0_0_12px_rgba(212,175,55,0.3)] transition group-hover:ring-amber-400"
          />
          <span className="text-[11px] text-amber-400/80 group-hover:text-amber-300">
            زيارة الموقع ←
          </span>
        </Link>
        <h1 className="mt-2 font-amiri text-2xl font-bold text-white">
          شكراً لاختيارك <span className="text-amber-400">عسل الهيثم</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          منحل عائلي في {c.city}، {c.region} — {c.note.replace('خبرة عائلية ', '')}
        </p>
      </header>

      {/* زر واحد أساسي بذهب العلامة؛ كل ما عداه صف أيقونات هادئ */}
      <WhatsAppButton
        source="jar-reorder"
        variant="plain"
        message={REORDER}
        className="h-14 rounded-2xl bg-amber-500 text-lg font-black text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.98]"
        iconClassName="h-6 w-6"
      >
        اطلب مرة أخرى
      </WhatsAppButton>

      <nav aria-label="روابط سريعة" className="grid grid-cols-4 gap-2">
        <Link href="/shop" className={TILE}>
          <Store className={TILE_ICON} />
          المتجر
        </Link>
        <WhatsAppButton
          source="jar-review"
          variant="plain"
          message={REVIEW}
          icon={false}
          className={TILE}
        >
          <Star className={TILE_ICON} />
          قيّم العسل
        </WhatsAppButton>
        {SITE.social.facebook ? (
          <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" className={TILE}>
            <FacebookIcon className={TILE_ICON} />
            فيسبوك
          </a>
        ) : (
          <a href={`tel:${c.phone}`} className={TILE}>
            <Phone className={TILE_ICON} />
            اتصال
          </a>
        )}
        <a href={`/q/${slug}/vcard`} className={TILE}>
          <UserPlus className={TILE_ICON} />
          حفظ الرقم
        </a>
      </nav>

      {/* مطويّان: لمن يسأل فقط */}
      <div className="divide-y divide-zinc-800/80 border-y border-zinc-800/80">
        <details className="group">
          <summary className={SUMMARY}>
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="flex-1">تأكّد أن عسلك أصلي</span>
            <ChevronDown className="h-4 w-4 text-zinc-600 transition-transform group-open:rotate-180" />
          </summary>
          <div className="pb-3 text-sm leading-relaxed text-zinc-400">
            عسل الهيثم يُباع في مرطبانات مختومة فقط. إن كان الختم مفتوحاً أو مفقوداً عند الشراء، أو
            اشتريت عسلاً باسمنا وشككت فيه، راسلنا قبل استعماله.
            {flags.hasAgents && (
              <Link
                href="/agents"
                className="mt-2 flex items-center gap-1.5 font-bold text-amber-400 hover:underline"
              >
                <BadgeCheck className="h-4 w-4" /> الوكلاء المعتمدون ←
              </Link>
            )}
          </div>
        </details>
        <details className="group">
          <summary className={SUMMARY}>
            <Snowflake className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="flex-1">إن تجمّد عسلك فهذا طبيعي</span>
            <ChevronDown className="h-4 w-4 text-zinc-600 transition-transform group-open:rotate-180" />
          </summary>
          <p className="pb-3 text-sm leading-relaxed text-zinc-400">
            التبلّور يحدث للعسل الطبيعي مع البرد والوقت، وليس دليل غشّ ولا فساد. لإعادته سائلاً: ضع
            المرطبان مغلقاً في ماء دافئ (لا يغلي) وحرّكه قليلاً حتى يذوب.
          </p>
        </details>
      </div>

      <footer className="mt-auto pt-4 text-center text-xs leading-relaxed text-zinc-500">
        {c.street} — {c.city}، {c.region}
        <br />
        <a href={`tel:${c.phone}`} className="text-zinc-400 hover:text-amber-400" dir="ltr">
          {c.phone}
        </a>
      </footer>
    </section>
  );
}
