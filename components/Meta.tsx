import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

type MetaProps = {
  title: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  canonical?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  children?: React.ReactNode;
};

const SITE_NAME = 'الهيثم نحل و عسل';
const DEFAULT_DESCRIPTION =
  'عسل طبيعي 100% مفحوص مخبرياً من مراعي سوريا. خبرة عائلية منذ 1997، شحن آمن لكل المحافظات. اطلب الآن عبر واتساب.';
const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/dkbvnupge/image/upload/f_auto,q_auto/v1767958674/my-app-uploads/kromozksoa3vpcwrnvtw.jpg';
const FALLBACK_ORIGIN = 'https://alhaythamhoney.sy';

export const Meta: React.FC<MetaProps> = ({
  title,
  description,
  keywords,
  image,
  canonical,
  type = 'website',
  noIndex = false,
  children
}) => {
  const location = useLocation();

  const origin = typeof window !== 'undefined' ? window.location.origin : FALLBACK_ORIGIN;
  const canonicalUrl = canonical ?? `${origin}${location.pathname}`;
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION;
  const resolvedImage = image ?? DEFAULT_OG_IMAGE;
  const resolvedKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={resolvedDescription} />
      {resolvedKeywords ? <meta name="keywords" content={resolvedKeywords} /> : null}
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:locale" content="ar_SY" />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />
      {children}
    </Helmet>
  );
};

