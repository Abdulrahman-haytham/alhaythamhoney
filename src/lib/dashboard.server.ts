import 'server-only';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings.server';

const DAY = 24 * 60 * 60 * 1000;

async function countEvents(
  type: 'WHATSAPP_CLICK' | 'CHECKOUT' | 'PRODUCT_VIEW' | 'ADD_TO_CART' | 'SEARCH',
  since: Date,
) {
  return db.event.count({ where: { type, createdAt: { gte: since } } });
}

/** أكثر المفاتيح تكراراً لنوع حدث خلال فترة — مثلاً أكثر المنتجات مشاهدةً. */
async function topKeys(
  type: 'PRODUCT_VIEW' | 'ADD_TO_CART' | 'SEARCH' | 'WHATSAPP_CLICK',
  since: Date,
  take = 8,
  extra: { value?: number } = {},
) {
  const rows = await db.event.groupBy({
    by: ['key'],
    where: { type, createdAt: { gte: since }, key: { not: null }, ...extra },
    _count: { _all: true },
    orderBy: { _count: { key: 'desc' } },
    take,
  });
  return rows.map((r) => ({ key: r.key as string, count: r._count._all }));
}

/**
 * مؤشرات لوحة التحكم (Odoo dashboard): نوايا الطلب، الأكثر مشاهدةً، ما يُبحث عنه ولا يوجد،
 * المخزون المنخفض، وما ينتظر قرار الأدمن.
 */
export async function getDashboard() {
  const now = Date.now();
  const today = new Date(now - DAY);
  const week = new Date(now - 7 * DAY);
  const month = new Date(now - 30 * DAY);
  const settings = await getSettings();

  const [
    waToday,
    waWeek,
    waMonth,
    checkoutWeek,
    viewsWeek,
    addsWeek,
    searchesMonth,
    ordersByStatus,
    ordersWeek,
    revenueMonth,
    topViewed,
    topAdded,
    topSearches,
    zeroSearches,
    lowStock,
    pendingReviews,
    customersTotal,
    customersWeek,
    redemptionsMonth,
    openDraw,
    recentAudit,
  ] = await Promise.all([
    countEvents('WHATSAPP_CLICK', today),
    countEvents('WHATSAPP_CLICK', week),
    countEvents('WHATSAPP_CLICK', month),
    countEvents('CHECKOUT', week),
    countEvents('PRODUCT_VIEW', week),
    countEvents('ADD_TO_CART', week),
    countEvents('SEARCH', month),
    db.order.groupBy({ by: ['status'], _count: { _all: true } }),
    db.order.count({ where: { createdAt: { gte: week } } }),
    db.order.aggregate({
      where: { confirmedAt: { gte: month }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    topKeys('PRODUCT_VIEW', week),
    topKeys('ADD_TO_CART', week),
    topKeys('SEARCH', month),
    topKeys('SEARCH', month, 8, { value: 0 }),
    db.product.findMany({
      where: {
        published: true,
        OR: [{ stockQty: { lte: settings.lowStockThreshold } }, { inStock: false }],
      },
      select: { id: true, name: true, stockQty: true, inStock: true },
      orderBy: { stockQty: 'asc' },
      take: 10,
    }),
    db.review.count({ where: { status: 'PENDING' } }),
    db.customer.count(),
    db.customer.count({ where: { createdAt: { gte: week } } }),
    db.couponRedemption.count({ where: { createdAt: { gte: month } } }),
    db.draw.findFirst({
      where: { status: 'OPEN' },
      select: { title: true, endsAt: true, _count: { select: { entries: true } } },
    }),
    db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);

  // أسماء المنتجات للمفاتيح (المفتاح = معرّف المنتج)
  const productIds = [...new Set([...topViewed, ...topAdded].map((t) => t.key))];
  const products = productIds.length
    ? await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const name = (id: string) => products.find((p) => p.id === id);

  return {
    whatsapp: { today: waToday, week: waWeek, month: waMonth },
    funnel: { views: viewsWeek, adds: addsWeek, checkouts: checkoutWeek },
    orders: {
      byStatus: Object.fromEntries(ordersByStatus.map((o) => [o.status, o._count._all])),
      week: ordersWeek,
      confirmedMonth: revenueMonth._count._all,
      revenueMonth: revenueMonth._sum.total ?? 0,
    },
    topViewed: topViewed.map((t) => ({ ...t, product: name(t.key) ?? null })),
    topAdded: topAdded.map((t) => ({ ...t, product: name(t.key) ?? null })),
    searches: { total: searchesMonth, top: topSearches, zero: zeroSearches },
    lowStock,
    pendingReviews,
    customers: { total: customersTotal, week: customersWeek },
    redemptionsMonth,
    openDraw,
    recentAudit,
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;
