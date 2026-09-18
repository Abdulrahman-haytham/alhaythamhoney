// يشغّله مؤقّت systemd داخل حاوية التطبيق — لا أسرار في سطر الأوامر.
const secret = process.env.CRON_SECRET;
if (!secret || secret.length < 32 || /CHANGE_ME/i.test(secret)) {
  throw new Error('اضبط CRON_SECRET عشوائياً بطول 32 حرفاً على الأقل.');
}
const response = await fetch(`http://127.0.0.1:${process.env.PORT || 3005}/api/cron`, {
  headers: { Authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(55000),
});
if (!response.ok) throw new Error(`تعذّر تشغيل المهام الدورية: HTTP ${response.status}`);
console.info('[jobs]', await response.json());
