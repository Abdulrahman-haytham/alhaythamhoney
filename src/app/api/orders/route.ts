import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { orderInput } from '@/lib/validation';
import { createOrder } from '@/lib/quote.server';
import { currentCustomer } from '@/lib/customer-auth';

/**
 * يُسجَّل الطلب لحظة الضغط على «أكمل الطلب عبر واتساب» بمرجع ولّده المتصفح
 * (حتى يكون في الرسالة فوراً). الأسعار تُحسب هنا لا تُقبل من الطلب.
 */
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
    const { quote, order } = await createOrder(parsed.data, customer);
    if (!order) return NextResponse.json({ error: 'لا بنود متاحة في السلة.' }, { status: 400 });
    return NextResponse.json({ reference: order.reference, quote }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'مرجع مكرر — أعد المحاولة.' }, { status: 409 });
    throw error;
  }
}
