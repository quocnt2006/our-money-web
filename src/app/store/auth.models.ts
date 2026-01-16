export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const AUTH_FEATURE_KEY = 'auth';
