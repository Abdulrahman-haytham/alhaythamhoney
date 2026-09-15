import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { zoneInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = zoneInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  try {
    const before = await db.shippingZone.findUnique({ where: { id } });
    const after = await db.shippingZone.update({ where: { id }, data: parsed.data });
    await logAudit({
      entity: 'zone',
      entityId: id,
      action: 'update',
      label: after.name,
      before: before ?? undefined,
      after,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'هذه المنطقة موجودة.' }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
      return NextResponse.json({ error: 'المنطقة غير موجودة.' }, { status: 404 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.shippingZone.findUnique({ where: { id }, select: { name: true } });
  const deleted = await db.shippingZone.deleteMany({ where: { id } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'المنطقة غير موجودة.' }, { status: 404 });
  await logAudit({ entity: 'zone', entityId: id, action: 'delete', label: existing?.name });
  return NextResponse.json({ ok: true });
}
