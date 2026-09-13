'use client';

import { createContext, useContext } from 'react';
import { applyRuntimeSettings } from '@/lib/config';
import { DEFAULT_SETTINGS, type PublicSettings } from '@/lib/settings';

const SettingsContext = createContext<PublicSettings>(DEFAULT_SETTINGS);

/**
 * يوصل إعدادات لوحة التحكم إلى مكوّنات المتصفح. الحقن في config.ts يتم أثناء
 * التصيير عمداً (لا في effect) حتى تراه المكوّنات الأبناء في نفس التمريرة —
 * على الخادم (SSR) وفي المتصفح على حد سواء.
 */
export function SettingsProvider({
  settings,
  children,
}: {
  settings: PublicSettings;
  children: React.ReactNode;
}) {
  applyRuntimeSettings(settings);
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings(): PublicSettings {
  return useContext(SettingsContext);
}
