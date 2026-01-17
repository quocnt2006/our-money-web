import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private router = inject(Router);

  private getErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    const maybe = (err as { message?: unknown }).message;
    if (typeof maybe === 'string') return maybe;
    return fallback;
  }

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.http.post<{ token: string; refreshToken?: string }>(`${environment.apiUrl}/api/Auth/login`, { email, password }, { withCredentials: true }).pipe(
          map((res) => {
            // response shape: { refreshToken, token }
            return AuthActions.loginSuccess({ accessToken: res.token ?? '', refreshToken: res.refreshToken });
          }),
          catchError((err) => of(AuthActions.loginFailure({ error: this.getErrorMessage(err, 'Login failed') })))
        )
      )
    )
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signup),
      switchMap(({ name, email, password }) =>
        this.http.post(`${environment.apiUrl}/api/Auth/register`, { name, email, password, familyId: 0, role: 'user' }, { withCredentials: true }).pipe(
          map(() => {
            // server should set HttpOnly cookies for access/refresh
            return AuthActions.signupSuccess({ accessToken: '', refreshToken: ''});
          }),
          catchError((err) => of(AuthActions.signupFailure({ error: this.getErrorMessage(err, 'Signup failed') })))
        )
      )
    )
  );

  navigateOnAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.signupSuccess),
        tap(() => void this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  refresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        // call refresh endpoint with credentials so server can read HttpOnly refresh cookie
        this.http.post(`${environment.apiUrl}/api/Auth/refresh`, {}, { withCredentials: true }).pipe(
          map(() => AuthActions.refreshTokenSuccess({ accessToken: '', refreshToken: '' })),
          catchError((err) => of(AuthActions.refreshTokenFailure({ error: this.getErrorMessage(err, 'Refresh failed') })))
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        switchMap(() =>
          // inform server to clear cookies if endpoint exists; include credentials
          this.http.post(`${environment.apiUrl}/api/Auth/logout`, {}, { withCredentials: true }).pipe(
            tap(() => void this.router.navigate(['/'])),
            catchError(() => {
              // even if server logout fails, navigate to login
              void this.router.navigate(['/']);
              return of(null);
            })
          )
        )
      ),
    { dispatch: false }
  );

  constructor() { }
}
