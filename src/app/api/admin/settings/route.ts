import { NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { settingsInput } from '@/lib/validation';
import { saveSettings, getSettings } from '@/lib/settings.server';
import { logAudit } from '@/lib/audit.server';

export async function PUT(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = settingsInput.safeParse(await readJson(request, 32 * 1024));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'تحقق من الحقول.' },
      { status: 400 },
    );
  }
  const before = await getSettings();
  await saveSettings(parsed.data);
  await logAudit({
    entity: 'settings',
    entityId: 'site',
    action: 'update',
    label: 'إعدادات الموقع',
    before,
    after: parsed.data,
  });
  return NextResponse.json({ ok: true });
}
