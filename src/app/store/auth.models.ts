export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export const AUTH_FEATURE_KEY = 'auth';
