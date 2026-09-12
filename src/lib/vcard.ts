import type { Contact } from './contacts';

const escapeValue = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');

/** vCard 3.0 uses CRLF and 75-octet line folding without splitting UTF-8 codepoints. */
export function buildVCard(contact: Contact) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeValue(contact.nameLat)};;;;`,
    `FN:${escapeValue(contact.nameLat)}`,
    `ORG:${escapeValue(contact.org)}`,
    `TEL;TYPE=CELL:${escapeValue(contact.phone)}`,
    ...(contact.email ? [`EMAIL:${escapeValue(contact.email)}`] : []),
    `URL:${escapeValue(contact.url)}`,
    `ADR;TYPE=WORK:;;${escapeValue(contact.street)};${escapeValue(contact.city)};${escapeValue(contact.region)};;${escapeValue(contact.country)}`,
    `NOTE:${escapeValue([contact.nameAr, contact.note].filter(Boolean).join(' — '))}`,
    'END:VCARD',
  ];
  return (
    lines
      .map((line) => {
        let out = '',
          bytes = 0;
        for (const char of line) {
          const length = new TextEncoder().encode(char).length;
          if (bytes + length > 75) {
            out += '\r\n ';
            bytes = 1;
          }
          out += char;
          bytes += length;
        }
        return out;
      })
      .join('\r\n') + '\r\n'
  );
}
