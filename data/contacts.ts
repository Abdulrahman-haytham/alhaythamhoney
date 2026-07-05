import { SITE, getWhatsAppLink } from '../config/site';

export interface ContactSocial {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
}

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
  logo: string;
  social: ContactSocial;
}

// مصدر الحقيقة الوحيد لبيانات بطاقات الاتصال (صفحات /q/:slug).
// تعديل أي حقل هنا ثم إعادة البناء والنشر يحدّث البطاقة دون تغيير رابط الـ QR المطبوع.
export const CONTACTS: Record<string, Contact> = {
  haytham: {
    slug: 'haytham',
    nameAr: 'الهيثم نحل و عسل',
    nameLat: 'Al-Haytham Honey',
    org: 'الهيثم نحل و عسل',
    phone: SITE.phoneNumber,
    email: '', // لا يوجد بريد رسمي حالياً؛ عند توفره يُضاف هنا ويظهر تلقائياً في البطاقة والـ vCard
    url: 'https://alhaythamhoney.sy',
    street: 'الحي الشمالي، جانب مسجد بلال الحبشي',
    city: 'قمحانة',
    region: 'حماة',
    country: 'سوريا',
    note: 'عسل طبيعي 100% مفحوص مخبرياً — خبرة عائلية منذ 1997',
    logo: 'https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg',
    social: {
      whatsapp: getWhatsAppLink(),
      instagram: '', // لا يوجد حساب انستغرام فعّال حالياً
      facebook: 'https://www.facebook.com/profile.php?id=100064934053886'
    }
  }
};
