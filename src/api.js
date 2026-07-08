import { createClient } from "@/base44-mock";
import { createAxiosClient } from "@/base44-mock";

// ============================================================================
// 1. ISOMORPHIC RUNTIME ENVIRONMENT DETECTORS
// ============================================================================

const isNodeEnvironment = typeof window === 'undefined';
const stableWindowFallback = isNodeEnvironment ? { localStorage: new Map(), location: { search: "", href: "" } } : window;
const clientDeviceStorage = stableWindowFallback.localStorage;

// ============================================================================
// 2. SECURE URL HANDSHAKE PARSER & EXTRACTOR
// ============================================================================

const convertToSnakeCaseKey = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const getDynamicApplicationParameter = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isNodeEnvironment) return defaultValue;

  const customizedStorageKey = `base44_${convertToSnakeCaseKey(paramName)}`;
  const extractedUrlParameters = new URLSearchParams(window.location.search);
  const matchedSearchParameter = extractedUrlParameters.get(paramName);

  // Instantly scrub sensitive tokens to prevent profile leakage footprints
  if (removeFromUrl) {
    extractedUrlParameters.delete(paramName);
    const cleanedRouteString = `${window.location.pathname}${
      extractedUrlParameters.toString() ? `?${extractedUrlParameters.toString()}` : ""
    }${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanedRouteString);
  }

  if (matchedSearchParameter) {
    clientDeviceStorage.setItem(customizedStorageKey, matchedSearchParameter);
    return matchedSearchParameter;
  }
  
  if (defaultValue) {
    clientDeviceStorage.setItem(customizedStorageKey, defaultValue);
    return defaultValue;
  }

  return clientDeviceStorage.getItem(customizedStorageKey) || null;
};

const extractConfiguredParametersMatrix = () => {
  if (getDynamicApplicationParameter("clear_access_token") === 'true') {
    clientDeviceStorage.removeItem('base44_access_token');
    clientDeviceStorage.removeItem('token');
  }

  return {
    appId: getDynamicApplicationParameter("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
    token: getDynamicApplicationParameter("access_token", { removeFromUrl: true }),
    fromUrl: getDynamicApplicationParameter("from_url", { defaultValue: stableWindowFallback.location.href }),
    functionsVersion: getDynamicApplicationParameter("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || "v1" }),
    appBaseUrl: getDynamicApplicationParameter("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL || "https://base44.com" }),
  };
};

export const appParams = { ...extractConfiguredParametersMatrix() };

// ============================================================================
// 3. BASE44 CLIENT SDK ENGINE INITIALIZATION
// ============================================================================

export const base44 = createClient({
  appId: appParams.appId,
  token: appParams.token,
  functionsVersion: appParams.functionsVersion,
  appBaseUrl: appParams.appBaseUrl,
  requiresAuth: true
});

// ============================================================================
// 4. CONFLICT-FREE CONDITIONAL STYLE MIXER
// ============================================================================

export function cn(...inputs) {
  // Ultra-clean string filter matches combined tokens seamlessly
  return inputs.flat().filter(Boolean).join(" ").trim();
}
