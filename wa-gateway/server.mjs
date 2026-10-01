/**
 * بوابة واتساب لرموز الدخول — تربط رقماً احتياطياً كما يُربط «واتساب ويب» (مكتبة Baileys)
 * وتعرض واجهة HTTP داخلية فقط (شبكة Docker، بلا منفذ على الإنترنت) يستدعيها التطبيق:
 *
 *   GET  /health            بلا مصادقة — لفحص الحاوية
 *   GET  /status            الحالة، رمز QR أو رمز الربط الحالي، آخر خطأ
 *   POST /link   {mode, phone?}   يبدأ الربط: mode=qr أو code (رمز من 8 أحرف يُكتب في واتساب)
 *   POST /send   {to, text}       يرسل نصاً لرقم دولي بلا + (9639xxxxxxxx)
 *   POST /logout                  يفكّ الربط ويمسح الجلسة
 *
 * المصادقة: Authorization: Bearer HMAC-SHA256(ADMIN_SESSION_SECRET, "wa-gateway") — السر نفسه
 * الذي يملكه التطبيق، فلا متغيّر جديد في .env.production.
 */
import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { rm, mkdir } from 'node:fs/promises';
import pino from 'pino';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState as loadAuthState,
} from 'baileys';

const PORT = Number(process.env.PORT || 3010);
const AUTH_DIR = process.env.WA_AUTH_DIR || '/data/auth';
const SECRET = process.env.ADMIN_SESSION_SECRET || '';
/** ردّ آلي مرة يومياً لمن يراسل الرقم الآلي — يصل نصّه مع كل طلب إرسال من التطبيق */
let autoReply = process.env.WA_AUTO_REPLY || '';
/** فاصل أدنى بين رسالتين — إرسال متتابع سريع من رقم جديد أكثر ما يلفت أنظمة الحظر */
const MIN_GAP_MS = Number(process.env.WA_MIN_GAP_MS || 2500);
const LINK_TIMEOUT_MS = 3 * 60 * 1000;

if (SECRET.length < 16) {
  console.error('ADMIN_SESSION_SECRET مفقود أو قصير — لن تعمل البوابة.');
  process.exit(1);
}
const TOKEN = createHmac('sha256', SECRET).update('wa-gateway').digest('hex');
const logger = pino({ level: process.env.WA_LOG_LEVEL || 'warn' });

const state = {
  /** unlinked | linking | connecting | open */
  status: 'unlinked',
  me: null,
  qr: null,
  pairingCode: null,
  mode: null,
  lastError: null,
  lastErrorAt: null,
  connectedAt: null,
  sent: 0,
  failed: 0,
};

let sock = null;
let generation = 0;
let retry = 0;
let linkTimer = null;
let registered = false;
/** رسائل أُرسلت مؤخراً — يطلبها واتساب أحياناً لإعادة التشفير */
const recent = new Map();
const replied = new Map();

function fail(message) {
  state.lastError = message;
  state.lastErrorAt = new Date().toISOString();
  console.warn('[wa]', message);
}

async function wipeAuth() {
  await rm(AUTH_DIR, { recursive: true, force: true });
  await mkdir(AUTH_DIR, { recursive: true });
  registered = false;
}

function stopSocket() {
  generation++;
  try {
    sock?.end(undefined);
  } catch {}
  sock = null;
}

/** مربوط فعلاً: واتساب وقّع هوية الجهاز (يصحّ لطريقتي QR ورمز الربط) */
const isLinked = (creds) => Boolean(creds?.account);

