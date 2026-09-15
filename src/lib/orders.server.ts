import 'server-only';
import type { Order, OrderStatus } from '@prisma/client';
import { db } from '@/lib/db';

/**
 * تطبيق حالة جديدة على الطلب. التأكيد الأول (أي حالة بعد PENDING غير الإلغاء)
 * يثبّت confirmedAt مرة واحدة — هو ما تبنى عليه مكافآت الولاء لاحقاً.
 */
export async function applyOrderStatus(order: Order, status: OrderStatus, notes: string | null) {
  const confirming = status !== 'PENDING' && status !== 'CANCELLED' && !order.confirmedAt;
  return db.order.update({
    where: { id: order.id },
    data: { status, notes, ...(confirming ? { confirmedAt: new Date() } : {}) },
  });
}
