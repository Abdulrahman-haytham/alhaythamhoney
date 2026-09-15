import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { promotionInput } from '@/lib/validation';
import { logAudit } from '@/lib/audit.server';
import { toPromotionData } from '@/lib/promotions.admin';

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = promotionInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const promotion = await db.promotion.create({ data: toPromotionData(parsed.data) });
  await logAudit({
    entity: 'promotion',
    entityId: promotion.id,
    action: 'create',
    label: promotion.title,
  });
  return NextResponse.json({ id: promotion.id }, { status: 201 });
}
