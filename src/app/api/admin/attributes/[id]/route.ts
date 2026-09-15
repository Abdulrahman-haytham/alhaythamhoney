import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { attributeInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { syncAttributeValues } from '@/lib/attributes.admin';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = attributeInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  const before = await db.attribute.findUnique({
    where: { id },
    include: { values: { orderBy: { sortOrder: 'asc' }, select: { value: true } } },
  });
  if (!before) return NextResponse.json({ error: 'الخاصية غير موجودة.' }, { status: 404 });
  try {
    await db.$transaction(async (tx) => {
      await tx.attribute.update({
        where: { id },
        data: { name: parsed.data.name, sortOrder: parsed.data.sortOrder },
      });
      await syncAttributeValues(tx, id, parsed.data.values);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'خاصية بهذا الاسم موجودة.' }, { status: 409 });
    throw error;
  }
  await logAudit({
    entity: 'attribute',
    entityId: id,
    action: 'update',
    label: parsed.data.name,
    before: { name: before.name, values: before.values.map((v) => v.value) },
    after: { name: parsed.data.name, values: parsed.data.values },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.attribute.findUnique({ where: { id }, select: { name: true } });
  const deleted = await db.attribute.deleteMany({ where: { id } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'الخاصية غير موجودة.' }, { status: 404 });
  await logAudit({ entity: 'attribute', entityId: id, action: 'delete', label: existing?.name });
  return NextResponse.json({ ok: true });
}
