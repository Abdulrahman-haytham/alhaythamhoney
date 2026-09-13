import { getSettings } from '@/lib/settings.server';
import { SettingsForm } from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <h1 className="mb-1 font-amiri text-3xl font-bold">إعدادات الموقع</h1>
      <p className="mb-6 text-sm text-zinc-400">
        كل ما هنا يظهر للزوار فور الحفظ دون الحاجة لمبرمج: رقم واتساب، أجور الشحن، نصوص الصفحة
        الأولى، شريط الإعلان، وسلوكيات المتجر.
      </p>
      <SettingsForm initial={settings} />
    </>
  );
}
