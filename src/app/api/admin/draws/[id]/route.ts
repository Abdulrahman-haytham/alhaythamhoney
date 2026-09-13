import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { drawInput } from '@/lib/validation';
import { toDrawData } from '@/lib/draws.admin';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = drawInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const { id } = await params;
  const existing = await db.draw.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return NextResponse.json({ error: 'السحب غير موجود.' }, { status: 404 });
  // بعد إعلان الفائز لا يُعاد فتح السحب — الحالة DRAWN تُضبط من زر «اسحب الفائز» فقط
  if (existing.status === 'DRAWN' && parsed.data.status !== 'DRAWN')
    return NextResponse.json({ error: 'سحب مُعلن لا يُعاد فتحه.' }, { status: 400 });
  if (existing.status !== 'DRAWN' && parsed.data.status === 'DRAWN')
    return NextResponse.json({ error: 'استخدم زر «اسحب الفائز» لإعلان النتيجة.' }, { status: 400 });
  try {
    await db.draw.update({ where: { id }, data: toDrawData(parsed.data) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
      return NextResponse.json({ error: 'السحب غير موجود.' }, { status: 404 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const deleted = await db.draw.deleteMany({ where: { id, status: { not: 'DRAWN' } } });
  if (deleted.count === 0)
    return NextResponse.json({ error: 'السحب غير موجود أو أُعلن فائزه.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
