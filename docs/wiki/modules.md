# Modules

This repo is organized feature-first at the route/page level, with reusable components underneath.

## Root
- [App.tsx](file:///workspace/App.tsx): Provider composition + router + global overlays.
- [index.tsx](file:///workspace/index.tsx): React mount + splash-loader reveal + React Query provider.
- [index.html](file:///workspace/index.html): SEO/structured data, splash loader, SPA redirect fix.
- Tooling configs: [vite.config.ts](file:///workspace/vite.config.ts), [tsconfig.json](file:///workspace/tsconfig.json), [tailwind.config.js](file:///workspace/tailwind.config.js), [vitest.config.ts](file:///workspace/vitest.config.ts), [eslint.config.js](file:///workspace/eslint.config.js).

## pages/
Route-level components that compose the UI. These should generally avoid deeply reusable UI primitives and instead orchestrate sections and data.
- Entry: routes declared in [App.tsx](file:///workspace/App.tsx#L99-L116)
- Examples:
  - Product detail: [ProductDetailsPage](file:///workspace/pages/ProductDetailsPage.tsx)
  - Articles: [ArticlesPage](file:///workspace/pages/ArticlesPage.tsx), [ArticleDetailPage](file:///workspace/pages/ArticleDetailPage.tsx)
  - Commerce: [CartPage](file:///workspace/pages/CartPage.tsx), [WishlistPage](file:///workspace/pages/WishlistPage.tsx)

## components/
Reusable UI and cross-cutting UX behaviors. Broadly grouped by responsibility:
- **App shell**: [Header](file:///workspace/components/Header.tsx), [Footer](file:///workspace/components/Footer.tsx), [ScrollToTop](file:///workspace/components/ScrollToTop.tsx)
- **Overlays**: [CartSidebar](file:///workspace/components/CartSidebar.tsx), [WishlistSidebar](file:///workspace/components/WishlistSidebar.tsx), [SearchBar](file:///workspace/components/SearchBar.tsx)
- **SEO helpers**: [Meta](file:///workspace/components/Meta.tsx), [Breadcrumbs](file:///workspace/components/Breadcrumbs.tsx)
- **Content rendering**: [MarkdownContent](file:///workspace/components/MarkdownContent.tsx)
- **Error isolation**: [ErrorBoundary](file:///workspace/components/ErrorBoundary.tsx)
- **Feature sections** (home/about/quality pages): Hero, Story, Stats, WhyChooseUs, etc. in [components/](file:///workspace/components)
- **Custom mixtures**: [SmartMixtureAssistant](file:///workspace/components/SmartMixtureAssistant.tsx)

## context/
Global state containers implemented via React Context + reducers.
- Cart: [CartContext](file:///workspace/context/CartContext.tsx)
- Wishlist: [WishlistContext](file:///workspace/context/WishlistContext.tsx)

## hooks/
Ergonomic accessors around contexts.
- [useCart](file:///workspace/hooks/useCart.ts)
- [useWishlist](file:///workspace/hooks/useWishlist.ts)

## data/
Static data sources (effectively a built-in “catalog/content DB”).
- Products grouped and typed: [products.tsx](file:///workspace/data/products.tsx)
- Articles registry importing markdown as raw strings: [articles.ts](file:///workspace/data/articles.ts)

## content/
Markdown content for SEO articles.
- Sources: [content/articles](file:///workspace/content/articles)
- Imported via Vite `?raw` in [articles.ts](file:///workspace/data/articles.ts#L2-L10)

## config/
Site-level constants and helper functions.
- WhatsApp and tel link helpers: [site.ts](file:///workspace/config/site.ts)

## scripts/
Build-time scripts and utilities.
- Dist cleanup (prebuild): [clean-dist.mjs](file:///workspace/scripts/clean-dist.mjs)
- Sitemap generator (can be invoked manually): [generate-sitemap.ts](file:///workspace/scripts/generate-sitemap.ts)

## tests/
Test setup and component tests.
- Vitest + Testing Library setup: [setup.ts](file:///workspace/tests/setup.ts)
- Example test: [ErrorBoundary.test.tsx](file:///workspace/components/ErrorBoundary.test.tsx)

