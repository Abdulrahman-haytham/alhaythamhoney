import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Incoming {
  productSlug?: string;
  authorName?: string;
  authorCity?: string;
  rating?: number;
  body?: string;
  orderRef?: string;
}

/** إرسال تقييم — يبقى PENDING حتى يعتمده الأدمن. */
export async function POST(request: Request) {
  let payload: Incoming;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  }

  const authorName = payload.authorName?.trim();
  const body = payload.body?.trim();
  const rating = Number(payload.rating);

  if (!authorName || authorName.length < 2 || authorName.length > 60) {
    return NextResponse.json({ error: 'الاسم مطلوب (حرفان على الأقل).' }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'التقييم يجب أن يكون بين 1 و 5.' }, { status: 400 });
  }
  if (!body || body.length < 10 || body.length > 1000) {
    return NextResponse.json({ error: 'اكتب رأيك في 10 أحرف على الأقل.' }, { status: 400 });
  }

  // ربط بالمنتج إن أُرسل، وإلا فهو تقييم عام للمتجر
  let productId: string | null = null;
  if (payload.productSlug) {
    const product = await db.product.findUnique({
      where: { slug: payload.productSlug },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود.' }, { status: 400 });
    }
    productId = product.id;
  }

  // مرجع الطلب يُقبل فقط إن كان طلباً حقيقياً بنفس الرقم — أساس وسم «شراء موثّق»
  let orderRef: string | null = null;
  const ref = payload.orderRef?.trim();
  if (ref) {
    const order = await db.order.findUnique({ where: { reference: ref }, select: { id: true } });
    if (order) orderRef = ref;
  }

  await db.review.create({
    data: {
      productId,
      authorName,
      authorCity: payload.authorCity?.trim().slice(0, 40) || null,
      rating,
      body,
      orderRef,
      status: 'PENDING',
    },
  });

  return NextResponse.json(
    { ok: true, message: 'شكراً لك! سيظهر رأيك بعد المراجعة.' },
    { status: 201 }
  );
}