import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Building2, Truck, BadgeCheck } from 'lucide-react';
import { getSettings } from '@/lib/settings.server';
import { LeadForm } from './LeadForm';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'الجملة والمحلات',
  description:
    'أسعار جملة للمحلات والمطاعم والصيدليات — عسل طبيعي مفحوص مخبرياً بتغليف يناسب رفّك.',
  alternates: { canonical: '/wholesale' },
};
export const dynamic = 'force-dynamic';

/** صفحة الجملة (Odoo quotations): نموذج يصل إلى اللوحة كفرصة تُدار بحالات */
export default async function WholesalePage() {
  const settings = await getSettings();
  if (!settings.wholesaleEnabled) notFound();
  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">للمحلات والمطاعم</p>
          <h1 className="mt-2 font-amiri text-4xl font-bold text-white sm:text-5xl">
            عسل الهيثم بأسعار الجملة
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
            نورّد لمحلات المواد الغذائية والمطاعم والصيدليات بعبوات من 250 غرام حتى 5 كغ، مع شهادة
            فحص لكل دفعة وتسليم دوري إلى كل المحافظات.
          </p>
        </div>
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: BadgeCheck, title: 'فحص لكل دفعة', text: 'تقرير مخبري مرفق مع كل توريد' },
            { icon: Truck, title: 'تسليم دوري', text: 'جدول شهري أو أسبوعي حسب حركة بيعك' },
            {
              icon: Building2,
              title: 'تغليف يناسبك',
              text: 'مرطبانات زجاج، دلاء، أو علامتك الخاصة',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <f.icon className="mb-2 h-6 w-6 text-amber-500" />
              <h2 className="font-bold text-white">{f.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">{f.text}</p>
            </div>
          ))}
        </div>
        <LeadForm />
        <p className="mt-6 text-center text-sm text-zinc-500">
          تفضّل الاتصال؟{' '}
          <WhatsAppButton
            source="wholesale"
            variant="link"
            message="مرحباً عسل الهيثم، أستفسر عن أسعار الجملة."
            className="gap-1"
            iconClassName="h-4 w-4"
          >
            راسلنا على واتساب
          </WhatsAppButton>
        </p>
      </div>
    </section>
  );
}
