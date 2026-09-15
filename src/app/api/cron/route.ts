import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { processPendingCampaigns } from '@/lib/campaigns.server';
import { pruneOldData, sendAbandonedCartEmails } from '@/lib/cron.server';

export const dynamic = 'force-dynamic';

/**
 * مهام دورية — يستدعيها cron على الخادم كل ساعة:
 *   0 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://example.sy/api/cron
 * بلا CRON_SECRET في البيئة يُرفض الطلب دائماً.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const ok =
    !!secret &&
    secret.length >= 32 &&
    !/CHANGE_ME/i.test(secret) &&
    Buffer.byteLength(given) === Buffer.byteLength(secret) &&
    timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return NextResponse.json({ error: 'غير مصرّح.' }, { status: 401 });
  const startedAt = Date.now();
  const [abandoned, pruned, campaigns] = await Promise.all([
    sendAbandonedCartEmails(),
    pruneOldData(),
    processPendingCampaigns(),
  ]);
  return NextResponse.json(
    { ok: true, ms: Date.now() - startedAt, abandoned, pruned, campaigns },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
