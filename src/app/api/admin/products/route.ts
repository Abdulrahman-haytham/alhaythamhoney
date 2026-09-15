import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { productInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { syncTiers, syncVariants, toProductScalars } from '@/lib/products.admin';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = productInput.safeParse(await readJson(request, 64 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول ورابط الصورة.' },
      { status: 400 },
    );
  try {
    const { relatedIds, variants, tiers } = parsed.data;
    const product = await db.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...toProductScalars(parsed.data),
          related: {
            create: relatedIds.map((relatedId, sortOrder) => ({ relatedId, sortOrder })),
          },
        },
      });
      await syncVariants(tx, created.id, variants);
      await syncTiers(tx, created.id, tiers);
      return created;
    });
    await logAudit({
      entity: 'product',
      entityId: product.id,
      action: 'create',
      label: product.name,
    });
    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'رابط المنتج مستخدم بالفعل.' }, { status: 409 });
    }
    throw error;
  }
}
