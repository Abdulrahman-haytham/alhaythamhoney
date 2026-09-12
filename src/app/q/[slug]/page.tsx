import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContact, getWhatsAppLink } from '@/lib/contacts';
import { SITE } from '@/lib/config';

type Params = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const contact = getContact(slug);
  if (!contact) notFound();
  return {
    title: 'بطاقة التواصل',
    alternates: { canonical: `/q/${slug}` },
    description: contact.note,
  };
}

export default async function ContactCard({ params }: Params) {
  const { slug } = await params;
  const c = getContact(slug);
  if (!c) notFound();
  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-5 px-6 py-10 text-center">
      <img src="/haytham-logo-static.svg" width={130} height={130} alt={SITE.name} />
      <h1 className="font-amiri text-3xl text-amber-400">{c.nameAr}</h1>
      <p className="text-zinc-400">
        {c.note}
        <br />
        {c.country} — {c.region} — {c.city}
        <br />
        {c.street}
      </p>
      <a
        className="w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-zinc-950"
        href={`/q/${slug}/vcard`}
      >
        حفظ جهة الاتصال
      </a>
      <div className="grid w-full grid-cols-2 gap-3">
        <a className="rounded-xl border border-zinc-700 p-3" href={`tel:${c.phone}`}>
          اتصال
        </a>
        <a
          className="rounded-xl bg-green-700 p-3"
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
        >
          واتساب
        </a>
      </div>
      <a
        href={SITE.social.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-400"
      >
        فيسبوك
      </a>
      <Link href="/" className="text-amber-400">
        زيارة الموقع
      </Link>
      <img
        src={`/q/${slug}/qr`}
        width={224}
        height={224}
        alt="رمز QR لبطاقة التواصل"
        className="rounded-xl bg-white"
      />
      <a href={`/q/${slug}/qr`} download="haytham-qr.svg" className="text-sm text-zinc-400">
        تحميل رمز QR
      </a>
    </section>
  );
}
