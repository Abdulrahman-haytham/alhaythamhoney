import 'server-only';
import { cache } from 'react';
import { db } from '@/lib/db';
import type { CommerceTx } from '@/lib/commerce.server';
import { applyRuntimeSettings } from '@/lib/config';
import { DEFAULT_SETTINGS, NO_INVENTORY_SETTINGS, type SiteSettingsData } from '@/lib/settings';

const SETTINGS_ID = 'site';

/**
 * يقرأ الإعدادات مرة واحدة لكل طلب (React cache) ويحقنها في ثوابت config.ts
 * حتى تعمل getWhatsAppLink و SITE و SHIPPING في مكوّنات الخادم كما كانت.
 * أي صفحة خادم تعرض رقم الهاتف أو الشحن تستدعيها أولاً.
 */
export const getSettings = cache(async (): Promise<SiteSettingsData> => {
  let row: SiteSettingsData | null = null;
  try {
    const found = await db.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (found) {
      const { id: _id, updatedAt: _u, ...data } = found;
      row = data;
    }
  } catch {
    // قاعدة البيانات غير متاحة (مثلاً أثناء البناء) — نعمل بالافتراضيات ولا نُسقط الصفحة
  }
  const settings = { ...DEFAULT_SETTINGS, ...row, ...NO_INVENTORY_SETTINGS };
  applyRuntimeSettings(settings);
  return settings;
});

export async function saveSettings(data: SiteSettingsData) {
  return db.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data, ...NO_INVENTORY_SETTINGS },
    update: { ...data, ...NO_INVENTORY_SETTINGS },
  });
}

/** Commercial writes must fail if settings cannot be read; never quote fallback prices. */
export async function getCommerceSettings(tx: CommerceTx = db): Promise<SiteSettingsData> {
  const row = await tx.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  return { ...DEFAULT_SETTINGS, ...row, ...NO_INVENTORY_SETTINGS };
}
