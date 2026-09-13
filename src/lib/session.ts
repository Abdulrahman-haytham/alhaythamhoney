import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32 || /change_me|dev-secret/i.test(value)) {
    throw new Error('ADMIN_SESSION_SECRET must be a random secret of at least 32 characters.');
  }
  return value;
}

/** جلسات الزبائن أطول (30 يوماً) لأن الدخول برمز بريدي وليس بكلمة مرور تُحفظ. */
export const CUSTOMER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type Kind = 'admin' | 'customer';

/** مفتاح مختلف لكل نوع جلسة: توقيع الأدمن لا يصلح أبداً كجلسة زبون والعكس. */
function sign(payload: string, kind: Kind) {
  return createHmac('sha256', `${secret()}:${kind}`).update(payload).digest('hex');
}

function create(id: string, kind: Kind, ttl: number, now: number) {
  const payload = `${id}.${now + ttl}`;
  return `${payload}.${sign(payload, kind)}`;
}

function read(token: string, kind: Kind, ttl: number, now: number): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [id, expiry, signature] = parts;
  const expiresAt = Number(expiry);
  if (
    !id ||
    !/^\d+$/.test(expiry) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt > now + ttl ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    return null;
  const expected = Buffer.from(sign(`${id}.${expiry}`, kind), 'hex');
  return timingSafeEqual(expected, Buffer.from(signature, 'hex')) ? id : null;
}

export function createSessionToken(adminId: string, now = Date.now()) {
  return create(adminId, 'admin', SESSION_TTL_MS, now);
}

export function readSessionToken(token: string, now = Date.now()): string | null {
  return read(token, 'admin', SESSION_TTL_MS, now);
}

export function createCustomerToken(customerId: string, now = Date.now()) {
  return create(customerId, 'customer', CUSTOMER_SESSION_TTL_MS, now);
}

export function readCustomerToken(token: string, now = Date.now()): string | null {
  return read(token, 'customer', CUSTOMER_SESSION_TTL_MS, now);
}

/**
 * رمز قصير العمر يثبت أن البريد تحقق للتو — يُستخدم بين خطوة الرمز وخطوة إكمال
 * الملف (الاسم والهاتف) لزبون جديد، حتى لا يُنشأ حساب لبريد لم يُتحقق منه.
 */
export const VERIFIED_EMAIL_TTL_MS = 15 * 60 * 1000;
export function createVerifiedEmailToken(email: string, now = Date.now()) {
  const payload = `${Buffer.from(email).toString('base64url')}.${now + VERIFIED_EMAIL_TTL_MS}`;
  return `${payload}.${sign(payload, 'customer')}`;
}
export function readVerifiedEmailToken(token: string, now = Date.now()): string | null {
  const id = read(token, 'customer', VERIFIED_EMAIL_TTL_MS, now);
  return id ? Buffer.from(id, 'base64url').toString() : null;
}
