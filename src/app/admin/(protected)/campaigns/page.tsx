import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings.server';
import { CampaignsPanel } from './CampaignsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignsPage() {
  const [campaigns, audience, settings] = await Promise.all([
    db.campaign.findMany({ orderBy: { createdAt: 'desc' } }),
    db.customer.count({ where: { marketingOptIn: true } }),
    getSettings(),
  ]);
  return (
    <>
      <h1 className="mb-3 font-amiri text-3xl font-bold">الحملات البريدية</h1>
      <p className="mb-6 text-sm text-zinc-400">
        اكتب الرسالة هنا (موسم جديد، عرض، قصة) وأرسلها لكل من وافق على استلام العروض —{' '}
        <b className="text-white">{audience}</b> حساباً الآن. كل رسالة تحمل رابط إلغاء اشتراك،
        ويُقاس الفتح تقريبياً (بعض برامج البريد تحجب الصور).
        {!process.env.SMTP_URL && (
          <b className="block text-amber-300">
            SMTP_URL غير مضبوط — في التطوير تُكتب الرسائل في data/outbox.log.
          </b>
        )}
      </p>
      <CampaignsPanel
        adminEmail={settings.email}
        campaigns={campaigns.map((c) => ({
          id: c.id,
          subject: c.subject,
          body: c.body,
          status: c.status,
          recipientsCount: c.recipientsCount,
          sentCount: c.sentCount,
          failedCount: c.failedCount,
          openCount: c.openCount,
          sentAt: c.sentAt?.toISOString() ?? null,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
