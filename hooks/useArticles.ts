import { useQuery } from '@tanstack/react-query';
import { api, type ApiArticle } from '../lib/api';
import type { Article } from '../data/articles';

function mapArticle(a: ApiArticle): Article {
  return {
    id: a.slug,
    title: a.title,
    description: a.description,
    content: a.content ?? '',
    keywords: a.keywords ?? [],
    image: a.imageUrl ?? undefined,
  };
}

/** Published article metadata, shaped like the legacy `articles` export. */
export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => (await api.getArticles()).map(mapArticle),
  });
}

/** Full article (with content) by slug. */
export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => mapArticle(await api.getArticle(slug as string)),
    enabled: !!slug,
  });
}
