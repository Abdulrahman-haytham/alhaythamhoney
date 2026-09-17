import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { glossaryInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { ensureGlossaryCategory, toGlossaryData } from '@/lib/glossary.admin';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = glossaryInput.safeParse(await readJson(request, 32 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  const before = await db.glossaryEntry.findUnique({
    where: { id },
    include: { products: { select: { id: true } } },
  });
  if (!before) return NextResponse.json({ error: 'المدخل غير موجود.' }, { status: 404 });
  if (before.slug !== parsed.data.slug)
    return NextResponse.json(
      { error: 'رابط المدخل ثابت لحماية الروابط المنشورة ونتائج البحث.' },
      { status: 400 },
    );
  const after = await db.$transaction(async (tx) => {
    await ensureGlossaryCategory(tx, parsed.data.category);
    return tx.glossaryEntry.update({
      where: { id },
      data: toGlossaryData(parsed.data),
      include: { products: { select: { id: true } } },
    });
  });
  await logAudit({
    entity: 'glossary',
    entityId: id,
    action: 'update',
    label: after.name,
    before: { ...before, products: before.products.map((p) => p.id) },
    after: { ...after, products: after.products.map((p) => p.id) },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const existing = await db.glossaryEntry.findUnique({ where: { id }, select: { name: true } });
  const deleted = await db.glossaryEntry.deleteMany({ where: { id } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'المدخل غير موجود.' }, { status: 404 });
  await logAudit({ entity: 'glossary', entityId: id, action: 'delete', label: existing?.name });
  return NextResponse.json({ ok: true });
}
