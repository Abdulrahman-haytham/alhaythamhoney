import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { stockAlertInput } from '@/lib/validation';
import { getSettings } from '@/lib/settings.server';
import { currentCustomer } from '@/lib/customer-auth';

/** «أعلمني عند التوفر» — بريد واحد لكل منتج؛ الحساب المسجّل يستخدم بريده تلقائياً. */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'stock-alert', 10, 3600));
  if (denied) return denied;
  const settings = await getSettings();
  if (!settings.stockAlertsEnabled)
    return NextResponse.json({ error: 'الميزة غير مفعّلة حالياً.' }, { status: 404 });
  const customer = await currentCustomer();
  const raw = (await readJson(request)) as Record<string, unknown> | null;
  const parsed = stockAlertInput.safeParse(
    customer && raw ? { ...raw, email: customer.email } : raw,
  );
  if (!parsed.success) return NextResponse.json({ error: 'بريد غير صالح.' }, { status: 400 });
  const product = await db.product.findFirst({
    where: { id: parsed.data.productId, published: true },
    select: { id: true },
  });
  if (!product) return NextResponse.json({ error: 'المنتج غير موجود.' }, { status: 404 });
  await db.stockAlert.upsert({
    where: { productId_email: { productId: product.id, email: parsed.data.email } },
    create: { productId: product.id, email: parsed.data.email, customerId: customer?.id ?? null },
    // طلب جديد بعد إشعار سابق يعيد فتحه
    update: { notifiedAt: null, customerId: customer?.id ?? null },
  });
  return NextResponse.json({ ok: true });
}
