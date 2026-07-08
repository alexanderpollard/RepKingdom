import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

// ============================================================================
// 1. REACT DOM COMPILER MOUNTING LAYER
// ============================================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ============================================================================
// 2. PROGRESSIVE WEB APP (PWA) OFFLINE BACKGROUND WORKER REGISTRY
// ============================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log(
          'PWA Caching Layer Initialized. Scope domain locked to:', 
          registration.scope
        );
      })
      .catch((error) => {
        console.warn(
          'Background service worker synchronization suspended:', 
          error
        );
      });
  });
}
