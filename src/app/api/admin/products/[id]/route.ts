import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { productInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

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
  const { relatedIds, ...data } = parsed.data;
  // المنتج لا يقترح نفسه؛ وتُستبدل القائمة كاملة بما اختاره الأدمن بالترتيب
  const related = relatedIds.filter((rid) => rid !== id);
  const before = await db.productRelation.findMany({
    where: { productId: id },
    orderBy: { sortOrder: 'asc' },
    select: { relatedId: true },
  });
  const updated = await db.product.update({
    where: { id },
    data: {
      ...data,
      detailedInfo: data.detailedInfo ?? Prisma.DbNull,
      related: {
        deleteMany: {},
        create: related.map((relatedId, sortOrder) => ({ relatedId, sortOrder })),
      },
    },
  });
  await logAudit({
    entity: 'product',
    entityId: id,
    action: 'update',
    label: updated.name,
    before: { ...product, relatedIds: before.map((r) => r.relatedId) },
    after: { ...updated, relatedIds: related },
  });
  return NextResponse.json({ ok: true });
}
