import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, MapPin, Navigation } from 'lucide-react';
import { getActiveAgents } from '@/lib/agents.server';
import { SITE } from '@/lib/config';
import { FacebookIcon } from '@/components/BrandIcons';
import WhatsAppButton from '@/components/WhatsAppButton';

// مخزّنة، وتعديل الوكلاء في اللوحة يبطلها فوراً (revalidatePublic('agent'))
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'الوكلاء المعتمدون',
  description:
    'اشترِ عسل الهيثم المختوم من وكيل معتمد قريب منك: العنوان والموقع على الخريطة وواتساب كل وكيل.',
  alternates: { canonical: '/agents' },
  openGraph: {
    title: `الوكلاء المعتمدون | ${SITE.name}`,
    description: 'عسل الهيثم المختوم عند وكلائنا المعتمدين — العنوان والخريطة وواتساب.',
    url: `${SITE.url}/agents`,
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: SITE.name }],
  },
};

const AGENT_MESSAGE = `مرحباً، وجدتكم على موقع ${SITE.name} ضمن الوكلاء المعتمدين، وأود شراء عسل الهيثم.`;

/**
 * الوكلاء المعتمدون: من يبيع مرطبانات الهيثم المختومة فقط. الأدمن يخفي أي وكيل فوراً
 * من اللوحة، فلا يبقى على الموقع من توقّف عن بيع العسل الأصلي.
 */
export default async function AgentsPage() {
  const agents = await getActiveAgents();
  if (agents.length === 0) notFound();
  const governorates = [...new Set(agents.map((a) => a.governorate))];

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-28 pb-16 sm:px-6 sm:pt-32">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="font-amiri text-3xl font-bold text-white sm:text-4xl">
            الوكلاء المعتمدون
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            يبيعون عسل الهيثم في مرطباناته المختومة فقط. اطلب من الأقرب إليك واستلم مباشرة.
          </p>
        </header>

        {governorates.map((g) => (
          <div key={g} className="mb-10">
            {governorates.length > 1 && (
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-amber-400">
                <MapPin className="h-5 w-5" /> {g}
              </h2>
            )}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {agents
                .filter((a) => a.governorate === g)
                .map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{a.name}</h3>
                        <p className="text-sm text-amber-400">
                          {a.city}
                          {governorates.length === 1 && !a.city.includes(a.governorate)
                            ? ` — ${a.governorate}`
                            : ''}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                        <BadgeCheck className="h-3.5 w-3.5" /> معتمد
                      </span>
                    </div>
                    <p className="text-sm text-zinc-200">{a.address}</p>
                    {a.addressDetail && (
                      <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                        {a.addressDetail}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {a.whatsapp && (
                        <WhatsAppButton
                          source="agent"
                          phone={a.whatsapp}
                          message={AGENT_MESSAGE}
                          className="h-11 flex-1 rounded-xl px-4 text-sm"
                          iconClassName="h-4 w-4"
                        >
                          واتساب
                        </WhatsAppButton>
                      )}
                      {a.mapUrl && (
                        <a
                          href={a.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-bold text-zinc-100 hover:border-amber-500/50"
                        >
                          <Navigation className="h-4 w-4 text-amber-500" /> الخريطة
                        </a>
                      )}
                      {a.facebookUrl && (
                        <a
                          href={a.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`صفحة ${a.name} على فيسبوك`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 text-zinc-300 hover:text-[#1877F2]"
                        >
                          <FacebookIcon className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}

        <p className="mx-auto max-w-xl text-center text-xs leading-relaxed text-zinc-500">
          تأكد من الختم على غطاء المرطبان. إن وجدت عسلاً يُباع باسمنا خارج هذه القائمة، راسلنا.
        </p>
      </div>
    </section>
  );
}
