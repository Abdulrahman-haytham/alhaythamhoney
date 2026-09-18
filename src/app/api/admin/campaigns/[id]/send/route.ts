import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guardAdmin } from '@/lib/admin-request';
import { logAudit } from '@/lib/audit.server';
import { startCampaign } from '@/lib/campaigns.server';

/**
 * موافقة الأدمن تُدرج الحملة فقط؛ الإرسال يتولّاه المؤقّت الخلفي دفعةً دفعة،
 * فإغلاق اللوحة لا يوقف الحملة ولا تنتهي مهلة الطلب مع القوائم الكبيرة.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: 'الحملة غير موجودة.' }, { status: 404 });
  try {
    if (campaign.status === 'DRAFT') {
      if (
        !process.env.CRON_SECRET ||
        process.env.CRON_SECRET.length < 32 ||
        /CHANGE_ME/i.test(process.env.CRON_SECRET)
      )
        return NextResponse.json(
          { error: 'هيّئ مهمة الإرسال الخلفية وCRON_SECRET قبل بدء الحملة.' },
          { status: 400 },
        );
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
    return NextResponse.json(
      { queued: true, status: campaign.status === 'SENT' ? 'SENT' : 'SENDING' },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'تعذّر الإرسال.' },
      { status: 400 },
    );
  }
}
