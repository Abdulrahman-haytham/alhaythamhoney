import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { readJson } from '@/lib/request-security';
import { eventInput } from '@/lib/validation';

/**
 * أحداث لوحة المؤشرات (مشاهدة منتج، إضافة للسلة، نقرة واتساب، بحث).
 * تصل عبر sendBeacon فلا نفرض Origin، لكن نقبل نفس الموقع فقط ونحدّ المعدل.
 * الرد دائماً 204 حتى لا يعرف أحد ما قُبل وما رُفض.
 */
export async function POST(request: Request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return new NextResponse(null, { status: 204 });
  const limited = await rateLimit(request, 'events', 240, 600);
  if (limited) return new NextResponse(null, { status: 204 });
  const parsed = eventInput.safeParse(await readJson(request, 2 * 1024));
  if (parsed.success) {
    const { type, key, value } = parsed.data;
    await db.event
      .create({ data: { type, key: key ?? null, value: value ?? null } })
      .catch(() => null);
  }
  return new NextResponse(null, { status: 204 });
}
