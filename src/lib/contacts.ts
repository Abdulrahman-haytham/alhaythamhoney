import { SITE, getWhatsAppLink } from './config';

export interface Contact {
  slug: string;
  nameAr: string;
  nameLat: string;
  org: string;
  phone: string;
  email: string;
  url: string;
  street: string;
  city: string;
  region: string;
  country: string;
  note: string;
}

// Keep /q/haytham stable: it is used by existing printed QR codes.
export const CONTACTS: Record<string, Contact> = {
  haytham: {
    slug: 'haytham',
    nameAr: SITE.name,
    nameLat: 'Al-Haytham Honey',
    org: SITE.name,
    // getter لأن الرقم يُحرَّر من لوحة التحكم وقت التشغيل
    get phone() {
      return SITE.phoneNumber;
    },
    email: '',
    url: SITE.url,
    street: 'الحي الشمالي، جانب مسجد بلال الحبشي',
    city: 'قمحانة',
    region: 'حماة',
    country: 'سوريا',
    note: 'خبرة عائلية منذ 1997',
  },
};
export { getWhatsAppLink };
export const getContact = (slug: string) =>
  Object.hasOwn(CONTACTS, slug) ? CONTACTS[slug] : undefined;
