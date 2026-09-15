import { db } from '@/lib/db';
import type { OrderStatus } from '@prisma/client';
import { ORDER_STATUSES } from '@/lib/orders';
import { OrdersPanel } from './OrdersPanel';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const statusFilter = ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : null;
  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(q
          ? {
              OR: [
                { reference: { contains: q.toUpperCase() } },
                { customerName: { contains: q, mode: 'insensitive' } },
                { customerPhone: { contains: q.replace(/\D/g, '') || q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { items: true, customer: { select: { email: true } } },
    }),
    db.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">الطلبات</h1>
      <p className="mb-6 text-sm text-zinc-400">
        يُسجَّل الطلب لحظة ضغط الزبون «أكمل الطلب عبر واتساب» بالأسعار المحسوبة على الخادم. أكّده
        بعد الاتفاق على واتساب، ثم حدّث حالته ليتابعه الزبون من صفحة التتبع.
      </p>
      <OrdersPanel
        orders={orders.map((o) => ({
          id: o.id,
          reference: o.reference,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
          confirmedAt: o.confirmedAt?.toISOString() ?? null,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerCity: o.customerCity,
          customerEmail: o.customer?.email ?? null,
          subtotal: o.subtotal,
          discount: o.discount,
          shipping: o.shipping,
          total: o.total,
          couponCode: o.couponCode,
          notes: o.notes,
          items: o.items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            weight: i.weight,
            recipe: i.recipe,
          })),
        }))}
        counts={Object.fromEntries(counts.map((c) => [c.status, c._count._all]))}
        activeStatus={statusFilter}
        query={q ?? ''}
      />
    </>
  );
}
