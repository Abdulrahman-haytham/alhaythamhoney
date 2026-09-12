import { getContact } from '@/lib/contacts';
import { buildVCard } from '@/lib/vcard';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contact = getContact(slug);
  if (!contact) return new Response(null, { status: 404 });
  return new Response(buildVCard(contact), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${contact.slug}.vcf"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
