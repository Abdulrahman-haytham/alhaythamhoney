import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { couponInput } from '@/lib/validation';
import { toCouponData } from '@/lib/coupons.server';
import { logAudit } from '@/lib/audit.server';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = couponInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  try {
    const before = await db.coupon.findUnique({ where: { id } });
    const after = await db.coupon.update({ where: { id }, data: toCouponData(parsed.data) });
    await logAudit({
      entity: 'coupon',
      entityId: id,
      action: 'update',
      label: after.code,
      before: before ?? undefined,
      after,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'هذا الكود مستخدم بالفعل.' }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
      return NextResponse.json({ error: 'الكوبون غير موجود.' }, { status: 404 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.coupon.findUnique({ where: { id }, select: { code: true } });
  const deleted = await db.coupon.deleteMany({ where: { id } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'الكوبون غير موجود.' }, { status: 404 });
  await logAudit({ entity: 'coupon', entityId: id, action: 'delete', label: existing?.code });
  return NextResponse.json({ ok: true });
}
