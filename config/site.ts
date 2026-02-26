export const SITE = {
  phoneNumber: "+963947931959",
  phoneNumberDigits: "963947931959",
  whatsappDefaultMessage:
    "مرحباً عسل الهيثم، أود الاستفسار عن المنتج المعروض في الموقع."
};

export const getWhatsAppLink = (message?: string) => {
  if (message && message.trim().length > 0) {
    return `https://wa.me/${SITE.phoneNumberDigits}?text=${encodeURIComponent(
      message
    )}`;
  }
  return `https://wa.me/${SITE.phoneNumberDigits}`;
};

export const getTelLink = () => `tel:${SITE.phoneNumber}`;
