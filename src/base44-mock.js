// ============================================================================
// MOCK BASE44 SDK - For Development Without Backend
// ============================================================================

export function createClient(config) {
  return {
    auth: {
      me: async () => ({ id: 'user-1', email: 'demo@workout-defense.local' }),
      loginViaEmailPassword: async (email, password) => ({ success: true }),
      register: async (data) => ({ success: true }),
      verifyOtp: async (data) => ({ access_token: 'mock-token' }),
      resetPasswordRequest: async (email) => ({ success: true }),
      loginWithProvider: (provider, redirect) => {
        window.location.href = redirect || '/';
      },
      setToken: (token) => {
        localStorage.setItem('auth_token', token);
      },
      logout: (redirect) => {
        localStorage.removeItem('auth_token');
        if (redirect) window.location.href = redirect;
      },
      redirectToLogin: (redirect) => {
        window.location.href = '/?auth=login';
      }
    }
  };
}

export function createAxiosClient() {
  return {};
}
