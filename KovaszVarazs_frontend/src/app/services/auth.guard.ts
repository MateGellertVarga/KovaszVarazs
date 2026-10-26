import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';
import { map } from 'rxjs';

// Csak a felsorolt szerepkörök léphetnek be, mindenki mást a saját kezdőoldalára irányít
// (admin -> Rendelések, felhasználó / vendég -> Főoldal).
export const roleGuard =
  (...allowedRoles: UserRole[]): CanActivateFn =>
  () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return authService
      .resolveUser()
      .pipe(
        map(() =>
          allowedRoles.includes(authService.role)
            ? true
            : router.parseUrl(authService.homeUrl),
        ),
      );
  };

// Nyilvános vásárlói oldalak (főoldal, galéria) – az admin nem látja őket.
export const publicGuard = roleGuard('guest', 'user');
// Csak kijelentkezve (bejelentkezés, regisztráció, elfelejtett jelszó).
export const guestGuard = roleGuard('guest');
// Belépett vásárló (rendelés leadása).
export const userGuard = roleGuard('user');
// Bármely belépett felhasználó (profil).
export const authGuard = roleGuard('user', 'admin');
// Admin felület.
export const adminGuard = roleGuard('admin');
