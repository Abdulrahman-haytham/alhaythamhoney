// Lightweight fetch client for the NestJS backend.
// Configure the base URL via VITE_API_URL (see .env.example).

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

// ----- Raw API response shapes (as returned by the backend) -----

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  benefit: string | null;
  badge: string | null;
  imageUrl: string;
  price: number | null;
  detailedInfo: {
    uses?: string[];
    benefits?: string[];
    properties?: string[];
    howToUse?: string;
  } | null;
}

export interface ApiProductGroup {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  layout: 'grid' | 'lab';
  iconName: string;
  products: ApiProduct[];
}

export interface ApiArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  content?: string;
  keywords: string[];
  imageUrl?: string | null;
}

export const api = {
  getProductGroups: () => request<ApiProductGroup[]>('/product-groups'),
  getProduct: (slug: string) => request<ApiProduct>(`/products/${slug}`),
  getArticles: () => request<ApiArticle[]>('/articles'),
  getArticle: (slug: string) => request<ApiArticle>(`/articles/${slug}`),
};
