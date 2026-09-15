import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { productInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { syncTiers, syncVariants, toProductScalars } from '@/lib/products.admin';

const snapshot = (p: {
  related: { relatedId: string }[];
  variants: { label: string; price: number; stockQty: number | null; inStock: boolean }[];
  tiers: { minQty: number; discountPercent: number }[];
}) => ({
  relatedIds: p.related.map((r) => r.relatedId),
  variants: p.variants.map((v) => `${v.label}: ${v.price}${v.inStock ? '' : ' (غير متوفر)'}`),
  tiers: p.tiers.map((t) => `${t.minQty}+ → ${t.discountPercent}%`),
});

const include = {
  related: { orderBy: { sortOrder: 'asc' as const }, select: { relatedId: true } },
  variants: { orderBy: { sortOrder: 'asc' as const } },
  tiers: { orderBy: { minQty: 'asc' as const } },
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = productInput.safeParse(await readJson(request, 64 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول ورابط الصورة.' },
      { status: 400 },
    );
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, include });
  if (!product) return NextResponse.json({ error: 'المنتج غير موجود.' }, { status: 404 });
  if (product.slug !== parsed.data.slug) {
    return NextResponse.json(
      { error: 'رابط المنتج ثابت لحماية الروابط المنشورة ونتائج البحث.' },
      { status: 400 },
    );
  }
  const { relatedIds, variants, tiers } = parsed.data;
  // المنتج لا يقترح نفسه؛ وتُستبدل القائمة كاملة بما اختاره الأدمن بالترتيب
  const related = relatedIds.filter((rid) => rid !== id);
  const updated = await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...toProductScalars(parsed.data),
        related: {
          deleteMany: {},
          create: related.map((relatedId, sortOrder) => ({ relatedId, sortOrder })),
        },
      },
    });
    await syncVariants(tx, id, variants);
    await syncTiers(tx, id, tiers);
    return tx.product.findUniqueOrThrow({ where: { id }, include });
  });
  await logAudit({
    entity: 'product',
    entityId: id,
    action: 'update',
    label: updated.name,
    before: { ...product, ...snapshot(product) },
    after: { ...updated, ...snapshot(updated) },
  });
  return NextResponse.json({ ok: true });
}
