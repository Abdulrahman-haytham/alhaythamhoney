import type { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Trophy, Ticket, CalendarClock, LogIn } from 'lucide-react';
import { db } from '@/lib/db';
import { SITE } from '@/lib/config';
import { currentCustomer } from '@/lib/customer-auth';
import { getOpenDraw, getPastWinners } from '@/lib/draws.server';
import { formatArticleDate, toIsoDay } from '@/lib/articles';
import { EnterDrawForm } from './EnterDrawForm';

export const metadata: Metadata = {
  title: 'السحب الأسبوعي',
  description:
    'كل مرطبان من عسل الهيثم يحمل رمزاً على ملصقه — سجّل دخولك، أدخل الرمز، وشارك في السحب الأسبوعي على جوائز من منتجاتنا.',
  alternates: { canonical: '/draw' },
  openGraph: {
    title: `السحب الأسبوعي | ${SITE.name}`,
    url: `${SITE.url}/draw`,
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: SITE.name }],
  },
};
export const dynamic = 'force-dynamic';

export default async function DrawPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code: prefill } = await searchParams;
  const next = prefill ? `/draw?code=${encodeURIComponent(prefill)}` : '/draw';
  const [draw, winners, customer] = await Promise.all([
    getOpenDraw(),
    getPastWinners(),
    currentCustomer(),
  ]);
  const myEntries =
    draw && customer
      ? await db.drawEntry.count({ where: { drawId: draw.id, customerId: customer.id } })
      : 0;

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <Gift className="h-8 w-8 text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="mb-3 font-amiri text-4xl font-bold text-white sm:text-5xl">
            السحب الأسبوعي
          </h1>
          <p className="mx-auto max-w-xl text-zinc-400">
            على ملصق كل مرطبان رمز مثل{' '}
            <span className="font-mono text-amber-300" dir="ltr">
              HY-7K3M-9Q2X
            </span>
            . أدخله هنا لتشارك — وكل مرطبان فرصة إضافية للفوز.
          </p>
        </div>

        {draw ? (
          <div className="mb-10 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900/40 to-transparent">
            <div className="border-b border-amber-500/20 p-6 sm:p-8">
              <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> مفتوح الآن
              </p>
              <h2 className="mt-3 font-amiri text-3xl font-bold text-white">{draw.title}</h2>
              <p className="mt-2 flex items-center gap-2 text-lg text-amber-300">
                <Trophy className="h-5 w-5" /> الجائزة: {draw.prize}
              </p>
              {draw.description && <p className="mt-3 text-sm text-zinc-400">{draw.description}</p>}
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-amber-500/70" />
                  السحب في {formatArticleDate(toIsoDay(draw.endsAt))}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Ticket className="h-4 w-4 text-amber-500/70" />
                  {draw._count.entries} مشاركة حتى الآن
                </span>
              </p>
            </div>
            <div className="p-6 sm:p-8">
              {customer ? (
                <EnterDrawForm
                  initialEntries={myEntries}
                  maxEntries={draw.maxEntries}
                  initialCode={prefill ?? ''}
                />
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-zinc-300">
                    المشاركة تحتاج حساباً — يستغرق إنشاؤه دقيقة واحدة وبلا كلمة مرور.
                  </p>
                  <Link
                    href={`/account/login?next=${encodeURIComponent(next)}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-zinc-950 hover:bg-amber-400"
                  >
                    <LogIn className="h-5 w-5" /> سجّل الدخول للمشاركة
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-10 rounded-3xl border border-dashed border-zinc-800 p-10 text-center">
            <p className="text-lg text-zinc-300">لا يوجد سحب مفتوح الآن.</p>
            <p className="mt-1 text-sm text-zinc-500">
              احتفظ برموز مرطباناتك — السحب القادم قريباً.
            </p>
          </div>
        )}

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            ['1', 'اشترِ أي مرطبان', 'ستجد رمزاً فريداً على الملصق.'],
            ['2', 'أدخل الرمز هنا', 'من حسابك — كل رمز يُستخدم مرة واحدة.'],
            ['3', 'انتظر السحب', 'نعلن الفائز هنا ونتواصل معه على هاتفه.'],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-bold text-zinc-950">
                {n}
              </span>
              <p className="font-bold text-white">{t}</p>
              <p className="mt-1 text-sm text-zinc-500">{d}</p>
            </div>
          ))}
        </div>

        {winners.length > 0 && (
          <div>
            <h2 className="mb-4 font-amiri text-2xl font-bold text-white">الفائزون السابقون</h2>
            <ul className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              {winners.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-white">
                    {w.winner}
                    {w.city && <span className="font-normal text-zinc-500"> — {w.city}</span>}
                  </span>
                  <span className="flex-1 text-zinc-400">
                    {w.title} · {w.prize}
                  </span>
                  <time className="text-xs text-zinc-600">
                    {formatArticleDate(toIsoDay(w.endsAt))}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
