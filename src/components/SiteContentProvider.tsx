'use client';

import { createContext, useContext } from 'react';
import type { SiteContentFlags } from '@/lib/content.server';

const EMPTY: SiteContentFlags = { hasStudioPhotos: false };

const SiteContentContext = createContext<SiteContentFlags>(EMPTY);

/** يوصل «ما يملكه الموقع من محتوى» إلى مكوّنات المتصفح مثل الرأس والتذييل. */
export function SiteContentProvider({
  flags,
  children,
}: {
  flags: SiteContentFlags;
  children: React.ReactNode;
}) {
  return <SiteContentContext.Provider value={flags}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentFlags {
  return useContext(SiteContentContext);
}
