import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { glossaryCategoryInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';

/** إنشاء مرحلة (تصنيف) في الموسوعة — تظهر في `/beekeeping` فور أن يكون لها مدخل منشور. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = glossaryCategoryInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  try {
    const category = await db.glossaryCategory.create({ data: parsed.data });
    await logAudit({
      entity: 'glossaryCategory',
      entityId: category.id,
      action: 'create',
      label: category.name,
    });
    return NextResponse.json({ id: category.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'مرحلة بهذا الاسم موجودة.' }, { status: 409 });
    throw error;
  }
}
