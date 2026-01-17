import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../store/auth.selectors';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private store = inject(Store);
  private router = inject(Router);

  canActivate() {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map((isAuth) => {
        if (isAuth) return true;
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
