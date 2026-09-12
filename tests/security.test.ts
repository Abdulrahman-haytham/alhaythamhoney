import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSessionToken, readSessionToken, SESSION_TTL_MS } from '@/lib/session';
import { checkOrigin, clientAddress, readJson } from '@/lib/request-security';

beforeEach(() => {
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a'.repeat(64));
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://honey.example');
  vi.stubEnv('TRUST_PROXY', '0');
});
afterEach(() => vi.unstubAllEnvs());
describe('passwords and admin sessions', () => {
  it('salts hashes and compares passwords safely', () => {
    const hash = hashPassword('Strong-password!');
    expect(verifyPassword('Strong-password!', hash)).toBe(true);
    expect(verifyPassword('wrong', hash)).toBe(false);
    expect(verifyPassword('wrong', 'bad:hash')).toBe(false);
    expect(hashPassword('Strong-password!')).not.toBe(hash);
  });
  it('accepts signed tokens and rejects expired, tampered and malformed ones', () => {
    const now = Date.now();
    const token = createSessionToken('admin123', now);
    expect(readSessionToken(token, now)).toBe('admin123');
    expect(readSessionToken(token.replace('admin123', 'admin456'), now)).toBeNull();
    expect(readSessionToken(token, now + SESSION_TTL_MS)).toBeNull();
    for (const bad of [token + '.extra', 'id.NaN.' + 'a'.repeat(64), 'id.1.x', ''])
      expect(readSessionToken(bad, now)).toBeNull();
  });
  it('fails closed with missing or default secret', () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'CHANGE_ME');
    expect(() => createSessionToken('admin')).toThrow();
  });
});
describe('request boundaries', () => {
  it('rejects foreign and missing origins', () => {
    const req = (origin?: string) =>
      new Request('https://honey.example/api/admin/login', { headers: origin ? { origin } : {} });
    expect(checkOrigin(req('https://honey.example'))).toBeNull();
    expect(checkOrigin(req('https://evil.example'))?.status).toBe(403);
    expect(checkOrigin(req())?.status).toBe(403);
  });
  it('only trusts the explicitly configured proxy header', () => {
    const request = new Request('https://honey.example', {
      headers: { 'x-forwarded-for': '1.2.3.4', 'x-client-ip': '192.0.2.1' },
    });
    expect(clientAddress(request)).toBe('unproxied');
    vi.stubEnv('TRUST_PROXY', '1');
    expect(clientAddress(request)).toBe('192.0.2.1');
  });
  it('bounds JSON and rejects malformed bodies', async () => {
    const req = (body: string) =>
      new Request('https://honey.example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    expect(await readJson(req('{"ok":true}'))).toEqual({ ok: true });
    expect(await readJson(req('x'.repeat(30)), 20)).toBeNull();
    expect(await readJson(req('{bad'))).toBeNull();
  });
});
