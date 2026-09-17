import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { glossaryInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { ensureGlossaryCategory, toGlossaryData } from '@/lib/glossary.admin';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = glossaryInput.safeParse(await readJson(request, 32 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  try {
    const { products, ...data } = toGlossaryData(parsed.data);
    const entry = await db.$transaction(async (tx) => {
      await ensureGlossaryCategory(tx, data.category);
      return tx.glossaryEntry.create({ data: { ...data, products: { connect: products.set } } });
    });
    await logAudit({ entity: 'glossary', entityId: entry.id, action: 'create', label: entry.name });
    return NextResponse.json({ id: entry.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'رابط المدخل مستخدم بالفعل.' }, { status: 409 });
    throw error;
  }
}
