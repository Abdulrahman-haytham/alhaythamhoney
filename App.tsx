
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Analytics } from './components/Analytics';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartSidebar } from './components/CartSidebar';
import { WishlistSidebar } from './components/WishlistSidebar';
import { HelmetProvider } from 'react-helmet-async';

const HomePage = React.lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const ShopPage = React.lazy(() =>
  import('./pages/ShopPage').then((m) => ({ default: m.ShopPage }))
);
const ProductDetailsPage = React.lazy(() =>
  import('./pages/ProductDetailsPage').then((m) => ({ default: m.ProductDetailsPage }))
);
const CustomMixturesPage = React.lazy(() =>
  import('./pages/CustomMixturesPage').then((m) => ({ default: m.CustomMixturesPage }))
);
const AboutPage = React.lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const QualityPage = React.lazy(() =>
  import('./pages/QualityPage').then((m) => ({ default: m.QualityPage }))
);
const FAQPage = React.lazy(() =>
  import('./pages/FAQPage').then((m) => ({ default: m.FAQPage }))
);
const ArticlesPage = React.lazy(() =>
  import('./pages/ArticlesPage').then((m) => ({ default: m.ArticlesPage }))
);
const ArticleDetailPage = React.lazy(() =>
  import('./pages/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage }))
);
const ReturnPolicyPage = React.lazy(() =>
  import('./pages/ReturnPolicyPage').then((m) => ({ default: m.ReturnPolicyPage }))
);
const CartPage = React.lazy(() =>
  import('./pages/CartPage').then((m) => ({ default: m.CartPage }))
);
const WishlistPage = React.lazy(() =>
  import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const ContactCardPage = React.lazy(() =>
  import('./pages/ContactCardPage').then((m) => ({ default: m.ContactCardPage }))
);

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen selection:bg-amber-500/30 overflow-x-hidden bg-zinc-950 text-zinc-100">
    <Header />
    <main id="main-content">{children}</main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  if (import.meta.env.DEV) {
    console.log('--- Render Start ---');
  }

  React.useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log('App mounted');
    return () => {
      console.log('App unmounted');
    };
  }, []);

  // Handle SPA redirect from 404.html
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('p');
    if (redirectPath) {
      window.history.replaceState(null, '', redirectPath);
    }
  }, []);

  return (
    <ErrorBoundary>
      <CartProvider>
        <WishlistProvider>
          <HelmetProvider>
            <Router>
              <Analytics measurementId={import.meta.env.VITE_GA_ID} />
              <CartSidebar />
              <WishlistSidebar />
              <ScrollToTop />
              <FloatingWhatsApp />
              <React.Suspense
                fallback={
                  <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
                    <div className="text-amber-500 font-bold">جاري التحميل...</div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<PageLayout><ShopPage /></PageLayout>} />
                  <Route path="/store" element={<PageLayout><ShopPage /></PageLayout>} />
                  <Route path="/product/:slug" element={<PageLayout><ProductDetailsPage /></PageLayout>} />
                  <Route path="/custom-mixtures" element={<PageLayout><CustomMixturesPage /></PageLayout>} />
                  <Route path="/about-us" element={<PageLayout><AboutPage /></PageLayout>} />
                  <Route path="/quality-standards" element={<PageLayout><QualityPage /></PageLayout>} />
                  <Route path="/faq" element={<PageLayout><FAQPage /></PageLayout>} />

                  <Route path="/articles" element={<PageLayout><ArticlesPage /></PageLayout>} />
                  <Route path="/articles/:articleId" element={<PageLayout><ArticleDetailPage /></PageLayout>} />
                  <Route path="/return-policy" element={<PageLayout><ReturnPolicyPage /></PageLayout>} />

                  {/* Cart & Wishlist */}
                  <Route path="/cart" element={<PageLayout><CartPage /></PageLayout>} />
                  <Route path="/wishlist" element={<PageLayout><WishlistPage /></PageLayout>} />

                  {/* بطاقة تواصل QR — صفحة مستقلة بدون ترويسة وتذييل الموقع */}
                  <Route path="/q/:slug" element={<ContactCardPage />} />
                </Routes>
              </React.Suspense>
            </Router>
          </HelmetProvider>
        </WishlistProvider>
      </CartProvider>
    </ErrorBoundary>
  );
};

export default App;
