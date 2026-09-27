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
        <img
          src="/images/logo.webp"
          width={112}
          height={112}
          alt={SITE.name}
          className="mx-auto h-20 w-auto rounded-2xl object-contain brightness-110 drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]"
        />
        <h1 className="mt-2 font-amiri text-2xl font-bold text-white">
          شكراً لاختيارك <span className="text-amber-400">عسل الهيثم</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          منحل عائلي في {c.city}، {c.region} — {c.note.replace('خبرة عائلية ', '')}
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <WhatsAppButton
          source="jar-reorder"
          message={REORDER}
          className="h-14 rounded-2xl text-lg"
          iconClassName="h-6 w-6"
        >
          اطلب مرة أخرى عبر واتساب
        </WhatsAppButton>
        <Link
          href="/shop"
          className="flex h-12 items-center justify-center rounded-2xl border border-amber-500/40 font-bold text-amber-300 hover:bg-amber-500/10"
        >
          تسوّق من الموقع
        </Link>
      </div>

      {/* مطويّان: لمن يسأل فقط — فتبقى الصفحة شاشة واحدة بلا تمرير */}
      <div className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <details className="group px-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 py-3.5 font-bold text-white [&::-webkit-details-marker]:hidden">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-500" />
            <span className="flex-1">تأكّد أن عسلك أصلي</span>
            <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180" />
          </summary>
          <div className="pb-4 text-sm leading-relaxed text-zinc-300">
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
        <details className="group px-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 py-3.5 font-bold text-white [&::-webkit-details-marker]:hidden">
            <Snowflake className="h-5 w-5 shrink-0 text-amber-500" />
            <span className="flex-1">إن تجمّد عسلك فهذا طبيعي</span>
            <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180" />
          </summary>
          <p className="pb-4 text-sm leading-relaxed text-zinc-300">
            التبلّور يحدث للعسل الطبيعي مع البرد والوقت، وليس دليل غشّ ولا فساد. لإعادته سائلاً: ضع
            المرطبان مغلقاً في ماء دافئ (لا يغلي) وحرّكه قليلاً حتى يذوب.
          </p>
        </details>
      </div>

      <WhatsAppButton
        source="jar-review"
        variant="soft"
        message={REVIEW}
        icon={false}
        className="h-12 gap-2 rounded-2xl"
      >
        <Star className="h-5 w-5" /> قيّم العسل الذي اشتريته
      </WhatsAppButton>

      {SITE.social.facebook && (
        <a
          href={SITE.social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1877F2] font-bold text-white hover:brightness-110"
        >
          <FacebookIcon className="h-5 w-5" /> تابع صفحتنا على فيسبوك
        </a>
      )}

      <footer className="mt-auto border-t border-zinc-800 pt-4 text-center text-sm text-zinc-400">
        <p>
          {c.street} — {c.city}، {c.region}
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <a
            href={`tel:${c.phone}`}
            aria-label="اتصال"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 hover:text-amber-400"
          >
            <Phone className="h-5 w-5" />
          </a>
          <a
            href={`/q/${slug}/vcard`}
            aria-label="حفظ جهة الاتصال"
            className="flex h-11 items-center gap-1.5 rounded-full border border-zinc-700 px-4 hover:text-amber-400"
          >
            <UserPlus className="h-4 w-4" /> حفظ الرقم
          </a>
        </div>
      </footer>
    </section>
  );
}
