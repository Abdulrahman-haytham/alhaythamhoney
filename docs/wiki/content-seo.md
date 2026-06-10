# Content & SEO

The app is designed for SEO-heavy marketing content (static pages + markdown articles) and provides both global and per-route SEO primitives.

## Articles (Markdown)

### Source of truth
- Markdown files live in [content/articles](file:///workspace/content/articles).
- The registry in [articles.ts](file:///workspace/data/articles.ts) imports them as raw strings via Vite `?raw` (e.g. [articles.ts](file:///workspace/data/articles.ts#L2-L10)).

### Rendering pipeline
- Pages pull `Article.content` from the registry and render it using [MarkdownContent](file:///workspace/components/MarkdownContent.tsx).
- Markdown to HTML conversion happens client-side using Unified/Remark:
  - parse: `remark-parse`
  - transform: `remark-html`
  - sanitize: `rehype-sanitize`
  - code path: [MarkdownContent](file:///workspace/components/MarkdownContent.tsx#L15-L42)

## Products (Static Catalog)
- The catalog is defined as grouped static data in [products.tsx](file:///workspace/data/products.tsx).
- Product pages look up items by slug (`/product/:slug`) by flattening all groups in [ProductDetailsPage](file:///workspace/pages/ProductDetailsPage.tsx#L14-L18).

## Meta Tags (Per Route)
- The shared SEO component [Meta](file:///workspace/components/Meta.tsx) sets:
  - `<title>` and `meta[name=description]`
  - canonical link using current route via `useLocation` ([Meta](file:///workspace/components/Meta.tsx#L33-L48))
  - Open Graph and Twitter card tags ([Meta](file:///workspace/components/Meta.tsx#L49-L61))

## Structured Data (Schema.org)
- `index.html` includes site-level structured data (Organization/LocalBusiness) as JSON-LD.
- Product pages inject product-level schema via `Meta` children in [ProductDetailsPage](file:///workspace/pages/ProductDetailsPage.tsx#L41-L83).

## Sitemap
- A static [public/sitemap.xml](file:///workspace/public/sitemap.xml) exists for production.
- A dynamic generator is available in [generate-sitemap.ts](file:///workspace/scripts/generate-sitemap.ts) and derives URLs from:
  - the static route list
  - [articles](file:///workspace/data/articles.ts)
  - [groups](file:///workspace/data/products.tsx)

## Analytics
- GA4 can be loaded through [Analytics](file:///workspace/components/Analytics.tsx). It is currently not mounted in [App.tsx](file:///workspace/App.tsx).
- `index.html` includes a commented GA placeholder block ([index.html](file:///workspace/index.html#L87-L102)).

