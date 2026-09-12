/**
 * طبقة أحداث موحّدة فوق GA4 و Meta Pixel.
 * آمنة دائماً: إن لم يُحمَّل أي منهما لا يحدث شيء.
 */

type Params = Record<string, unknown>;

interface AnalyticsWindow {
  gtag?: (command: string, event: string, params?: Params) => void;
  fbq?: (command: string, event: string, params?: Params) => void;
}

const w = () => (typeof window === 'undefined' ? null : (window as unknown as AnalyticsWindow));

/** حدث مخصص يُرسل للمنصتين بأسمائهما المعيارية. */
function send(gaEvent: string, metaEvent: string | null, params: Params = {}) {
  const win = w();
  if (!win) return;
  try {
    win.gtag?.('event', gaEvent, params);
    if (metaEvent) win.fbq?.('track', metaEvent, params);
  } catch {
    // التحليلات لا تُعطّل الواجهة أبداً
  }
}

const SYP = 'SYP';

export function trackAddToCart(item: { id: string; name: string; price?: number; quantity?: number }) {
  const value = (item.price ?? 0) * (item.quantity ?? 1);
  send('add_to_cart', 'AddToCart', {
    currency: SYP,
    value,
    content_ids: [item.id],
    content_name: item.name,
    items: [{ item_id: item.id, item_name: item.name, price: item.price ?? 0, quantity: item.quantity ?? 1 }],
  });
}

export function trackBeginCheckout(value: number, items: { id: string; name: string; price?: number; quantity: number }[]) {
  send('begin_checkout', 'InitiateCheckout', {
    currency: SYP,
    value,
    num_items: items.reduce((s, i) => s + i.quantity, 0),
    content_ids: items.map((i) => i.id),
    items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price ?? 0, quantity: i.quantity })),
  });
}

export function trackPurchase(reference: string, value: number) {
  send('purchase', 'Purchase', {
    transaction_id: reference,
    currency: SYP,
    value,
  });
}

export function trackViewItem(item: { id: string; name: string; price?: number }) {
  send('view_item', 'ViewContent', {
    currency: SYP,
    value: item.price ?? 0,
    content_ids: [item.id],
    content_name: item.name,
  });
}

/** نقر واتساب — أهم تحويل غير مباشر في هذا المتجر. */
export function trackWhatsAppClick(context: string) {
  send('contact', 'Contact', { method: 'whatsapp', context });
}