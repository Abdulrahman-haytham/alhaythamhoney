import 'server-only';
import { revalidatePath } from 'next/cache';

/**
 * المسارات العامة التي تتأثر بكل نوع من التعديلات في اللوحة.
 * الصفحات العامة مخزّنة مؤقتاً (ISR) حتى لا تضرب كل زيارة — وكل زحفة من غوغل —
 * قاعدة البيانات؛ وهذه الخريطة هي ما يجعل التعديل يظهر فوراً رغم التخزين.
 */
const PATHS: Record<string, string[]> = {
  product: ['/', '/shop', '/product/[slug]', '/custom-mixtures', '/sitemap.xml'],
  mixture: ['/', '/custom-mixtures', '/custom-mixtures/[slug]', '/sitemap.xml'],
  article: ['/articles', '/articles/[slug]', '/sitemap.xml'],
  glossary: [
    '/',
    '/beekeeping',
    '/beekeeping/[slug]',
    '/beekeeping/hive',
    '/beekeeping/harvest',
    '/sitemap.xml',
  ],
  glossaryCategory: ['/', '/beekeeping', '/beekeeping/[slug]'],
  batch: ['/batch/[code]', '/beekeeping/harvest'],
  promotion: ['/', '/shop', '/product/[slug]'],
  coupon: ['/', '/shop'],
  zone: ['/', '/shop'],
  attribute: ['/shop'],
  review: ['/', '/shop', '/product/[slug]'],
  draw: ['/draw'],
};

/**
 * يُبطل تخزين ما يراه الزائر بعد كتابة الأدمن. الإعدادات تمسّ كل صفحة (الرأس،
 * واتساب، شريط الإعلان) فتُبطل التخطيط كاملاً. الكيانات الإدارية البحتة (الطلبات،
 * الزبائن، الحملات) لا تظهر للزوار فلا شيء يُبطَل لها.
 */
export function revalidatePublic(entity: string) {
  try {
    if (entity === 'settings') {
      revalidatePath('/', 'layout');
      return;
    }
    // المسار ذو المقطع المتغيّر (`/product/[slug]`) يحتاج تمرير النوع صراحةً،
    // وإلا لم يُبطَل شيء أصلاً — والصفحة المخزّنة تبقى على محتواها القديم.
    for (const path of PATHS[entity] ?? [])
      if (path.includes('[')) revalidatePath(path, 'page');
      else revalidatePath(path);
  } catch (error) {
    // لا يُسقط الطلب: الكتابة نجحت، وأسوأ ما يحدث أن يتأخّر ظهورها حتى انتهاء المدة
    console.error('[revalidate] failed', error);
  }
}
