import { SITE } from '@/lib/config';

/**
 * بيانات Schema.org على مستوى الموقع: المؤسسة، النشاط المحلي، ومربع البحث.
 * تُحقن مرة واحدة من التخطيط الجذري.
 */
export function StructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE.url}/#organization`,
        name: SITE.name,
        alternateName: 'Al-Haytham Honey',
        url: SITE.url,
        email: SITE.email,
        telephone: SITE.phoneNumber,
        foundingDate: String(SITE.foundedYear),
        description: SITE.tagline,
        sameAs: [SITE.social.facebook].filter((u) => u && u !== '#'),
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE.url}/#localbusiness`,
        name: SITE.name,
        image: `${SITE.url}/apple-touch-icon.png`,
        url: SITE.url,
        telephone: SITE.phoneNumber,
        email: SITE.email,
        priceRange: '$$',
        parentOrganization: { '@id': `${SITE.url}/#organization` },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'الحي الشمالي، جانب مسجد بلال الحبشي',
          addressLocality: 'قمحانة',
          addressRegion: 'حماة',
          addressCountry: 'SY',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 35.2118,
          longitude: 36.7145,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Saturday',
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
            ],
            opens: '09:00',
            closes: '21:00',
          },
        ],
        areaServed: { '@type': 'Country', name: 'سوريا' },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        inLanguage: 'ar',
        publisher: { '@id': `${SITE.url}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
