const required = ['DATABASE_URL', 'ADMIN_SESSION_SECRET', 'NEXT_PUBLIC_SITE_URL'];
for (const name of required) {
  if (!process.env[name] || /CHANGE_ME/i.test(process.env[name]))
    throw new Error(`Configure ${name} before starting.`);
}
const secret = process.env.ADMIN_SESSION_SECRET;
if (secret.length < 32)
  throw new Error('ADMIN_SESSION_SECRET must contain at least 32 random characters.');
const url = new URL(process.env.NEXT_PUBLIC_SITE_URL);
if (
  !['http:', 'https:'].includes(url.protocol) ||
  url.pathname !== '/' ||
  url.search ||
  url.hash ||
  url.username ||
  url.password
) {
  throw new Error('NEXT_PUBLIC_SITE_URL must be an origin such as https://alhaythamhoney.sy');
}
if (
  process.env.NODE_ENV === 'production' &&
  url.protocol !== 'https:' &&
  url.hostname !== 'localhost' &&
  url.hostname !== '127.0.0.1'
) {
  throw new Error('HTTPS is required in production.');
}
if (process.env.TRUST_PROXY && !['0', '1'].includes(process.env.TRUST_PROXY))
  throw new Error('TRUST_PROXY must be 0 or 1.');
