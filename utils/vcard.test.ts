import { describe, it, expect } from 'vitest';
import { buildVCard } from './vcard';
import { CONTACTS } from '../data/contacts';

describe('buildVCard', () => {
  const vcard = buildVCard(CONTACTS.haytham);
  const lines = vcard.split('\r\n');

  it('uses CRLF line endings and proper envelope', () => {
    expect(vcard.endsWith('END:VCARD\r\n')).toBe(true);
    expect(vcard).not.toMatch(/[^\r]\n/);
    expect(lines[0]).toBe('BEGIN:VCARD');
    expect(lines[1]).toBe('VERSION:3.0');
  });

  it('includes required fields with real site data', () => {
    expect(vcard).toContain('FN:Al-Haytham Honey');
    expect(vcard).toContain('TEL;TYPE=CELL:+963947931959');
    expect(vcard).toContain('URL:https://alhaythamhoney.sy');
    expect(vcard).toContain('ORG:الهيثم نحل و عسل');
  });

  it('places the Arabic name in NOTE', () => {
    const noteLine = lines.find((line) => line.startsWith('NOTE:'));
    expect(noteLine).toBeDefined();
    expect(noteLine).toContain('الهيثم نحل و عسل');
  });

  it('formats ADR with locality and country in the right slots', () => {
    const adrLine = lines.find((line) => line.startsWith('ADR;TYPE=WORK:'));
    expect(adrLine).toBeDefined();
    const parts = (adrLine as string).replace('ADR;TYPE=WORK:', '').split(';');
    expect(parts[3]).toBe('قمحانة');
    expect(parts[4]).toBe('حماة');
    expect(parts[6]).toBe('سوريا');
  });

  it('omits empty optional fields', () => {
    expect(vcard).not.toContain('EMAIL:');
  });

  it('escapes special characters in values', () => {
    const escaped = buildVCard({
      ...CONTACTS.haytham,
      org: 'Honey; Co, Ltd',
      street: '',
      city: '',
      region: '',
      country: ''
    });
    expect(escaped).toContain('ORG:Honey\\; Co\\, Ltd');
  });
});
