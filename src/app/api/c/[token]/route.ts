import { trackOpen } from '@/lib/campaigns.server';

export const dynamic = 'force-dynamic';

// GIF شفاف 1×1
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

/** صورة تتبّع فتح الحملة — تُسجَّل مرة واحدة ولا تكشف شيئاً */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (/^[a-f0-9]{32}$/.test(token)) await trackOpen(token).catch(() => null);
  return new Response(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Length': String(PIXEL.length),
    },
  });
}
