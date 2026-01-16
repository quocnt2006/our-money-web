import { createAction, props } from '@ngrx/store';

export const login = createAction('[Auth] Login', props<{ email: string; password: string }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ accessToken: string; refreshToken?: string }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const signup = createAction('[Auth] Signup', props<{ name: string; email: string; password: string }>());
export const signupSuccess = createAction('[Auth] Signup Success', props<{ accessToken?: string; refreshToken?: string }>());
export const signupFailure = createAction('[Auth] Signup Failure', props<{ error: string }>());

export const refreshToken = createAction('[Auth] Refresh Token');
export const refreshTokenSuccess = createAction('[Auth] Refresh Token Success', props<{ accessToken: string; refreshToken?: string }>());
export const refreshTokenFailure = createAction('[Auth] Refresh Token Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');
