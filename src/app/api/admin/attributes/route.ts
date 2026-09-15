import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { attributeInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { syncAttributeValues } from '@/lib/attributes.admin';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = attributeInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  try {
    const attribute = await db.$transaction(async (tx) => {
      const created = await tx.attribute.create({
        data: { name: parsed.data.name, sortOrder: parsed.data.sortOrder },
      });
      await syncAttributeValues(tx, created.id, parsed.data.values);
      return created;
    });
    await logAudit({
      entity: 'attribute',
      entityId: attribute.id,
      action: 'create',
      label: attribute.name,
    });
    return NextResponse.json({ id: attribute.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'خاصية بهذا الاسم موجودة.' }, { status: 409 });
    throw error;
  }
}
