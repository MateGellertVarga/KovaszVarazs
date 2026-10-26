import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Ha egy belépett felhasználó munkamenete lejár (401), ne maradjon üres oldalakon:
// töröljük a helyi állapotot és a bejelentkezésre irányítjuk.
// Az /auth/ és /broadcasting/ hívások hibáit a hívó kezeli.
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        authService.loggedInUser &&
        !req.url.includes('/auth/') &&
        !req.url.includes('/broadcasting/')
      ) {
        authService.clearSession();
        router.navigate(['/bejelentkezes']);
      }
      return throwError(() => error);
    }),
  );
};
