import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin, readJson } from '@/lib/request-security';
import { profileInput } from '@/lib/validation';
import { currentCustomer } from '@/lib/customer-auth';

export async function PATCH(request: Request) {
  const denied = checkOrigin(request);
  if (denied) return denied;
  const customer = await currentCustomer();
  if (!customer) return NextResponse.json({ error: 'سجّل الدخول أولاً.' }, { status: 401 });
  const parsed = profileInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  await db.customer.update({ where: { id: customer.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
