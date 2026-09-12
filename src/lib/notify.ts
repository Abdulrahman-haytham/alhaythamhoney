import 'server-only';
import { SITE } from '@/lib/config';

/**
 * إشعار فوري لصاحب المتجر عند وصول طلب جديد.
 *
 * القنوات تُفعَّل بمتغيرات البيئة، وأي قناة غير مضبوطة تُتجاهَل بصمت.
 * لا يرمي هذا الملف أبداً: فشل الإشعار يجب ألا يُفشل طلب العميل.
 *
 *   TELEGRAM_BOT_TOKEN   توكن البوت من @BotFather
 *   TELEGRAM_CHAT_ID     معرّف محادثتك أو مجموعتك
 *   ORDER_WEBHOOK_URL    أي رابط يستقبل POST بصيغة JSON (Make/Zapier/n8n…)
 */

export interface OrderNotification {
  reference: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  notes?: string | null;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
}

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

function buildText(o: OrderNotification): string {
  const lines = [
    '🍯 طلب جديد',
    '',
    `📄 الرقم: ${o.reference}`,
    `👤 ${o.customerName}`,
    `📞 ${o.customerPhone}`,
    `📍 ${o.customerCity} — ${o.customerAddress}`,
    '',
    '🛒 الطلب:',
    ...o.items.map((i) => `  • ${i.name} × ${i.quantity} — ${fmt(i.price * i.quantity)} ل.س`),
    '',
    `💰 الإجمالي: ${fmt(o.totalAmount)} ل.س`,
  ];
  if (o.notes) lines.push('', `📝 ${o.notes}`);
  lines.push('', `🔗 ${SITE.url}/admin`);
  return lines.join('\n');
}

async function post(url: string, body: unknown, timeoutMs = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    if (!res.ok) {
      console.error(`[notify] ${url.split('/')[2]} ردّ بـ ${res.status}`);
    }
  } catch (err) {
    console.error('[notify] فشل الإرسال:', err instanceof Error ? err.message : err);
  } finally {
    clearTimeout(t);
  }
}

export async function notifyNewOrder(order: OrderNotification): Promise<void> {
  const text = buildText(order);
  const jobs: Promise<void>[] = [];

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    jobs.push(
      post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      })
    );
  }

  const webhook = process.env.ORDER_WEBHOOK_URL;
  if (webhook) {
    jobs.push(post(webhook, { text, order }));
  }

  if (jobs.length === 0) {
    // لا قناة مضبوطة — نسجّل الطلب في السجل حتى لا يمرّ دون أثر
    console.warn('[notify] لا توجد قناة إشعار مضبوطة. الطلب:\n' + text);
    return;
  }

  await Promise.allSettled(jobs);
}