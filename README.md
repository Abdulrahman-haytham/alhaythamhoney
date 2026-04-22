# 🍯 الهيثم لنحل وعسل | Al-Haytham Honey

> Premium Syrian Natural Honey — Since 1997

A luxury e-commerce landing page for **Al-Haytham Bee & Honey**, a family-owned beekeeping business based in Qamhana, Hama, Syria. Built with React, TypeScript, and Tailwind CSS.

**🌐 Live Site:** [alhaythamhoney.sy](https://alhaythamhoney.sy)

---

## ✨ Features

- **Luxury Dark UI** — Black and gold aesthetic with smooth Framer Motion animations
- **Full RTL Arabic** — Complete right-to-left layout with Cairo & Amiri fonts
- **SEO Optimized** — Schema.org markup (Organization, LocalBusiness, Product), Open Graph, sitemap.xml
- **PWA Ready** — Service worker for offline/mobile experience
- **WhatsApp Commerce** — Direct ordering via WhatsApp (+963947931959)
- **Content Marketing** — 9 SEO articles on honey health benefits (Markdown-rendered)
- **Code Splitting** — Lazy-loaded pages for optimal performance
- **Error Boundaries** — Graceful error handling with Arabic fallback UI
- **Cart State Management** — React Context-based shopping cart
- **Responsive Design** — Mobile-first, works on all screen sizes

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd الهيثم-لنحل-وعسل

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
# Start dev server (http://localhost:3003)
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:run

# Check code coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## 📁 Project Structure

```
├── App.tsx                 # Main app with routing & providers
├── index.tsx               # Entry point
├── index.html              # HTML shell with meta tags & SEO
├── index.css               # Tailwind CSS + custom styles
├── vite.config.ts          # Vite configuration (PWA, chunks)
├── tailwind.config.js      # Tailwind theme & plugins
├── postcss.config.js       # PostCSS configuration
├── vitest.config.ts        # Vitest test configuration
├── .env.example            # Environment variables template
│
├── components/             # Reusable UI components
│   ├── Header.tsx          # Navigation header
│   ├── Footer.tsx          # Site footer
│   ├── Hero.tsx            # Landing hero section
│   ├── Products.tsx        # Product grid
│   ├── ErrorBoundary.tsx   # Error fallback UI
│   ├── SkeletonLoading.tsx # Loading skeleton components
│   ├── MarkdownContent.tsx # Markdown → HTML renderer
│   ├── Analytics.tsx       # Google Analytics loader
│   └── ...
│
├── pages/                  # Route pages
│   ├── ShopPage.tsx        # Store/shop page
│   ├── ProductDetailsPage.tsx
│   ├── ArticlesPage.tsx    # Blog listing
│   ├── ArticleDetailPage.tsx
│   ├── AboutPage.tsx
│   ├── QualityPage.tsx
│   ├── FAQPage.tsx
│   ├── CustomMixturesPage.tsx
│   └── ReturnPolicyPage.tsx
│
├── data/                   # Static data
│   ├── products.tsx        # Product catalog
│   └── articles.ts         # Blog articles (Markdown imports)
│
├── content/articles/       # Markdown article files
├── config/                 # Site configuration
│   └── site.ts             # Phone, WhatsApp config
│
├── context/                # React Context providers
│   └── CartContext.tsx     # Shopping cart state
│
├── scripts/                # Build scripts
│   └── generate-sitemap.ts # Dynamic sitemap generator
│
├── tests/                  # Test files
│   └── setup.ts            # Testing library setup
│
└── public/                 # Static assets
    ├── favicon.ico
    ├── robots.txt
    ├── sitemap.xml
    └── site.webmanifest
```

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Routing** | React Router DOM v7 |
| **Build** | Vite 6 |
| **Styling** | Tailwind CSS 3 (PostCSS) |
| **Animation** | Framer Motion v11 |
| **Icons** | Lucide React |
| **SEO** | react-helmet-async |
| **Markdown** | remark + rehype |
| **PWA** | vite-plugin-pwa |
| **Testing** | Vitest + Testing Library |
| **Linting** | ESLint 9 + Prettier |
| **Hosting** | GitHub Pages |
| **Images** | Cloudinary CDN |

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Google Analytics Measurement ID
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Gemini API Key (for AI features)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Adding Google Analytics

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Copy your measurement ID (starts with `G-`)
3. Add it to your `.env` file as `GA_MEASUREMENT_ID`
4. Add the `<Analytics />` component to `App.tsx`

### Adding Products

Edit `data/products.tsx`:

```typescript
{
  id: "new-product",
  name: "عسل جديد",
  benefit: "فائدة مميزة",
  desc: "وصف المنتج...",
  image: "https://...",
  badge: "جديد",
  detailedInfo: {
    benefits: ["فائدة 1", "فائدة 2"],
    howToUse: "طريقة الاستخدام..."
  }
}
```

### Adding Articles

1. Create a `.md` file in `content/articles/`
2. Add entry to `data/articles.ts`

---

## 📊 Performance

- **Manual Chunking:** React vendor & UI vendor split for optimal caching
- **Lazy Loading:** All route pages are code-split
- **Image Optimization:** Cloudinary auto-format & quality
- **PWA Caching:** Service worker for repeat visits

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run once (CI mode)
npm run test:run

# Generate coverage report
npm run test:coverage
```

---

## 📝 License

Private — All rights reserved by Al-Haytham Bee & Honey.

---

## 📞 Contact

- **Phone:** +963 947 931 959
- **Location:** Qamhana, Hama, Syria
- **Facebook:** [Al-Haytham Honey](https://www.facebook.com/profile.php?id=100064934053886)
