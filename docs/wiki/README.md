# Code Wiki

This repository is a React + TypeScript single-page application (SPA) for “الهيثم نحل و عسل” (Al-Haytham Bee & Honey). It is built with Vite, styled with Tailwind CSS, and deployed to GitHub Pages.

**Quick Links**
- Entrypoints: [index.html](file:///workspace/index.html), [index.tsx](file:///workspace/index.tsx), [App.tsx](file:///workspace/App.tsx)
- Routing pages: [pages/](file:///workspace/pages)
- Shared UI: [components/](file:///workspace/components)
- State: [CartContext](file:///workspace/context/CartContext.tsx), [WishlistContext](file:///workspace/context/WishlistContext.tsx)
- Static catalog & content: [products.tsx](file:///workspace/data/products.tsx), [articles.ts](file:///workspace/data/articles.ts), [content/articles](file:///workspace/content/articles)

## Wiki Contents
- [Architecture](./architecture.md)
- [Modules](./modules.md)
- [State Management](./state-management.md)
- [Content & SEO](./content-seo.md)
- [Build & Deploy](./build-deploy.md)
- [API Reference](./api-reference.md)
- [Running Locally](./running.md)

## High-Level Data Flow

```mermaid
flowchart TD
  A[index.html] --> B[index.tsx]
  B --> C[App.tsx]
  C --> D[React Router routes]
  D --> E[Pages]
  E --> F[Components]
  E --> G[data/products.tsx]
  E --> H[data/articles.ts -> markdown ?raw]
  F --> I[CartContext / WishlistContext]
  F --> J[config/site.ts (WhatsApp/tel links)]
  E --> K[Meta (SEO)]
```

