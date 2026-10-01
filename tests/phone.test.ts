import { describe, expect, it } from 'vitest';
import { formatPhone, normalizeWhatsAppNumber } from '@/lib/phone';
import { requestCodeInput, registerInput } from '@/lib/validation';

describe('WhatsApp numbers are stored in one international form', () => {
  it('accepts the ways Syrians actually type their mobile number', () => {
    for (const typed of [
      '0944123456',
      '0944 123 456',
      '944123456',
      '+963944123456',
      '+963 0944 123 456',
      '00963-944-123-456',
      '963944123456',
      '٠٩٤٤١٢٣٤٥٦',
      '۰۹۴۴۱۲۳۴۵۶',
    ])
      expect(normalizeWhatsAppNumber(typed), typed).toBe('963944123456');
  });

  it('keeps other countries only with an explicit international prefix', () => {
    expect(normalizeWhatsAppNumber('+49 151 2345 6789')).toBe('4915123456789');
    expect(normalizeWhatsAppNumber('00971501234567')).toBe('971501234567');
    expect(normalizeWhatsAppNumber('4915123456789')).toBeNull();
  });

  it('rejects landlines, short numbers and text', () => {
    for (const bad of ['011 222 3333', '+963 11 222 3333', '0944', 'abc', '', '0944123456789'])
      expect(normalizeWhatsAppNumber(bad), bad).toBeNull();
  });

  it('displays Syrian numbers the local way', () => {
    expect(formatPhone('963944123456')).toBe('0944 123 456');
    expect(formatPhone('4915123456789')).toBe('+4915123456789');
  });

  it('normalizes the login request and drops the phone question at sign-up', () => {
    expect(requestCodeInput.parse({ phone: '0944 123 456' })).toEqual({ phone: '963944123456' });
    expect(requestCodeInput.safeParse({ phone: '011 222 3333' }).success).toBe(false);
    expect(
      registerInput.parse({ token: 'x'.repeat(20), name: 'سامر', city: '', marketingOptIn: true }),
    ).toEqual({ token: 'x'.repeat(20), name: 'سامر', city: null, marketingOptIn: true });
  });
});
