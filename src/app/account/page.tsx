import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Ticket, Trophy, Star, PackageCheck } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '@/lib/orders';
import { fmtSyp } from '@/lib/pricing';
import { db } from '@/lib/db';
import { currentCustomer } from '@/lib/customer-auth';
import { formatArticleDate, toIsoDay } from '@/lib/articles';
import { ProfileForm } from './ProfileForm';
import { LogoutButton } from './LogoutButton';

export const metadata: Metadata = { title: 'حسابي', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const customer = await currentCustomer();
  if (!customer) redirect('/account/login?next=/account');

  const [entries, reviews, orders] = await Promise.all([
    db.drawEntry.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        draw: { select: { title: true, status: true, winnerEntryId: true, endsAt: true } },
        jarCode: { select: { code: true } },
      },
    }),
    db.review.count({ where: { customerId: customer.id } }),
    db.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        reference: true,
        status: true,
        total: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
  ]);
  const wins = entries.filter((e) => e.draw.winnerEntryId === e.id).length;

  return (
    <section className="min-h-screen bg-zinc-950 px-4 pt-32 pb-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-amiri text-3xl font-bold text-white sm:text-4xl">
              أهلاً {customer.name.split(' ')[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-500" dir="ltr">
              {customer.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { icon: Ticket, label: 'مشاركة في السحب', value: entries.length },
            { icon: Trophy, label: 'مرات الفوز', value: wins },
            { icon: Star, label: 'تقييم كتبته', value: reviews },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-center"
            >
              <s.icon className="mx-auto mb-1.5 h-5 w-5 text-amber-500" />
              <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
              <p className="text-[11px] text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6">
          <h2 className="font-amiri text-2xl font-bold text-white">السحب الأسبوعي</h2>
          <p className="mt-1 mb-4 text-sm text-zinc-400">
            كل مرطبان تشتريه يحمل رمزاً على الملصق — أدخله لتشارك، وكل رمز فرصة إضافية.
          </p>
          <Link
            href="/draw"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400"
          >
            <Ticket className="h-4 w-4" /> شارك الآن
          </Link>
        </div>

        {orders.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 font-amiri text-xl font-bold text-white">
              <PackageCheck className="h-5 w-5 text-amber-500" /> طلباتي
            </h2>
            <ul className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/orders/${o.reference}`}
                    className="flex flex-wrap items-center gap-3 p-4 text-sm transition hover:bg-zinc-800/40"
                  >
                    <span className="font-mono font-bold text-white" dir="ltr">
                      {o.reference}
                    </span>
                    <span className="text-xs text-zinc-500">{o._count.items} بنود</span>
                    <span className="flex-1 tabular-nums text-amber-300">
                      {fmtSyp(o.total)} ل.س
                    </span>
                    <time className="text-xs text-zinc-600">
                      {formatArticleDate(toIsoDay(o.createdAt))}
                    </time>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        o.status === 'CANCELLED'
                          ? 'bg-red-500/15 text-red-300'
                          : o.status === 'DELIVERED'
                            ? 'bg-green-500/15 text-green-300'
                            : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {entries.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-amiri text-xl font-bold text-white">مشاركاتي</h2>
            <ul className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              {entries.map((e) => {
                const won = e.draw.winnerEntryId === e.id;
                return (
                  <li key={e.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                    <span className="font-mono text-zinc-300" dir="ltr">
                      {e.jarCode.code}
                    </span>
                    <span className="flex-1 text-zinc-400">{e.draw.title}</span>
                    <time className="text-xs text-zinc-600">
                      {formatArticleDate(toIsoDay(e.createdAt))}
                    </time>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        won
                          ? 'bg-amber-500 text-zinc-950'
                          : e.draw.status === 'DRAWN'
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-green-500/15 text-green-300'
                      }`}
                    >
                      {won ? '🏆 فزت!' : e.draw.status === 'DRAWN' ? 'انتهى' : 'مشارِك'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="mb-4 font-amiri text-xl font-bold text-white">بياناتي</h2>
          <ProfileForm
            initial={{
              name: customer.name,
              phone: customer.phone,
              city: customer.city,
              marketingOptIn: customer.marketingOptIn,
            }}
          />
        </div>
      </div>
    </section>
  );
}
