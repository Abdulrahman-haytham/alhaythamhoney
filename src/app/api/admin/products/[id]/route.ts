import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { productInput } from '@/lib/validation';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = productInput.safeParse(await readJson(request, 32 * 1024));
  if (!parsed.success)
    return NextResponse.json({ error: 'تحقق من الحقول ورابط الصورة.' }, { status: 400 });
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'المنتج غير موجود.' }, { status: 404 });
  if (product.slug !== parsed.data.slug) {
    return NextResponse.json(
      { error: 'رابط المنتج ثابت لحماية الروابط المنشورة ونتائج البحث.' },
      { status: 400 },
    );
  }
  await db.product.update({
    where: { id },
    data: { ...parsed.data, detailedInfo: parsed.data.detailedInfo ?? Prisma.DbNull },
  });
  return NextResponse.json({ ok: true });
}
