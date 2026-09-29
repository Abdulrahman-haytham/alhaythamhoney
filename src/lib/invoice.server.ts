import 'server-only';
import { db } from '@/lib/db';
import { normalizeOrderReference } from '@/lib/orders';
import type { QuoteAdjustment } from '@/lib/pricing';

export interface InvoiceBreakdown {
  adjustments?: QuoteAdjustment[];
  freeShipping?: boolean;
  shippingLabel?: string | null;
}

/**
 * الطلب كما تعرضه الفاتورة — بلا اسم ولا هاتف، كصفحة التتبّع: المرجع وحده يفتحها،
 * وهو عشوائي ولا يظهر إلا في رسالة الزبون نفسه.
 */
export async function getInvoiceOrder(rawReference: string) {
  const reference = normalizeOrderReference(rawReference);
  if (!reference) return null;
  const order = await db.order.findUnique({
    where: { reference },
    select: {
      reference: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      subtotal: true,
      discount: true,
      shipping: true,
      total: true,
      breakdown: true,
      items: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          weight: true,
          image: true,
          recipe: true,
        },
      },
    },
  });
  if (!order) return null;
  return { ...order, breakdown: (order.breakdown ?? {}) as InvoiceBreakdown };
}
