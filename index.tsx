
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Strategy: The splash loader (position:fixed, z-index:9999) covers everything.
// We wait for window.load (CSS <link> tags, fonts, images), then add a 200ms buffer
// for Vite's CSS module injection, then double rAF for paint, then reveal.
const reveal = () => {
  setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rootElement.classList.add('ready');
        const splash = document.getElementById('splash-loader');
        if (splash) {
          splash.style.transition = 'opacity 0.3s ease';
          splash.style.opacity = '0';
          setTimeout(() => { splash.remove(); }, 350);
        }
      });
    });
  }, 200);
};

if (document.readyState === 'complete') {
  reveal();
} else {
  window.addEventListener('load', reveal);
}

const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
