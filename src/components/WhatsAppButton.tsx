'use client';

import { SITE, getWhatsAppLink } from '@/lib/config';
import { trackWhatsAppClick } from '@/lib/analytics';
import { cleanUrl, HOME_MESSAGE, pageMessage, pageTitle } from '@/lib/whatsappMessage';
import { usePageActions } from '@/store/pageActionStore';
import { WhatsAppIcon } from '@/components/BrandIcons';

/**
 * زر واتساب الوحيد في الموقع: كل دعوة للتواصل تمرّ من هنا، فيبقى لونها وسلوكها واحداً.
 * الأخضر للتواصل والذهبي للشراء — لا يتبادلان.
 *
 * الرسالة: ما يمرّره المكوّن صراحةً، وإلا ما سجّلته الصفحة (منتج، خلطة…)،
 * وإلا عنوان الصفحة ورابطها. تُحسب لحظة النقر لأن التذييل والرأس لا يُعاد رسمهما
 * عند التنقّل بين الصفحات.
 */
const VARIANTS = {
  /** الإجراء الأساسي في موضعه */
  solid: 'bg-whatsapp font-black text-zinc-950 hover:brightness-110 active:scale-[0.98]',
  /** بجانب زر ذهبي أساسي (أضف إلى السلة) — أخضر دون أن ينافسه */
  soft: 'border border-whatsapp/40 bg-whatsapp/10 font-bold text-whatsapp hover:bg-whatsapp/20',
  /** رابط نصي داخل فقرة أو قائمة */
  link: 'font-bold text-whatsapp hover:underline',
  /** أيقونة فقط بين أيقونات أخرى */
  icon: 'text-zinc-400 hover:bg-zinc-800 hover:text-whatsapp',
  /** بلا لون — للصفحات التي يحدّد تصميمها ألوانه بنفسه (صفحة المرطبان بألوان العلامة) */
  plain: '',
} as const;

export function currentWhatsAppMessage(explicit?: string): string {
  if (explicit) return explicit;
  const registered = usePageActions.getState().message?.value;
  if (registered) return registered;
  if (typeof window === 'undefined') return HOME_MESSAGE;
  return pageMessage({
    title: pageTitle(document.title, SITE.name),
    url: cleanUrl(window.location.href),
    isHome: window.location.pathname === '/',
  });
}

export default function WhatsAppButton({
  message,
  source,
  variant = 'solid',
  className = '',
  children,
  icon = true,
  iconClassName = 'h-5 w-5',
  ariaLabel,
  onClick,
  tabIndex,
  phone,
}: {
  /** رقم آخر غير رقم المتجر (وكيل) — حينها تُرسل `message` كما هي */
  phone?: string;
  message?: string;
  /** يظهر في لوحة المؤشرات: من أين جاءت النقرة */
  source: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children?: React.ReactNode;
  icon?: boolean;
  iconClassName?: string;
  ariaLabel?: string;
  onClick?: () => void;
  tabIndex?: number;
}) {
  // يعيد الرسم حين تسجّل الصفحة رسالتها، ليكون الرابط صحيحاً حتى عند النسخ بالضغط المطوّل
  const registered = usePageActions((s) => s.message?.value);
  const link = (text: string) =>
    phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : getWhatsAppLink(text);
  const href = link(phone ? (message ?? '') : message || registered || HOME_MESSAGE);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      onClick={(e) => {
        if (!phone) e.currentTarget.href = link(currentWhatsAppMessage(message));
        trackWhatsAppClick(source);
        onClick?.();
      }}
      className={`inline-flex items-center justify-center gap-2 transition ${VARIANTS[variant]} ${className}`}
    >
      {icon && <WhatsAppIcon className={iconClassName} />}
      {children}
    </a>
  );
}
