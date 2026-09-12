import QRCode from 'qrcode';
import { getContact } from '@/lib/contacts';
import { SITE } from '@/lib/config';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getContact(slug)) return new Response(null, { status: 404 });
  const svg = await QRCode.toString(`${SITE.url}/q/${slug}`, {
    type: 'svg',
    margin: 4,
    errorCorrectionLevel: 'M',
  });
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
