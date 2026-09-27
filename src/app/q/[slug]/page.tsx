import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, Phone, ShieldCheck, Snowflake, Star, UserPlus } from 'lucide-react';
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
    <section className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 py-8">
      <header className="text-center">
        <img
          src="/images/logo.webp"
          width={112}
          height={112}
          alt={SITE.name}
          className="mx-auto h-28 w-auto rounded-2xl object-contain brightness-110 drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]"
        />
        <h1 className="mt-3 font-amiri text-3xl font-bold text-white">
          شكراً لاختيارك <span className="text-amber-400">عسل الهيثم</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
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

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="mb-2 flex items-center gap-2 font-bold text-white">
          <ShieldCheck className="h-5 w-5 text-amber-500" /> تأكّد أن عسلك أصلي
        </h2>
        <p className="text-sm leading-relaxed text-zinc-300">
          عسل الهيثم يُباع في مرطبانات مختومة فقط. إن كان الختم مفتوحاً أو مفقوداً عند الشراء، أو
          اشتريت عسلاً باسمنا وشككت فيه، راسلنا قبل استعماله.
        </p>
        {flags.hasAgents && (
          <Link
            href="/agents"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-amber-400 hover:underline"
          >
            <BadgeCheck className="h-4 w-4" /> الوكلاء المعتمدون ←
          </Link>
        )}
      </article>

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="mb-2 flex items-center gap-2 font-bold text-white">
          <Snowflake className="h-5 w-5 text-amber-500" /> إن تجمّد عسلك فهذا طبيعي
        </h2>
        <p className="text-sm leading-relaxed text-zinc-300">
          التبلّور يحدث للعسل الطبيعي مع البرد والوقت، وليس دليل غشّ ولا فساد. لإعادته سائلاً: ضع
          المرطبان مغلقاً في ماء دافئ (لا يغلي) وحرّكه قليلاً حتى يذوب.
        </p>
      </article>

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

      <footer className="mt-2 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-400">
        <p>
          {c.street} — {c.city}، {c.region}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
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
        <Link href="/" className="mt-4 inline-block text-amber-400 hover:underline">
          زيارة الموقع
        </Link>
      </footer>
    </section>
  );
}
