import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { reviewInput } from '@/lib/validation';
import { currentCustomer } from '@/lib/customer-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'reviews', 5, 3600));
  if (denied) return denied;
  const parsed = reviewInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: 'تحقق من الاسم والتقييم ونص الرأي (10–1000 حرف).' },
      { status: 400 },
    );
  const { productSlug, ...data } = parsed.data;
  let productId: string | null = null;
  if (productSlug) {
    const product = await db.product.findFirst({
      where: { slug: productSlug, published: true },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: 'المنتج غير موجود.' }, { status: 400 });
    productId = product.id;
  }
  // لا هوية طلب موثّقة (الطلب عبر واتساب) — لكن الحساب المسجّل يمنح شارة «حساب موثّق»
  const customer = await currentCustomer();
  await db.review.create({
    data: {
      ...data,
      productId,
      orderRef: null,
      status: 'PENDING',
      customerId: customer?.id ?? null,
    },
  });
  return NextResponse.json(
    { ok: true, message: 'شكراً لك! سيظهر رأيك بعد المراجعة.' },
    { status: 201 },
  );
}
