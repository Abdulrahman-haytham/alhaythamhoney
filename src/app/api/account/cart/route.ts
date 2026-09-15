import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { cartSyncInput } from '@/lib/validation';
import { currentCustomer } from '@/lib/customer-auth';

/**
 * نسخة السلة للحساب المسجّل — أساس بريد «سلتك بانتظارك» من cron.
 * السلة الفارغة تمسح النسخة حتى لا يُذكَّر أحد بما اشتراه أو حذفه.
 */
export async function PUT(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'cart-sync', 120, 600));
  if (denied) return denied;
  const customer = await currentCustomer();
  if (!customer) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = cartSyncInput.safeParse(await readJson(request, 32 * 1024));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const empty = parsed.data.items.length === 0;
  await db.customer.update({
    where: { id: customer.id },
    data: empty
      ? { cartJson: { items: [] }, cartUpdatedAt: null, cartRemindedAt: null }
      : { cartJson: { items: parsed.data.items }, cartUpdatedAt: new Date(), cartRemindedAt: null },
  });
  return NextResponse.json({ ok: true });
}
