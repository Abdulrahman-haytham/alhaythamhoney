/** Merchant feeds require verified availability; this catalogue has no stock ledger. */
export async function GET() {
  return new Response('Product feed retired. Browse /shop for the current catalogue.', {
    status: 410,
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
