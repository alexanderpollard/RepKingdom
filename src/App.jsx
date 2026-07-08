import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, StateCacheProvider } from '@/state';
import CoreTabsLayout from '@/layouts';
import { AuthViews } from '@/pages';
import { Toaster } from '@/components';

// ============================================================================
// 1. ROUTING CHECKPOINT MIDDLEWARE (AuthenticatedApp)
// ============================================================================

const AuthenticatedApp = () => {
  const { 
    isAuthenticated, 
    isLoadingAuth, 
    isLoadingPublicSettings, 
    authError, 
    navigateToLogin 
  } = useAuth();

  // Suspend view assembly while asynchronous system handshakes resolve
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-stone-950">
        <div className="w-8 h-8 border-4 border-stone-800 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Intercept and branch structural authentication failures immediately
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-950 p-6 font-mono text-xs">
          <div className="max-w-xs w-full p-5 bg-stone-900 border border-stone-800 rounded-2xl text-center shadow-xl space-y-3">
            <div className="text-red-500 text-xl font-black">🚫 ACCESS DENIED</div>
            <p className="text-stone-400 leading-normal">
              Your session is valid, but this node signature has not been whitelisted by the game administrator.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-stone-950 border border-stone-850 text-stone-200 rounded-xl font-bold uppercase active:scale-95"
            >
              Retry Pipeline Check
            </button>
          </div>
        </div>
      );
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Orchestrate client-side application page routing matrices
  return (
    <Routes>
      {/* Direct anonymous guest parameters to onboarding gates */}
      <Route path="/auth" element={<AuthViews />} />

      {/* Synchronize protected routes securely underneath the active Core Layout */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <CoreTabsLayout /> : <Navigate to="/auth" replace />
        } 
      />

      {/* Wildcard Fallback Interception: Redirect stray nodes home safely */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ============================================================================
// 2. THE APPLICATION ROOT CONTAINER GATE (App)
// ============================================================================

export default function App() {
  return (
    <AuthProvider>
      <StateCacheProvider>
        <Router>
          {/* Main system layout stream pipeline entry */}
          <AuthenticatedApp />
        </Router>
        
        {/* Global visual alert rendering engine port */}
        <Toaster />
      </StateCacheProvider>
    </AuthProvider>
  );
}
