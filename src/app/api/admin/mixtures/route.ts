import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { mixtureInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { toIngredientData, toMixtureScalars } from '@/lib/mixtures.admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** خلطة جديدة بمكوّناتها. تُضاف في آخر الترتيب. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = mixtureInput.safeParse(await readJson(request, 64 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول والمقادير.' },
      { status: 400 },
    );
  try {
    const last = await db.mixture.aggregate({ _max: { sortOrder: true } });
    const mixture = await db.mixture.create({
      data: {
        ...toMixtureScalars(parsed.data),
        // بلا ترتيب محدّد تُضاف في الآخر
        sortOrder: parsed.data.sortOrder || (last._max.sortOrder ?? -1) + 1,
        ingredients: { create: parsed.data.ingredients.map(toIngredientData) },
      },
    });
    await logAudit({
      entity: 'mixture',
      entityId: mixture.id,
      action: 'create',
      label: mixture.name,
    });
    return NextResponse.json({ id: mixture.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'رابط الخلطة مستخدم بالفعل.' }, { status: 409 });
    throw error;
  }
}
