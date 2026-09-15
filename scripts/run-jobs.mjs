// Invoked by systemd/cron inside the app container; no secrets in command arguments.
const secret = process.env.CRON_SECRET;
if (!secret || secret.length < 32 || /CHANGE_ME/i.test(secret)) {
  throw new Error('Configure a random CRON_SECRET of at least 32 characters.');
}
const response = await fetch(`http://127.0.0.1:${process.env.PORT || 3005}/api/cron`, {
  headers: { Authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(55000),
});
if (!response.ok) throw new Error(`Background jobs failed: HTTP ${response.status}`);
console.info('[jobs]', await response.json());
