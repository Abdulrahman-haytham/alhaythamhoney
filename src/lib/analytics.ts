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

type EventType =
  'PRODUCT_VIEW' | 'ADD_TO_CART' | 'WHATSAPP_CLICK' | 'CHECKOUT' | 'SEARCH' | 'PAGE_VIEW' | 'VISIT';

/**
 * حدث داخلي للوحة مؤشرات الأدمن — مستقل عن GA/Meta ويعمل حتى بلا أي منهما.
 * sendBeacon يضمن الوصول حتى عند مغادرة الصفحة (نقرة واتساب تفتح تبويباً جديداً).
 */
export function recordEvent(type: EventType, key?: string | null, value?: number | null) {
  const win = w();
  if (!win) return;
  try {
    const body = JSON.stringify({ type, key: key ?? null, value: value ?? null });
    const blob = new Blob([body], { type: 'application/json' });
    if (!navigator.sendBeacon?.('/api/events', blob))
      void fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => null);
  } catch {
    // لا تعطيل للواجهة
  }
}

/** بحث في الموقع — يُسجَّل بعد توقف الكتابة لالتقاط ما يبحث عنه الزوار ولا يجدونه */
export function trackSearch(term: string, results: number) {
  recordEvent('SEARCH', term.trim().slice(0, 120), results);
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
}) {
  const value = (item.price ?? 0) * (item.quantity ?? 1);
  recordEvent('ADD_TO_CART', item.id);
  send('add_to_cart', 'AddToCart', {
    currency: SYP,
    value,
    content_ids: [item.id],
    content_name: item.name,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price ?? 0,
        quantity: item.quantity ?? 1,
      },
    ],
  });
}

export function trackBeginCheckout(
  value: number,
  items: { id: string; name: string; price?: number; quantity: number }[],
) {
  recordEvent('CHECKOUT', null, value);
  send('begin_checkout', 'InitiateCheckout', {
    currency: SYP,
    value,
    num_items: items.reduce((s, i) => s + i.quantity, 0),
    content_ids: items.map((i) => i.id),
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price ?? 0,
      quantity: i.quantity,
    })),
  });
}

export function trackViewItem(item: { id: string; name: string; price?: number }) {
  recordEvent('PRODUCT_VIEW', item.id);
  send('view_item', 'ViewContent', {
    currency: SYP,
    value: item.price ?? 0,
    content_ids: [item.id],
    content_name: item.name,
  });
}

/** نقر واتساب — أهم تحويل غير مباشر في هذا المتجر. */
export function trackWhatsAppClick(context: string) {
  recordEvent('WHATSAPP_CLICK', context);
  send('contact', 'Contact', { method: 'whatsapp', context });
}

/** يصنّف من أين جاء الزائر من عنوان الإحالة — أسماء قليلة مفهومة بدل عناوين خام. */
function visitSource(referrer: string, search: string): string {
  const utm = new URLSearchParams(search).get('utm_source');
  if (utm) return utm.toLowerCase().slice(0, 40);
  if (!referrer) return 'مباشر';
  let host: string;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return 'مباشر';
  }
  if (host === window.location.hostname) return 'داخلي';
  if (/google\./.test(host)) return 'غوغل';
  if (/bing\.|duckduckgo\./.test(host)) return 'محرك بحث آخر';
  if (/facebook\.|fb\./.test(host)) return 'فيسبوك';
  if (/instagram\./.test(host)) return 'إنستغرام';
  if (/whatsapp\./.test(host)) return 'واتساب';
  if (/t\.co$|twitter\.|x\.com$/.test(host)) return 'إكس';
  if (/t\.me$|telegram\./.test(host)) return 'تلغرام';
  if (/youtube\.|youtu\.be$/.test(host)) return 'يوتيوب';
  return host.slice(0, 40);
}

/**
 * زيارة صفحة. تُسجَّل مرة لكل مسار، ويُسجَّل المصدر والجهاز مرة واحدة لكل جلسة
 * (لا لكل صفحة) حتى لا تتضخّم القاعدة. صفحات الإدارة لا تُتتبَّع.
 */
export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;
  if (path.startsWith('/admin') || path.startsWith('/api')) return;
  recordEvent('PAGE_VIEW', path.slice(0, 120));
  try {
    if (sessionStorage.getItem('haytham-visit')) return;
    sessionStorage.setItem('haytham-visit', '1');
    const mobile = window.matchMedia('(max-width: 767px)').matches ? 1 : 0;
    recordEvent('VISIT', visitSource(document.referrer, window.location.search), mobile);
  } catch {
    // وضع التصفّح الخاص قد يمنع sessionStorage — الزيارة تُحتسب والمصدر يُهمل
  }
}
