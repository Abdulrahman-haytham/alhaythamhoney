import 'server-only';
import type { OrderStatus } from '@prisma/client';
import { commerceTransaction, CommerceError } from '@/lib/commerce.server';
import { canTransitionOrder } from '@/lib/orders';
import { deliverRewardMails, onOrderCancelled, onOrderConfirmed } from '@/lib/loyalty.server';

/**
 * تطبيق حالة جديدة على الطلب داخل القفل التجاري: التأكيد الأول (أي حالة بعد PENDING
 * غير الإلغاء) يثبّت confirmedAt مرة واحدة ويمنح نقاط الولاء ومكافأة الإحالة،
 * والإلغاء يسوّي النقاط ويحرّر الكوبون. رسائل المكافآت تُرسَل بعد إغلاق المعاملة.
 */
export async function applyOrderStatus(
  id: string,
  status: OrderStatus,
  notes: string | null,
  followUpAt?: string | null,
  cancellationReason?: string | null,
  contact: { customerName?: string | null; customerPhone?: string | null } = {},
) {
  const { updated, mails } = await commerceTransaction(async (tx) => {
    // تُقرأ الحالة بعد أخذ القفل: لقطة المُستدعي قد تكون قديمة
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) throw new CommerceError('الطلب غير موجود.', 404);
    if (!canTransitionOrder(order.status, status))
      throw new CommerceError('لا يمكن إعادة الطلب إلى مرحلة سابقة. أنشئ طلباً جديداً عند الحاجة.');
    const reason = cancellationReason === undefined ? order.cancellationReason : cancellationReason;
    if (status === 'CANCELLED' && order.status !== 'CANCELLED' && !reason)
      throw new CommerceError('اكتب سبب الإلغاء ليظهر في تحليل الطلبات.', 400);
    const confirming = status !== 'PENDING' && status !== 'CANCELLED' && !order.confirmedAt;
    const cancelling = status === 'CANCELLED' && order.status !== 'CANCELLED';
    const updated = await tx.order.update({
      where: { id },
      data: {
        status,
        notes,
        ...contact,
        // المتابعة تسقط عند التسليم أو الإلغاء، وتبقى كما هي إن لم يرسلها الأدمن
        followUpAt:
          status === 'CANCELLED' || status === 'DELIVERED'
            ? null
            : followUpAt === undefined
              ? order.followUpAt
              : followUpAt
                ? new Date(followUpAt)
                : null,
        cancellationReason: status === 'CANCELLED' ? reason : null,
        ...(confirming ? { confirmedAt: new Date() } : {}),
        ...(status === 'DELIVERED' && !order.deliveredAt ? { deliveredAt: new Date() } : {}),
      },
    });
    const mails = confirming ? await onOrderConfirmed(tx, updated) : [];
    if (cancelling) await onOrderCancelled(tx, updated);
    return { updated, mails };
  });
  await deliverRewardMails(mails);
  return updated;
}
