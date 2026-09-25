import 'server-only';
import { db } from '@/lib/db';

const DAY = 24 * 60 * 60 * 1000;

export interface VisitsSummary {
  today: number;
  yesterday: number;
  week: number;
  month: number;
  /** آخر ١٤ يوماً بالترتيب من الأقدم للأحدث — للرسم العمودي */
  daily: { day: string; count: number }[];
  topPages: { path: string; count: number }[];
  sources: { name: string; count: number }[];
  devices: { mobile: number; desktop: number };
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * زيارات الموقع من جدول الأحداث نفسه — بلا خدمة تحليلات خارجية ولا بيانات تغادر الخادم.
 * `PAGE_VIEW` صفحة واحدة، و`VISIT` جلسة واحدة (تُسجَّل مرة عند أول صفحة).
 */
export async function getVisits(): Promise<VisitsSummary> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart.getTime() - DAY);
  const monthStart = new Date(todayStart.getTime() - 29 * DAY);
  const fortnightStart = new Date(todayStart.getTime() - 13 * DAY);

  const [today, yesterday, week, month, rawDaily, pages, sources, mobile, desktop] =
    await Promise.all([
      db.event.count({ where: { type: 'PAGE_VIEW', createdAt: { gte: todayStart } } }),
      db.event.count({
        where: { type: 'PAGE_VIEW', createdAt: { gte: yesterdayStart, lt: todayStart } },
      }),
      db.event.count({
        where: { type: 'PAGE_VIEW', createdAt: { gte: new Date(now.getTime() - 7 * DAY) } },
      }),
      db.event.count({ where: { type: 'PAGE_VIEW', createdAt: { gte: monthStart } } }),
      db.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*) AS count
        FROM events
        WHERE type = 'PAGE_VIEW' AND "createdAt" >= ${fortnightStart}
        GROUP BY 1 ORDER BY 1`,
      db.event.groupBy({
        by: ['key'],
        where: { type: 'PAGE_VIEW', createdAt: { gte: monthStart }, key: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { key: 'desc' } },
        take: 10,
      }),
      db.event.groupBy({
        by: ['key'],
        where: { type: 'VISIT', createdAt: { gte: monthStart }, key: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { key: 'desc' } },
        take: 8,
      }),
      db.event.count({ where: { type: 'VISIT', value: 1, createdAt: { gte: monthStart } } }),
      db.event.count({ where: { type: 'VISIT', value: 0, createdAt: { gte: monthStart } } }),
    ]);

  // أيام بلا زيارات لا تُعيدها القاعدة — نملأ الفراغات ليستقيم الرسم
  const byDay = new Map(
    rawDaily.map((r) => [startOfDay(new Date(r.day)).getTime(), Number(r.count)]),
  );
  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(fortnightStart.getTime() + i * DAY);
    return { day: d.toISOString().slice(0, 10), count: byDay.get(d.getTime()) ?? 0 };
  });

  return {
    today,
    yesterday,
    week,
    month,
    daily,
    topPages: pages.map((p) => ({ path: p.key as string, count: p._count._all })),
    sources: sources.map((s) => ({ name: s.key as string, count: s._count._all })),
    devices: { mobile, desktop },
  };
}
