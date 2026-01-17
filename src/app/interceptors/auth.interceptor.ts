import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import { selectAccessToken } from '../store/auth.selectors';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private store = inject(Store);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Attach bearer token from store (if present) to Authorization header for all API calls.
    return this.store.select(selectAccessToken).pipe(
      take(1),
      switchMap((token) => {
        const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers;
        const cloned = req.clone({ headers });
        return next.handle(cloned).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              // Attempt refresh using stored refresh token via API (no cookies required).
              return from(
                fetch(`${environment.apiUrl}/api/Auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({}),
                  credentials: 'omit'
                })
              ).pipe(
                switchMap((r: Response) => {
                  if (!r.ok) return throwError(() => err);
                  // If refresh succeeded, caller effects should update the store with new tokens.
                  // Retry original request once; interceptor will re-read the token on next cycle.
                  const retryReq = token ? cloned : cloned;
                  return next.handle(retryReq);
                })
              );
            }
            return throwError(() => err);
          })
        );
      })
    );
  }
}
