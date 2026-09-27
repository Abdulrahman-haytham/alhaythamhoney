import { describe, expect, it } from 'vitest';
import { agentInput } from '@/lib/validation';

const base = {
  name: 'محل العسل',
  governorate: 'حماة',
  city: 'حماة',
  address: 'شارع العلمين',
  addressDetail: '',
  mapUrl: '',
  whatsapp: '',
  facebookUrl: '',
  active: true,
  sortOrder: 0,
};

describe('agent input', () => {
  it('accepts an agent with only the required fields, turning blanks into null', () => {
    const r = agentInput.parse(base);
    expect(r.addressDetail).toBeNull();
    expect(r.mapUrl).toBeNull();
    expect(r.whatsapp).toBeNull();
    expect(r.facebookUrl).toBeNull();
  });

  it('normalises a WhatsApp number typed with +, spaces or 00', () => {
    expect(agentInput.parse({ ...base, whatsapp: '+963 94 793 1959' }).whatsapp).toBe(
      '963947931959',
    );
    expect(agentInput.parse({ ...base, whatsapp: '00963947931959' }).whatsapp).toBe('963947931959');
    expect(agentInput.safeParse({ ...base, whatsapp: '0947' }).success).toBe(false);
  });

  it('only takes https links for the map and Facebook', () => {
    expect(agentInput.safeParse({ ...base, mapUrl: 'http://maps.google.com/x' }).success).toBe(
      false,
    );
    expect(agentInput.parse({ ...base, mapUrl: 'https://maps.app.goo.gl/abc' }).mapUrl).toBe(
      'https://maps.app.goo.gl/abc',
    );
  });
});
