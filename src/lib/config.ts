export const SITE = {
  name: 'الهيثم — نحل وعسل',
  tagline: 'عسل طبيعي وخلطات نحل أصيلة من قلب حماة',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005').replace(/\/$/, ''),
  foundedYear: 1997,
  phoneNumber: '+963947931959',
  phoneNumberDigits: '963947931959',
  email: 'info@alhaythamhoney.sy',
  workingHours: 'يومياً من 9 صباحاً حتى 9 مساءً',
  whatsappDefaultMessage: 'مرحباً عسل الهيثم، أود الاستفسار عن المنتج المعروض في الموقع.',
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=100064934053886',
  },
};

export const SHIPPING = {
  cost: 25000,
  freeThreshold: 500000,
};

export const getWhatsAppLink = (message?: string) => {
  const text = message?.trim();
  return text
    ? `https://wa.me/${SITE.phoneNumberDigits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${SITE.phoneNumberDigits}`;
};

export const getTelLink = () => `tel:${SITE.phoneNumber}`;
