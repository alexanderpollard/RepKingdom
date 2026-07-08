import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base44 } from '@/api';
import { appParams } from '@/api';

// ============================================================================
// 1. ASYNCHRONOUS DATA CACHING REGISTRY
// ============================================================================

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive network spam during PWA shifts
      retry: 1                     // Graceful recovery profile for gym networks
    }
  }
});

export function StateCacheProvider({ children }) {
  return (
    <QueryClientProvider client={queryClientInstance}>
      {children}
    </QueryClientProvider>
  );
}

// ============================================================================
// 2. STABLE GAME SHAPE DEFINITIONS & SCHEMA NORMALIZER
// ============================================================================

const CACHE_KEY = 'workoutDefense_save_v1';

export function defaultSave() {
  return {
    coins: 0,
    highestWave: 1,
    unlockedTowers: ['slingshot'],
    upgrades: {
      damage: 1, speed: 1, range: 1, critChance: 0, critDamage: 0,
      startingGold: 0, maxHealth: 0, dropBonus: 0, towerDiscount: 0, abilityCooldown: 0
    },
    workouts: { forwardPushups: 0, sidePushups: 0, leftHandDigs: 0, rightHandDigs: 0, situps: 0 },
    workoutHistory: [],
    statistics: { enemiesKilled: 0, towersBuilt: 0, totalWorkoutCoins: 0, totalBattleGold: 0, totalGames: 0 },
    achievements: [],
    settings: { hapticEnabled: true, screenFlash: true }
  };
}

function normalize(data) {
  if (!data || typeof data !== 'object') return defaultSave();
  const base = defaultSave();
  return {
    coins: data.coins ?? data.money ?? 0,
    highestWave: data.highestWave ?? 1,
    unlockedTowers: data.unlockedTowers ?? data.unlockedWeapons ?? base.unlockedTowers,
    upgrades: {
      damage: data.upgrades?.damage ?? base.upgrades.damage,
      speed: data.upgrades?.speed ?? data.upgrades?.firerate ?? base.upgrades.speed,
      range: data.upgrades?.range ?? base.upgrades.range,
      critChance: data.upgrades?.critChance ?? 0,
      critDamage: data.upgrades?.critDamage ?? 0,
      startingGold: data.upgrades?.startingGold ?? 0,
      maxHealth: data.upgrades?.maxHealth ?? 0,
      dropBonus: data.upgrades?.dropBonus ?? 0,
      towerDiscount: data.upgrades?.towerDiscount ?? 0,
      abilityCooldown: data.upgrades?.abilityCooldown ?? 0
    },
    workouts: { ...base.workouts, ...(data.workouts || {}) },
    workoutHistory: Array.isArray(data.workoutHistory) ? data.workoutHistory : [],
    statistics: { ...base.statistics, ...(data.statistics || {}) },
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    settings: { ...base.settings, ...(data.settings || {}) }
  };
}

// ============================================================================
// 3. INTEGRATED AUTHENTICATION & SAVE SYSTEM PROVIDER
// ============================================================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(defaultSave());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  // Core system bootstrapping lifecycle
  useEffect(() => {
    async function initializeSystemMatrix() {
      try {
        // For demo mode: skip API calls and allow direct app access
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        
        // Auto-login in demo mode
        setIsAuthenticated(true);
        setUser({ id: 'demo-user', email: 'demo@workout-defense.local' });
        
        // 3. Mount disk-cached progress arrays safely through the normalization adapter
        try {
          const rawSave = localStorage.getItem(CACHE_KEY);
          setPlayer(normalize(rawSave ? JSON.parse(rawSave) : null));
        } catch {
          setPlayer(defaultSave());
        }
      } catch (globalErr) {
        console.error('System bootstrap structural fault:', globalErr);
        // Still initialize even on error
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        setIsAuthenticated(true);
      } finally {
        setAuthChecked(true);
      }
    }

    initializeSystemMatrix();
  }, []);

  // Automated background save execution proxy
  const updatePlayerState = useCallback(async (nextStatePayload) => {
    setPlayer(nextStatePayload);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(nextStatePayload));
      
      // Future Phase 3 Endpoint Hook:
      // if (isAuthenticated) { await fetch('/api/user/save', { method: 'POST', body: JSON.stringify(nextStatePayload) }); }
    } catch (diskErr) {
      console.warn("Progress checkpoint streaming disk fault:", diskErr);
    }
  }, []);

  // Wipe profile structures back to base parameters
  const resetAllData = useCallback(async () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
    setPlayer(defaultSave());
  }, []);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      base44.auth.logout(window.location.href);
    } else {
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user, player, isAuthenticated, isLoadingAuth, isLoadingPublicSettings,
      authError, appPublicSettings, authChecked, updatePlayerState, resetAllData,
      logout, navigateToLogin, base44
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth lifecycle macro must be utilized straight inside an AuthProvider wrapper node tree.');
  }
  return context;
}
