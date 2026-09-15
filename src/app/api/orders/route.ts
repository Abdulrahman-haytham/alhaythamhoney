import { NextResponse } from 'next/server';
import { CommerceError } from '@/lib/commerce.server';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { orderInput } from '@/lib/validation';
import { createOrder } from '@/lib/quote.server';
import { currentCustomer } from '@/lib/customer-auth';

/** Save an authoritative quote before handing the customer to WhatsApp. */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'order-create', 20, 3600));
  if (denied) return denied;
  const parsed = orderInput.safeParse(await readJson(request, 32 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'طلب غير صالح.' },
      { status: 400 },
    );
  const customer = await currentCustomer();
  try {
    const { quote, order, replayed } = await createOrder(parsed.data, customer);
    if (!order)
      return NextResponse.json(
        { error: 'تغيّرت تفاصيل السلة. راجع الأسعار والأصناف ثم أعد تأكيد الطلب.', quote },
        { status: 409 },
      );
    return NextResponse.json(
      { reference: order.reference, quote },
      { status: replayed ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof CommerceError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[orders] creation failed');
    return NextResponse.json(
      { error: 'تعذّر حفظ الطلب الآن. سلتك محفوظة؛ أعد المحاولة.' },
      { status: 503 },
    );
  }
}
