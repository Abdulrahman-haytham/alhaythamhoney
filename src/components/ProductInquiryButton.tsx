'use client';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/config';
import { trackWhatsAppClick } from '@/lib/analytics';

export default function ProductInquiryButton({
  productName,
  className = '',
}: {
  productName: string;
  className?: string;
}) {
  return (
    <a
      href={getWhatsAppLink(`مرحباً، أود الاستفسار عن ${productName} وإمكانية طلبه.`)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('product-inquiry')}
      className={className}
    >
      <MessageCircle className="h-4 w-4" /> استفسر عبر واتساب
    </a>
  );
}
