import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // With HttpOnly cookies, the browser will send credentials automatically when configured.
    // We don't attach Authorization headers from client-side storage. If the server requires cookies,
    // it should be configured to read them. On 401 we attempt a refresh request using credentials
    // (so the HttpOnly refresh cookie is sent) and then retry the original request.
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // attempt refresh using fetch to include cookies explicitly
          return from(
            fetch(`${environment.apiUrl}/api/Auth/refresh`, {
              method: 'POST',
              credentials: 'include'
            })
          ).pipe(
            switchMap((r: Response) => {
              if (!r.ok) return throwError(() => err);
              // if refresh succeeded, retry original request (browser will send new cookies)
              return next.handle(req);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
