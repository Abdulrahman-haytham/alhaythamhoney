/**
 * منطق الطلبات المشترك بين المتصفح والخادم:
 * المرجع القصير الذي يظهر في رسالة واتساب، وتسميات الحالات، وخطوات التتبع.
 */
import type { OrderStatus } from '@prisma/client';

/** أحرف بلا لبس (لا O/0 ولا I/1) — يمليها الزبون هاتفياً أحياناً */
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ORDER_REFERENCE_RE = /^HY-[A-Z2-9]{6}$/;

/**
 * يولَّد في المتصفح لحظة الضغط حتى يُكتب في رسالة واتساب قبل أن يردّ الخادم
 * (فتح واتساب بعد انتظار الشبكة يحجبه سفاري). 32^6 ≈ مليار احتمال — التصادم نظري.
 */
export function generateOrderReference(): string {
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length];
  return `HY-${out}`;
}

export function normalizeOrderReference(raw: string): string | null {
  const v = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const body = v.startsWith('HY') ? v.slice(2) : v;
  const ref = `HY-${body}`;
  return ORDER_REFERENCE_RE.test(ref) ? ref : null;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'بانتظار التأكيد',
  CONFIRMED: 'مؤكَّد',
  PREPARING: 'قيد التجهيز',
  SHIPPED: 'في الطريق',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغى',
};

/** ترتيب خطوات التتبع كما تُعرض للزبون (الإلغاء خارج الخط) */
export const ORDER_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
];

export const ORDER_STATUSES: OrderStatus[] = [...ORDER_STEPS, 'CANCELLED'];

export function orderStepIndex(status: OrderStatus) {
  return ORDER_STEPS.indexOf(status);
}
