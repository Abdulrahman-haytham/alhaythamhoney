import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { glossaryCategoryInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

type Ctx = { params: Promise<{ id: string }> };

/**
 * تعديل مرحلة. تغيير الاسم ينقل كل مداخلها معه في المعاملة نفسها —
 * المدخل يحمل اسم التصنيف نصّاً، فلا يبقى مدخل يتيم باسم قديم.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = glossaryCategoryInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  const before = await db.glossaryCategory.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'المرحلة غير موجودة.' }, { status: 404 });
  let moved = 0;
  try {
    await db.$transaction(async (tx) => {
      await tx.glossaryCategory.update({ where: { id }, data: parsed.data });
      if (parsed.data.name !== before.name) {
        const res = await tx.glossaryEntry.updateMany({
          where: { category: before.name },
          data: { category: parsed.data.name },
        });
        moved = res.count;
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'مرحلة بهذا الاسم موجودة.' }, { status: 409 });
    throw error;
  }
  await logAudit({
    entity: 'glossaryCategory',
    entityId: id,
    action: 'update',
    label: parsed.data.name,
    before,
    after: { ...before, ...parsed.data },
  });
  return NextResponse.json({ ok: true, moved });
}

/** حذف مرحلة — مرفوض ما دام لها مداخل (انقلها أو احذفها أولاً). */
export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.glossaryCategory.findUnique({ where: { id }, select: { name: true } });
  if (!existing) return NextResponse.json({ error: 'المرحلة غير موجودة.' }, { status: 404 });
  const inUse = await db.glossaryEntry.count({ where: { category: existing.name } });
  if (inUse > 0)
    return NextResponse.json(
      { error: `لا يمكن حذف مرحلة فيها ${inUse} مدخلاً — انقل مداخلها إلى مرحلة أخرى أولاً.` },
      { status: 409 },
    );
  await db.glossaryCategory.delete({ where: { id } });
  await logAudit({
    entity: 'glossaryCategory',
    entityId: id,
    action: 'delete',
    label: existing.name,
  });
  return NextResponse.json({ ok: true });
}
