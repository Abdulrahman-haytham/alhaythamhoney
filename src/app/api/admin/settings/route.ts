import { NextResponse } from 'next/server';
import { guardAdmin } from '@/lib/admin-request';
import { readJson } from '@/lib/request-security';
import { settingsInput } from '@/lib/validation';
import { saveSettings } from '@/lib/settings.server';

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
  await saveSettings(parsed.data);
  return NextResponse.json({ ok: true });
}
