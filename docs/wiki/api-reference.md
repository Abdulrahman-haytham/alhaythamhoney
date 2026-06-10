# API Reference (Key Code)

This is not an exhaustive API reference (the app is mostly component composition), but it documents the most important “logic-bearing” functions and state machines.

## Bootstrap

### Splash reveal sequence
- File: [index.tsx](file:///workspace/index.tsx#L13-L36)
- Purpose: keeps the splash loader visible until full `window.load` and a small paint buffer, then:
  - adds `ready` class to `#root`
  - fades out and removes `#splash-loader`

## Routing

### Route definitions
- File: [App.tsx](file:///workspace/App.tsx#L15-L50) (lazy page imports), [App.tsx](file:///workspace/App.tsx#L99-L116) (route table)

### GitHub Pages redirect fix
- File: [App.tsx](file:///workspace/App.tsx#L73-L80)
- Reads `?p=` query param and `history.replaceState` to restore the original SPA route.

## Site Helpers

### getWhatsAppLink
- File: [site.ts](file:///workspace/config/site.ts#L8-L15)
- Signature: `getWhatsAppLink(message?: string) => string`
- Behavior:
  - If message is non-empty, encodes it into `https://wa.me/<digits>?text=<encoded>`
  - Otherwise returns `https://wa.me/<digits>`

## Cart State

### cartReducer
- File: [CartContext](file:///workspace/context/CartContext.tsx#L31-L75)
- Actions:
  - `ADD_ITEM`: increments quantity if existing, else adds item with `quantity: 1`
  - `REMOVE_ITEM`
  - `UPDATE_QUANTITY`: clamps at `>= 0` and removes any items that drop to 0
  - `CLEAR_CART`
  - `OPEN_CART` / `CLOSE_CART` / `TOGGLE_CART`

### Derived: totalItems
- File: [CartContext](file:///workspace/context/CartContext.tsx#L121-L126)
- Computed as the sum of all item quantities.

## Wishlist State

### wishlistReducer
- File: [WishlistContext](file:///workspace/context/WishlistContext.tsx#L49-L75)
- Actions:
  - `ADD_ITEM`: adds new item with `addedAt: Date.now()` (no duplicates)
  - `REMOVE_ITEM`
  - `OPEN_WISHLIST` / `CLOSE_WISHLIST` / `TOGGLE_WISHLIST`
  - `LOAD_FROM_STORAGE` (defined but not used by the current provider)

### Persistence helpers
- File: [WishlistContext](file:///workspace/context/WishlistContext.tsx#L27-L42)
- `getStoredWishlist()` and `saveToStorage()` encapsulate `localStorage` access with try/catch.

## Markdown Rendering

### MarkdownContent
- File: [MarkdownContent](file:///workspace/components/MarkdownContent.tsx#L12-L49)
- Behavior:
  - Converts markdown to sanitized HTML asynchronously in a `useEffect`
  - Sets HTML via `dangerouslySetInnerHTML`

## SEO

### Meta
- File: [Meta](file:///workspace/components/Meta.tsx#L23-L64)
- Responsibilities:
  - Computes canonical URL based on current location
  - Sets Open Graph + Twitter tags and optional `noindex`

## Custom Mixtures

### getRecommendation
- File: [SmartMixtureAssistant](file:///workspace/components/SmartMixtureAssistant.tsx#L52-L106)
- Behavior: rules-based recommendation engine driven by:
  - allergy response (dominant override)
  - goal (fertility/energy/immunity/general)
  - age (special-case for child immunity)

## Sitemap Generation

### generateSitemap
- File: [generate-sitemap.ts](file:///workspace/scripts/generate-sitemap.ts#L36-L70)
- Behavior:
  - Creates entries for static routes
  - Adds `/articles/<id>` from [articles](file:///workspace/data/articles.ts)
  - Adds `/product/<id>` from [groups](file:///workspace/data/products.tsx)

