import { redirect, permanentRedirect } from 'next/navigation';

/** مسار بديل قديم — يُحوَّل نهائياً إلى /shop حفاظاً على الروابط الخارجية. */
export default function StoreAlias() {
  permanentRedirect('/shop');
}