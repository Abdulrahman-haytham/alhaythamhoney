import 'server-only';
import type { Order, OrderStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { onOrderCancelled, onOrderConfirmed } from '@/lib/loyalty.server';

/**
 * تطبيق حالة جديدة على الطلب. التأكيد الأول (أي حالة بعد PENDING غير الإلغاء)
 * يثبّت confirmedAt مرة واحدة ويمنح نقاط الولاء ومكافأة الإحالة؛ والإلغاء يعيد النقاط.
 */
export async function applyOrderStatus(order: Order, status: OrderStatus, notes: string | null) {
  const confirming = status !== 'PENDING' && status !== 'CANCELLED' && !order.confirmedAt;
  const cancelling = status === 'CANCELLED' && order.status !== 'CANCELLED';
  const updated = await db.order.update({
    where: { id: order.id },
    data: { status, notes, ...(confirming ? { confirmedAt: new Date() } : {}) },
  });
  if (confirming) await onOrderConfirmed(updated);
  if (cancelling) await onOrderCancelled(updated);
  return updated;
}
