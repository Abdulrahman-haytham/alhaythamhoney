import { NextResponse } from 'next/server';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { enterDrawInput } from '@/lib/validation';
import { currentCustomer } from '@/lib/customer-auth';
import { enterDraw } from '@/lib/draws.server';

export async function POST(request: Request) {
  const denied = checkOrigin(request);
  if (denied) return denied;
  const customer = await currentCustomer();
  if (!customer) return NextResponse.json({ error: 'سجّل الدخول للمشاركة.' }, { status: 401 });
  // حدّ لكل حساب حتى لا تُخمَّن الرموز
  const limited = await rateLimit(request, 'draw-enter', 20, 3600, customer.id);
  if (limited) return limited;
  const parsed = enterDrawInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const result = await enterDraw(customer.id, parsed.data.code);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });
  return NextResponse.json(result);
}
