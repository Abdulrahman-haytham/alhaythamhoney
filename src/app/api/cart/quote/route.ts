import { NextResponse } from 'next/server';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { quoteInput } from '@/lib/validation';
import { quoteCart } from '@/lib/quote.server';
import { currentCustomer } from '@/lib/customer-auth';

/** تسعير السلة على الخادم (خصومات الكمية، العروض، الكوبون، الشحن) — يُستدعى عند كل تغيير. */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'cart-quote', 120, 600));
  if (denied) return denied;
  const parsed = quoteInput.safeParse(await readJson(request, 32 * 1024));
  if (!parsed.success) return NextResponse.json({ error: 'سلة غير صالحة.' }, { status: 400 });
  const customer = await currentCustomer();
  return NextResponse.json(await quoteCart(parsed.data, customer));
}
