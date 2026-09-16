/**
 * منطق الطلبات المشترك بين المتصفح والخادم:
 * المرجع القصير الذي يظهر في رسالة واتساب، وتسميات الحالات، وخطوات التتبع.
 */
import type { OrderStatus } from '@prisma/client';

/** أحرف بلا لبس (لا O/0 ولا I/1) — يمليها الزبون هاتفياً أحياناً */
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ORDER_REFERENCE_RE = /^HY-(?:[A-Z2-9]{6}|[A-Z2-9]{18})$/;

/** مرجع عشوائي طويل؛ يبقى نفسه عند إعادة محاولة حفظ الطلب بعد انقطاع الشبكة. */
export function generateOrderReference(): string {
  const bytes = new Uint8Array(18);
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

/** Cancellation is terminal. A confirmed order cannot return to an unconfirmed state. */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  if (from === to) return true;
  if (from === 'CANCELLED') return false;
  if (to === 'CANCELLED') return true;
  return orderStepIndex(to) > orderStepIndex(from);
}
