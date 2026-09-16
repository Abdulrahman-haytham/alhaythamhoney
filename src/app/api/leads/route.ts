import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkOrigin, readJson } from '@/lib/request-security';
import { rateLimit } from '@/lib/rate-limit';
import { leadInput } from '@/lib/validation';
import { getSettings } from '@/lib/settings.server';
import { sendMail } from '@/lib/mail';
import { SITE } from '@/lib/config';

/** طلب عرض سعر للجملة — يُحفظ كفرصة في اللوحة ويُنبَّه الأدمن بالبريد إن ضبط بريده. */
export async function POST(request: Request) {
  const denied = checkOrigin(request) || (await rateLimit(request, 'lead', 5, 3600));
  if (denied) return denied;
  const settings = await getSettings();
  if (!settings.wholesaleEnabled)
    return NextResponse.json({ error: 'طلبات الجملة متوقفة حالياً.' }, { status: 404 });
  const parsed = leadInput.safeParse(await readJson(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  const lead = await db.lead.create({
    data: {
      ...parsed.data,
      email: parsed.data.email ?? null,
      quantity: parsed.data.quantity ?? null,
    },
  });
  if (settings.email) {
    const l = parsed.data;
    await sendMail(
      settings.email,
      `طلب جملة جديد من ${l.business} — ${l.city}`,
      `${l.name} (${l.business}) — ${l.city}\nهاتف: ${l.phone}${l.email ? `\nبريد: ${l.email}` : ''}${l.quantity ? `\nالكميات: ${l.quantity}` : ''}\n\n${l.message}\n\nاللوحة: ${SITE.url}/admin/leads`,
    ).catch(() => null);
  }
  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
