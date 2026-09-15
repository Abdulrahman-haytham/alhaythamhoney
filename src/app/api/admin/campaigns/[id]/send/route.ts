import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { logAudit } from '@/lib/audit.server';
import { processCampaign, startCampaign } from '@/lib/campaigns.server';

/**
 * POST: يبدأ الإرسال (إن كانت مسودّة) ثم يرسل دفعة. اللوحة تكرر الطلب حتى remaining = 0،
 * فتعمل القوائم الكبيرة بلا انتهاء مهلة الطلب.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: 'الحملة غير موجودة.' }, { status: 404 });
  try {
    if (campaign.status === 'DRAFT') {
      if (!process.env.SMTP_URL && process.env.NODE_ENV === 'production')
        return NextResponse.json({ error: 'SMTP_URL غير مضبوط على الخادم.' }, { status: 400 });
      const count = await startCampaign(id);
      await logAudit({
        entity: 'campaign',
        entityId: id,
        action: 'status',
        label: campaign.subject,
        before: { status: 'DRAFT' },
        after: { status: 'SENDING', recipients: count },
      });
    }
    const result = await processCampaign(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'تعذّر الإرسال.' },
      { status: 400 },
    );
  }
}
