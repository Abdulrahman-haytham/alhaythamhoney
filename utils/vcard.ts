import type { Contact } from '../data/contacts';

// تهريب القيم حسب معيار vCard 3.0 (RFC 2426)
const escapeValue = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

export const buildVCard = (contact: Contact): string => {
  // FN بالأحرف اللاتينية لتوافق أوسع مع الأجهزة؛ الاسم العربي في NOTE
  const note = [contact.nameAr, contact.note].filter(Boolean).join(' — ');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeValue(contact.nameLat)};;;;`,
    `FN:${escapeValue(contact.nameLat)}`,
    `ORG:${escapeValue(contact.org)}`,
    `TEL;TYPE=CELL:${contact.phone}`
  ];

  if (contact.email) lines.push(`EMAIL:${escapeValue(contact.email)}`);
  if (contact.url) lines.push(`URL:${escapeValue(contact.url)}`);

  const hasAddress = [contact.street, contact.city, contact.region, contact.country].some(
    (part) => part.trim().length > 0
  );
  if (hasAddress) {
    // ADR: صندوق بريد;امتداد;شارع;مدينة;منطقة;رمز بريدي;دولة
    lines.push(
      `ADR;TYPE=WORK:;;${escapeValue(contact.street)};${escapeValue(contact.city)};${escapeValue(
        contact.region
      )};;${escapeValue(contact.country)}`
    );
  }

  if (note) lines.push(`NOTE:${escapeValue(note)}`);
  lines.push('END:VCARD');

  return lines.join('\r\n') + '\r\n';
};

export const downloadVCard = (contact: Contact): void => {
  const blob = new Blob([buildVCard(contact)], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${contact.slug}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
