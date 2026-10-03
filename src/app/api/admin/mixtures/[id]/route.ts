import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { mixtureInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { toIngredientData, toMixtureScalars } from '@/lib/mixtures.admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const snapshot = (m: {
  ingredients: { name: string; pricePerGram: number; recommended: number }[];
}) => ({
  ingredients: m.ingredients.map((i) => `${i.name}: ${i.recommended}غ × ${i.pricePerGram}`),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = mixtureInput.safeParse(await readJson(request, 64 * 1024));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الأسعار والحدود ومقادير المكونات.' },
      { status: 400 },
    );
  const { id } = await params;
  const mixture = await db.mixture.findUnique({ where: { id }, include: { ingredients: true } });
  if (!mixture) return NextResponse.json({ error: 'الخلطة غير موجودة.' }, { status: 404 });
  const body = parsed.data;
  if (body.slug !== mixture.slug)
    return NextResponse.json(
      { error: 'رابط الخلطة ثابت لحماية الروابط المنشورة ونتائج البحث.' },
      { status: 400 },
    );
  const known = new Set(mixture.ingredients.map((i) => i.id));
  if (body.ingredients.some((i) => i.id && !known.has(i.id)))
    return NextResponse.json({ error: 'مكوّن غير معروف — حدّث الصفحة.' }, { status: 400 });
  const kept = body.ingredients.flatMap((i) => (i.id ? [i.id] : []));
  const updated = await db.$transaction(async (tx) => {
    await tx.mixture.update({ where: { id }, data: toMixtureScalars(body) });
    // ما غاب عن القائمة حُذف من الوصفة؛ الجديد (بلا معرّف) يُنشأ؛ والترتيب كما رتّبه الأدمن
    await tx.mixtureIngredient.deleteMany({ where: { mixtureId: id, id: { notIn: kept } } });
    for (const [index, ingredient] of body.ingredients.entries()) {
      const data = toIngredientData(ingredient, index);
      if (ingredient.id) await tx.mixtureIngredient.update({ where: { id: ingredient.id }, data });
      else await tx.mixtureIngredient.create({ data: { ...data, mixtureId: id } });
    }
    return tx.mixture.findUniqueOrThrow({
      where: { id },
      include: { ingredients: { orderBy: { sortOrder: 'asc' } } },
    });
  });
  await logAudit({
    entity: 'mixture',
    entityId: id,
    action: 'update',
    label: updated.name,
    before: { ...mixture, ...snapshot(mixture) },
    after: { ...updated, ...snapshot(updated) },
  });
  return NextResponse.json({
    ok: true,
    ingredients: updated.ingredients.map((i) => ({ id: i.id, name: i.name })),
  });
}

/** حذف نهائي للخلطة ومكوّناتها. الطلبات السابقة تحتفظ بنسختها من الوصفة والسعر. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const mixture = await db.mixture.findUnique({ where: { id }, select: { name: true } });
  if (!mixture) return NextResponse.json({ error: 'الخلطة غير موجودة.' }, { status: 404 });
  await db.mixture.delete({ where: { id } });
  await logAudit({ entity: 'mixture', entityId: id, action: 'delete', label: mixture.name });
  return NextResponse.json({ ok: true });
}
