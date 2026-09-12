import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32 || /change_me|dev-secret/i.test(value)) {
    throw new Error('ADMIN_SESSION_SECRET must be a random secret of at least 32 characters.');
  }
  return value;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function createSessionToken(adminId: string, now = Date.now()) {
  const payload = `${adminId}.${now + SESSION_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string, now = Date.now()): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [id, expiry, signature] = parts;
  const expiresAt = Number(expiry);
  if (
    !id ||
    !/^\d+$/.test(expiry) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt > now + SESSION_TTL_MS ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    return null;
  const expected = Buffer.from(sign(`${id}.${expiry}`), 'hex');
  return timingSafeEqual(expected, Buffer.from(signature, 'hex')) ? id : null;
}
