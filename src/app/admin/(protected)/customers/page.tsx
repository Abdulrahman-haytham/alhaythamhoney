import { Download, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { formatArticleDate, toIsoDay } from '@/lib/articles';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const [customers, optIn] = await Promise.all([
    db.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: { _count: { select: { entries: true, reviews: true, redemptions: true } } },
    }),
    db.customer.count({ where: { marketingOptIn: true } }),
  ]);
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 flex items-center gap-2 font-amiri text-3xl font-bold">
            <Users className="h-7 w-7 text-amber-500" /> الزبائن
          </h1>
          <p className="text-sm text-zinc-400">
            {customers.length} حساب · {optIn} وافقوا على استلام العروض. صدّر الأرقام للرسائل
            الجماعية على واتساب أو البريد.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/customers?optin=1"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-amber-400"
          >
            <Download className="h-4 w-4" /> CSV الموافقين على العروض
          </a>
          <a
            href="/api/admin/customers"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-amber-500/50"
          >
            <Download className="h-4 w-4" /> CSV الكل
          </a>
        </div>
      </div>
      {customers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
          لا حسابات بعد.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-zinc-900/60 text-right text-xs text-zinc-500">
              <tr>
                {[
                  'الاسم',
                  'الهاتف',
                  'البريد',
                  'المدينة',
                  'عروض',
                  'مشاركات',
                  'تقييمات',
                  'كوبونات',
                  'انضم',
                ].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 font-bold text-zinc-100">{c.name}</td>
                  <td className="px-3 py-2 text-zinc-300" dir="ltr">
                    {c.phone}
                  </td>
                  <td className="px-3 py-2 text-zinc-400" dir="ltr">
                    {c.email}
                  </td>
                  <td className="px-3 py-2 text-zinc-400">{c.city ?? '—'}</td>
                  <td className="px-3 py-2">{c.marketingOptIn ? '✅' : '—'}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">{c._count.entries}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">{c._count.reviews}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">{c._count.redemptions}</td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {formatArticleDate(toIsoDay(c.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
