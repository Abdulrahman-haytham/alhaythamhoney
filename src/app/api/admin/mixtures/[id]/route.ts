import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface IngredientPatch {
  id: string;
  pricePerGram: number;
  minGrams: number;
  maxGrams: number;
  recommended: number;
  step: number;
  note?: string | null;
}

interface Payload {
  prepFee?: number;
  published?: boolean;
  ingredients?: IngredientPatch[];
}

const int = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 ? (v as number) : null);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Payload;

  const mixture = await db.mixture.findUnique({ where: { id }, include: { ingredients: true } });
  if (!mixture) return NextResponse.json({ error: 'الخلطة غير موجودة.' }, { status: 404 });

  const known = new Set(mixture.ingredients.map((i) => i.id));
  for (const ing of body.ingredients ?? []) {
    if (!known.has(ing.id)) return NextResponse.json({ error: 'مكوّن غير معروف.' }, { status: 400 });
    const [price, min, max, rec, step] = [ing.pricePerGram, ing.minGrams, ing.maxGrams, ing.recommended, ing.step].map(int);
    if ([price, min, max, rec, step].some((v) => v === null) || step === 0) {
      return NextResponse.json({ error: 'القيم يجب أن تكون أعداداً صحيحة موجبة.' }, { status: 400 });
    }
    if (min! > max! || rec! < min! || rec! > max!) {
      return NextResponse.json({ error: 'الموصى به يجب أن يقع بين الحد الأدنى والأقصى.' }, { status: 400 });
    }
  }

  await db.$transaction([
    db.mixture.update({
      where: { id },
      data: {
        ...(int(body.prepFee) !== null ? { prepFee: body.prepFee } : {}),
        ...(typeof body.published === 'boolean' ? { published: body.published } : {}),
      },
    }),
    ...(body.ingredients ?? []).map((ing) =>
      db.mixtureIngredient.update({
        where: { id: ing.id },
        data: {
          pricePerGram: ing.pricePerGram,
          minGrams: ing.minGrams,
          maxGrams: ing.maxGrams,
          recommended: ing.recommended,
          step: ing.step,
          note: ing.note?.trim() || null,
        },
      })
    ),
  ]);

  return NextResponse.json({ ok: true });
}
