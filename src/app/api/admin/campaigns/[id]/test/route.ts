import { NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { campaignTestInput } from '@/lib/validation';
import { sendCampaignTest } from '@/lib/campaigns.server';

/** رسالة تجريبية إلى بريد الأدمن قبل الإرسال الفعلي */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = campaignTestInput.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: 'بريد غير صالح.' }, { status: 400 });
  const { id } = await params;
  try {
    await sendCampaignTest(id, parsed.data.email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'تعذّر الإرسال.' },
      { status: 400 },
    );
  }
}
