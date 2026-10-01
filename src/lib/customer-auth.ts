import 'server-only';
import { createHash, randomInt } from 'node:crypto';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { db } from '@/lib/db';
import { createCustomerToken, readCustomerToken, CUSTOMER_SESSION_TTL_MS } from '@/lib/session';

export const CUSTOMER_COOKIE = 'customer_session';
const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export interface CustomerInfo {
  id: string;
  whatsapp: string | null;
  email: string | null;
  name: string;
  phone: string;
  city: string | null;
  marketingOptIn: boolean;
}

/** الزبون الحالي من كوكي الجلسة — أو null. مُخزَّن لكل طلب. */
export const currentCustomer = cache(async (): Promise<CustomerInfo | null> => {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const id = readCustomerToken(token);
  if (!id) return null;
  return db.customer.findUnique({
    where: { id },
    select: {
      id: true,
      whatsapp: true,
      email: true,
      name: true,
      phone: true,
      city: true,
      marketingOptIn: true,
    },
  });
});

export function customerCookie(customerId: string) {
  return {
    name: CUSTOMER_COOKIE,
    value: createCustomerToken(customerId),
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(CUSTOMER_SESSION_TTL_MS / 1000),
  };
}

function hashCode(phone: string, code: string) {
  // الرمز 6 أرقام فقط — نضيف السر حتى لا يُستنتج من قاعدة بيانات مسرّبة
  return createHash('sha256')
    .update(`${process.env.ADMIN_SESSION_SECRET}:${phone}:${code}`)
    .digest('hex');
}

/** ينشئ رمزاً جديداً ويُبطل ما سبقه لهذا الرقم. يعيد الرمز الصريح لإرساله على واتساب. */
export async function issueLoginCode(phone: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await db.$transaction([
    db.loginCode.updateMany({
      where: { phone, consumedAt: null },
      data: { consumedAt: new Date() },
    }),
    db.loginCode.create({
      data: {
        phone,
        codeHash: hashCode(phone, code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    }),
  ]);
  return code;
}

/** يتحقق من الرمز ويستهلكه. المحاولات محدودة لكل رمز. */
export async function consumeLoginCode(phone: string, code: string): Promise<boolean> {
  const row = await db.loginCode.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!row) return false;
  if (row.attempts >= MAX_ATTEMPTS) return false;
  if (row.codeHash !== hashCode(phone, code)) {
    await db.loginCode.updateMany({
      where: { id: row.id, consumedAt: null, attempts: { lt: MAX_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }
  const consumed = await db.loginCode.updateMany({
    where: {
      id: row.id,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    data: { consumedAt: new Date() },
  });
  if (consumed.count !== 1) return false;
  // تنظيف خفيف للرموز القديمة
  if (Math.random() < 0.05)
    await db.loginCode
      .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3600 * 1000) } } })
      .catch(() => {});
  return true;
}
