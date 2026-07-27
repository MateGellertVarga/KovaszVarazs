import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.loggedInUser) {
    return of(true);
  }

  return authService.loadUserData().pipe(
    map((user) => (user ? true : router.parseUrl('/fooldal'))),
    catchError(() => of(router.parseUrl('/fooldal'))),
  );
};
