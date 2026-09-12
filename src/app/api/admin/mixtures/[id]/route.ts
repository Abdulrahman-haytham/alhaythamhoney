import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { mixtureInput } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = mixtureInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: 'تحقق من الأسعار والحدود ومقادير المكونات.' },
      { status: 400 },
    );
  const { id } = await params;
  const mixture = await db.mixture.findUnique({ where: { id }, include: { ingredients: true } });
  if (!mixture) return NextResponse.json({ error: 'الخلطة غير موجودة.' }, { status: 404 });
  const body = parsed.data;
  const known = new Set(mixture.ingredients.map((i) => i.id));
  if (body.ingredients.length !== known.size || body.ingredients.some((i) => !known.has(i.id))) {
    return NextResponse.json({ error: 'مكوّن مفقود أو غير معروف.' }, { status: 400 });
  }
  if (body.ingredients.reduce((sum, i) => sum + i.recommended, 0) >= mixture.baseSize) {
    return NextResponse.json(
      { error: 'يجب أن تبقى مساحة للعسل في الوصفة الموصى بها.' },
      { status: 400 },
    );
  }
  await db.$transaction([
    db.mixture.update({
      where: { id },
      data: { prepFee: body.prepFee, published: body.published },
    }),
    ...body.ingredients.map(({ id: ingredientId, name: _name, ...data }) =>
      db.mixtureIngredient.update({ where: { id: ingredientId }, data }),
    ),
  ]);
  return NextResponse.json({ ok: true });
}
