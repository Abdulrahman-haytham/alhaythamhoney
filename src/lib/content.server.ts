import 'server-only';
import { cache } from 'react';
import { db } from '@/lib/db';

/**
 * ما يملكه الموقع فعلاً من محتوى — لا ما هو مبنيّ فيه.
 * رابط يقود إلى صفحة فارغة يكلّف ثقة أكثر مما يعطي، فالأقسام التي تنتظر
 * محتوى تختفي وحدها وتعود وحدها حين يُضاف، بلا مفتاح يُنسى في اللوحة.
 */
export interface SiteContentFlags {
  hasStudioPhotos: boolean;
  /** وكيل معتمد واحد فعّال على الأقل ⇒ رابط «وكلاؤنا» في القائمة */
  hasAgents: boolean;
}

const EMPTY: SiteContentFlags = { hasStudioPhotos: false, hasAgents: false };

export const getSiteContentFlags = cache(async (): Promise<SiteContentFlags> => {
  try {
    const [studio, agents] = await Promise.all([
      db.studioPhoto.count(),
      db.agent.count({ where: { active: true } }),
    ]);
    return { hasStudioPhotos: studio > 0, hasAgents: agents > 0 };
  } catch {
    // قاعدة البيانات غير متاحة (أثناء البناء مثلاً) — نخفي ولا نُسقط الصفحة
    return EMPTY;
  }
});
