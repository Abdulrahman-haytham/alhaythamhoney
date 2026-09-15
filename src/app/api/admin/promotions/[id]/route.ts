import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { promotionInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { toPromotionData } from '@/lib/promotions.admin';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = promotionInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  try {
    const before = await db.promotion.findUnique({ where: { id } });
    const after = await db.promotion.update({ where: { id }, data: toPromotionData(parsed.data) });
    await logAudit({
      entity: 'promotion',
      entityId: id,
      action: 'update',
      label: after.title,
      before: before ?? undefined,
      after,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
      return NextResponse.json({ error: 'العرض غير موجود.' }, { status: 404 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.promotion.findUnique({ where: { id }, select: { title: true } });
  const deleted = await db.promotion.deleteMany({ where: { id } });
  if (deleted.count === 0) return NextResponse.json({ error: 'العرض غير موجود.' }, { status: 404 });
  await logAudit({ entity: 'promotion', entityId: id, action: 'delete', label: existing?.title });
  return NextResponse.json({ ok: true });
}
