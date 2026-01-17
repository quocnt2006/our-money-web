import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap, tap, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAccessToken, selectRefreshToken } from './auth.selectors';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private router = inject(Router);
  private store = inject(Store);

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
        this.http.post<{ token: string; refreshToken?: string }>(`${environment.apiUrl}/api/Auth/login`, { email, password }).pipe(
          map((res) => {
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
        this.http.post<{ token?: string; refreshToken?: string }>(`${environment.apiUrl}/api/Auth/register`, { name, email, password, familyId: 0, role: 'user' }).pipe(
          map((res) => AuthActions.signupSuccess({ accessToken: res.token ?? '', refreshToken: res.refreshToken })),
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
        this.store.select(selectRefreshToken).pipe(
          take(1),
          switchMap((refreshToken: string | null | undefined) =>
            this.http.post<{ token: string; refreshToken?: string }>(`${environment.apiUrl}/api/Auth/refresh`, { refreshToken }).pipe(
              map((res) => AuthActions.refreshTokenSuccess({ accessToken: res.token ?? '', refreshToken: res.refreshToken })),
              catchError((err) => of(AuthActions.refreshTokenFailure({ error: this.getErrorMessage(err, 'Refresh failed') })))
            )
          )
        )
      )
    )
  );

  logoutRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutRequested),
      switchMap(() =>
        this.store.select(selectAccessToken).pipe(
          take(1),
          switchMap((token: string | null | undefined) => {
            const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
            return this.http
              .post(`${environment.apiUrl}/api/Auth/logout`, {}, { headers, observe: 'response' as const })
              .pipe(
                map((resp: HttpResponse<unknown>) => {
                  if (resp && resp.status === 204) return AuthActions.logout();
                  return AuthActions.logoutFailure({ error: `Logout returned status ${resp.status}` });
                }),
                tap((action) => {
                  if (action.type === AuthActions.logout.type) void this.router.navigate(['/login']);
                }),
                catchError((err) => of(AuthActions.logoutFailure({ error: this.getErrorMessage(err, 'Logout failed') })))
              );
          })
        )
      )
    )
  );

  constructor() { }
}