async function start({ mode = null, phone = null, session = null } = {}) {
  stopSocket();
  const gen = generation;
  await mkdir(AUTH_DIR, { recursive: true });
  // بعد الربط مباشرة يطلب واتساب إعادة تشغيل — نُبقي الجلسة من الذاكرة لا من القرص
  // حتى لا نسبق كتابة الملفات
  const { state: auth, saveCreds } = session || (await loadAuthState(AUTH_DIR));
  registered = isLinked(auth.creds);
  if (!registered && !mode) {
    state.status = 'unlinked';
    return;
  }
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));
  state.status = registered ? 'connecting' : 'linking';
  state.mode = registered ? null : mode;
  state.qr = null;
  state.pairingCode = null;

  const s = makeWASocket({
    auth,
    version,
    logger,
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    getMessage: async (key) => recent.get(key.id),
  });
  sock = s;
  let pairingRequested = false;

  s.ev.on('creds.update', saveCreds);
  s.ev.on('connection.update', async (u) => {
    if (gen !== generation) return;
    if (u.qr) {
      if (mode === 'code' && phone && !pairingRequested) {
        pairingRequested = true;
        try {
          state.pairingCode = await s.requestPairingCode(phone);
        } catch (e) {
          fail(`تعذّر طلب رمز الربط: ${e?.message || e}`);
        }
      } else if (mode === 'qr') state.qr = u.qr;
    }
    if (u.connection === 'open') {
      clearTimeout(linkTimer);
      registered = true;
      retry = 0;
      state.status = 'open';
      state.qr = null;
      state.pairingCode = null;
      state.mode = null;
      state.connectedAt = new Date().toISOString();
      state.me = (s.user?.id || '').split(':')[0].split('@')[0] || null;
      console.info('[wa] connected as', state.me);
    }
    if (u.connection === 'close') {
      const code = u.lastDisconnect?.error?.output?.statusCode;
      if (gen !== generation) return;
      if (code === DisconnectReason.loggedOut || code === DisconnectReason.forbidden) {
        fail(
          code === DisconnectReason.forbidden
            ? 'رفض واتساب الرقم (403) — قد يكون محظوراً.'
            : 'فُكّ ربط الرقم من الهاتف — اربطه من جديد.',
        );
        stopSocket();
        await wipeAuth();
        Object.assign(state, { status: 'unlinked', me: null, qr: null, pairingCode: null });
        return;
      }
      if (code === DisconnectReason.restartRequired)
        return void start({ session: { state: auth, saveCreds } });
      if (!isLinked(auth.creds)) {
        // انتهت رموز الربط دون إتمام — نتوقّف بدل توليد رموز إلى ما لا نهاية
        stopSocket();
        Object.assign(state, { status: 'unlinked', qr: null, pairingCode: null, mode: null });
        fail('انتهت مهلة الربط دون إتمام — أعد المحاولة.');
        return;
      }
      state.status = 'connecting';
      const delay = Math.min(60_000, 2000 * 2 ** Math.min(retry++, 5));
      fail(`انقطع الاتصال (${code ?? 'بلا رمز'}) — إعادة المحاولة بعد ${delay / 1000} ث.`);
      setTimeout(() => gen === generation && start(), delay);
    }
  });

  s.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' || !autoReply) return;
    for (const m of messages) {
      const jid = m.key.remoteJid;
      if (!jid || m.key.fromMe || jid.endsWith('@g.us') || jid.endsWith('@broadcast')) continue;
      const last = replied.get(jid) || 0;
      if (Date.now() - last < 24 * 3600 * 1000) continue;
      replied.set(jid, Date.now());
      await enqueue(() => s.sendMessage(jid, { text: autoReply })).catch(() => {});
    }
  });

  if (!registered) {
    clearTimeout(linkTimer);
    linkTimer = setTimeout(() => {
      if (gen !== generation || state.status === 'open') return;
      stopSocket();
      Object.assign(state, { status: 'unlinked', qr: null, pairingCode: null, mode: null });
      fail('انتهت مهلة الربط دون إتمام.');
    }, LINK_TIMEOUT_MS);
  }
}

let queue = Promise.resolve();
let lastSend = 0;
function enqueue(task) {
  const run = queue.then(async () => {
    const wait = lastSend + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    try {
      return await task();
    } finally {
      lastSend = Date.now();
    }
  });
  queue = run.catch(() => {});
  return run;
}

