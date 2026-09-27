/**
 * نصوص رسائل واتساب التي تبدأ من الموقع. دوال خالصة: تُختبر بلا متصفح.
 * كل رسالة تحمل ما يراه الزبون في الصفحة ورابطها، فلا يحتاج صاحب المتجر
 * أن يسأل «أي منتج تقصد؟».
 */
import { CURRENCY, formatAmount } from '@/lib/money';

export const GREETING = 'مرحباً عسل الهيثم،';
export const HOME_MESSAGE = `${GREETING} أود الاستفسار عن منتجاتكم.`;

/** يزيل اسم المتجر الملحق بعنوان الصفحة: «عسل القبار | الهيثم — نحل وعسل» ← «عسل القبار» */
export function pageTitle(documentTitle: string, siteName: string): string {
  const t = documentTitle.trim();
  const suffix = ` | ${siteName}`;
  return t.endsWith(suffix) ? t.slice(0, -suffix.length).trim() : t;
}

/** الرابط بلا ?ref أو utm — ما يحتاجه صاحب المتجر ليفتح الصفحة نفسها */
export function cleanUrl(href: string): string {
  try {
    const u = new URL(href);
    return `${u.origin}${u.pathname}`;
  } catch {
    return href;
  }
}

export function productMessage(p: {
  name: string;
  weight?: string | null;
  price?: number | null;
  url: string;
  orderable: boolean;
}): string {
  const item = p.weight ? `${p.name} — ${p.weight}` : p.name;
  return [
    p.orderable ? `${GREETING} أود طلب:` : `${GREETING} أود الاستفسار عن:`,
    `• ${item}`,
    ...(p.price != null ? [`• السعر في الموقع: ${formatAmount(p.price)} ${CURRENCY.label}`] : []),
    p.url,
  ].join('\n');
}

/** الصفحات التي لم تحدّد رسالتها: عنوانها ورابطها. الرئيسية لها رسالة عامة. */
export function pageMessage(p: { title: string; url: string; isHome: boolean }): string {
  if (p.isHome || !p.title) return HOME_MESSAGE;
  return `${GREETING} أستفسر بخصوص:\n${p.title}\n${p.url}`;
}
