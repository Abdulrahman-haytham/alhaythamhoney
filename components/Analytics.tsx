import React from 'react';

interface AnalyticsProps {
  measurementId?: string;
}

/**
 * Google Analytics GA4 Component
 * 
 * To enable analytics:
 * 1. Create a GA4 property at https://analytics.google.com
 * 2. Add GA_MEASUREMENT_ID to your .env file
 * 3. The component will automatically load the GA script
 */
export const Analytics: React.FC<AnalyticsProps> = ({ measurementId }) => {
  React.useEffect(() => {
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      return; // Skip if not configured
    }

    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize GA
    (window as unknown as Record<string, unknown>).dataLayer = (window as unknown as Record<string, unknown>).dataLayer || [];
    function gtag(..._args: unknown[]) {
      ((window as unknown as Record<string, unknown>).dataLayer as unknown[]).push(_args);
    }
    gtag('js', new Date());
    gtag('config', measurementId);

    return () => {
      // Cleanup is not needed as GA script stays
    };
  }, [measurementId]);

  return null;
};
