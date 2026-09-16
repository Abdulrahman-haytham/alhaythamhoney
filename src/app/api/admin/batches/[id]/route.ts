import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { batchInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { toBatchData } from '@/lib/batches.server';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = batchInput.safeParse(await readJson(request, 64 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  try {
    const before = await db.batch.findUnique({ where: { id } });
    const after = await db.batch.update({ where: { id }, data: toBatchData(parsed.data) });
    await logAudit({
      entity: 'batch',
      entityId: id,
      action: 'update',
      label: after.code,
      before: before ?? undefined,
      after,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'رمز الدفعة مستخدم.' }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
      return NextResponse.json({ error: 'الدفعة غير موجودة.' }, { status: 404 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.batch.findUnique({ where: { id }, select: { code: true } });
  const deleted = await db.batch.deleteMany({ where: { id } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'الدفعة غير موجودة.' }, { status: 404 });
  await logAudit({ entity: 'batch', entityId: id, action: 'delete', label: existing?.code });
  return NextResponse.json({ ok: true });
}
