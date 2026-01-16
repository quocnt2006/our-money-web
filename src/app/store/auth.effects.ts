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

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.http.post<any>(`${environment.apiUrl}/api/Auth/login`, { email, password }, { withCredentials: true }).pipe(
          map(() => {
            // server should set HttpOnly cookies for access/refresh
            return AuthActions.loginSuccess({ accessToken: undefined as any, refreshToken: undefined as any });
          }),
          catchError((err) => of(AuthActions.loginFailure({ error: err?.message || 'Login failed' })))
        )
      )
    )
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signup),
      switchMap(({ name, email, password }) =>
        this.http.post<any>(`${environment.apiUrl}/api/Auth/register`, { name, email, password, familyId: 0, role: 'user' }, { withCredentials: true }).pipe(
          map(() => {
            // server should set HttpOnly cookies for access/refresh
            return AuthActions.signupSuccess({ accessToken: undefined as any, refreshToken: undefined as any });
          }),
          catchError((err) => of(AuthActions.signupFailure({ error: err?.message || 'Signup failed' })))
        )
      )
    )
  );

  navigateOnAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.signupSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  refresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        // call refresh endpoint with credentials so server can read HttpOnly refresh cookie
        this.http.post<any>(`${environment.apiUrl}/api/Auth/refresh`, {}, { withCredentials: true }).pipe(
          map(() => AuthActions.refreshTokenSuccess({ accessToken: undefined as any, refreshToken: undefined as any })),
          catchError((err) => of(AuthActions.refreshTokenFailure({ error: err?.message || 'Refresh failed' })))
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
            tap(() => this.router.navigate(['/'])),
            catchError(() => {
              // even if server logout fails, navigate to login
              this.router.navigate(['/']);
              return of(null);
            })
          )
        )
      ),
    { dispatch: false }
  );

  constructor() {}
}
