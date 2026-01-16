import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState } from './auth.models';

export const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.signup, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state) => ({ ...state, isAuthenticated: true, loading: false, error: null })),
  on(AuthActions.signupSuccess, (state) => ({ ...state, isAuthenticated: true, loading: false, error: null })),
  on(AuthActions.loginFailure, AuthActions.signupFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.refreshToken, (state) => ({ ...state, loading: true })),
  on(AuthActions.refreshTokenSuccess, (state) => ({ ...state, isAuthenticated: true, loading: false, error: null })),
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.logout, (state) => ({ isAuthenticated: false, loading: false, error: null }))
);