async function send(to, text) {
  if (state.status !== 'open' || !sock) {
    const err = new Error('not_connected');
    err.status = 503;
    throw err;
  }
  const s = sock;
  const [found] = await s.onWhatsApp(to);
  if (!found?.exists) {
    const err = new Error('not_on_whatsapp');
    err.status = 422;
    throw err;
  }
  return enqueue(async () => {
    await s.sendPresenceUpdate('composing', found.jid).catch(() => {});
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 900));
    const msg = await s.sendMessage(found.jid, { text });
    await s.sendPresenceUpdate('paused', found.jid).catch(() => {});
    if (msg?.key?.id) {
      recent.set(msg.key.id, msg.message);
      if (recent.size > 200) recent.delete(recent.keys().next().value);
    }
    state.sent++;
    return msg?.key?.id ?? null;
  });
}

function authorized(req) {
  const header = req.headers.authorization || '';
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ''));
  const want = Buffer.from(TOKEN);
  return given.length === want.length && timingSafeEqual(given, want);
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 16_384) throw Object.assign(new Error('too_large'), { status: 413 });
  }
  return raw ? JSON.parse(raw) : {};
}

const json = (res, status, data) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
};
const digits = (v) => String(v ?? '').replace(/\D/g, '');

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://x');
    if (req.method === 'GET' && pathname === '/health') return json(res, 200, { ok: true });
    if (!authorized(req)) return json(res, 401, { error: 'unauthorized' });

    if (req.method === 'GET' && pathname === '/status') return json(res, 200, state);

    if (req.method === 'POST' && pathname === '/link') {
      const { mode, phone } = await body(req);
      if (state.status === 'open') return json(res, 409, { error: 'already_linked' });
      if (mode !== 'qr' && mode !== 'code') return json(res, 400, { error: 'bad_mode' });
      const number = digits(phone);
      if (mode === 'code' && !/^\d{8,15}$/.test(number))
        return json(res, 400, { error: 'bad_phone' });
      retry = 0;
      state.lastError = null;
      await wipeAuth();
      await start({ mode, phone: number });
      // ننتظر أول رمز (حتى 20 ث) ليعود الطلب بشيء يُعرض
      for (let i = 0; i < 40 && !state.qr && !state.pairingCode; i++)
        await new Promise((r) => setTimeout(r, 500));
      return json(res, 200, state);
    }

    if (req.method === 'POST' && pathname === '/send') {
      const { to, text, reply } = await body(req);
      if (typeof reply === 'string' && reply.length <= 1000) autoReply = reply;
      const number = digits(to);
      if (!/^\d{8,15}$/.test(number) || typeof text !== 'string' || !text || text.length > 2000)
        return json(res, 400, { error: 'bad_request' });
      try {
        const id = await send(number, text);
        return json(res, 200, { ok: true, id });
      } catch (e) {
        state.failed++;
        if (!e.status) fail(`فشل الإرسال: ${e?.message || e}`);
        return json(res, e.status || 502, { error: e.message || 'send_failed' });
      }
    }

    if (req.method === 'POST' && pathname === '/logout') {
      try {
        if (state.status === 'open') await sock?.logout();
      } catch {}
      stopSocket();
      await wipeAuth();
      Object.assign(state, { status: 'unlinked', me: null, qr: null, pairingCode: null });
      return json(res, 200, state);
    }

    return json(res, 404, { error: 'not_found' });
  } catch (e) {
    return json(res, e.status || 500, { error: e.message || 'error' });
  }
}).listen(PORT, () => {
  console.info(`[wa] gateway on :${PORT}`);
  start().catch((e) => fail(`تعذّر بدء الجلسة: ${e?.message || e}`));
});

for (const sig of ['SIGTERM', 'SIGINT'])
  process.on(sig, () => {
    try {
      sock?.end(undefined);
    } catch {}
    process.exit(0);
  });
