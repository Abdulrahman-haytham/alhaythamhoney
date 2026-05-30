import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Droplets, Sparkles, type LucideProps } from 'lucide-react';
import { api, type ApiProduct, type ApiProductGroup } from '../lib/api';
import type { ProductGroup, ProductItem } from '../data/products';

// Map the backend `iconName` string back to a rendered lucide icon node,
// preserving the original frontend `ProductGroup.icon: React.ReactNode` shape.
const ICONS: Record<string, React.FC<LucideProps>> = {
  Droplets,
  Sparkles,
};

function renderIcon(iconName: string): React.ReactNode {
  const Icon = ICONS[iconName] ?? Droplets;
  return <Icon className="w-6 h-6 text-amber-500" />;
}

function mapProduct(p: ApiProduct): ProductItem {
  return {
    id: p.slug,
    name: p.name,
    desc: p.description,
    image: p.imageUrl,
    badge: p.badge ?? undefined,
    benefit: p.benefit ?? undefined,
    detailedInfo: p.detailedInfo ?? undefined,
  };
}

function mapGroup(g: ApiProductGroup): ProductGroup {
  return {
    id: g.slug,
    title: g.title,
    subtitle: g.subtitle,
    icon: renderIcon(g.iconName),
    layout: g.layout,
    items: (g.products ?? []).map(mapProduct),
  };
}

/** Product groups (with nested items), shaped like the legacy `groups` export. */
export function useProductGroups() {
  return useQuery({
    queryKey: ['product-groups'],
    queryFn: async () => (await api.getProductGroups()).map(mapGroup),
  });
}

/** Single product by slug, shaped like the legacy `ProductItem`. */
export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => mapProduct(await api.getProduct(slug as string)),
    enabled: !!slug,
  });
}
