import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AUTH_FEATURE_KEY, AuthState } from './auth.models';

export const selectAuthState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

export const selectIsAuthenticated = createSelector(selectAuthState, (s) => s.isAuthenticated);
export const selectAuthLoading = createSelector(selectAuthState, (s) => s.loading);
export const selectAuthError = createSelector(selectAuthState, (s) => s.error);
export const selectAccessToken = createSelector(selectAuthState, (s) => s.accessToken);
export const selectRefreshToken = createSelector(selectAuthState, (s) => s.refreshToken);
