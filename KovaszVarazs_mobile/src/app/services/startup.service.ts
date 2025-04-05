import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export function startup() {
  const authService = inject(AuthService);
  return authService.loadUserData();
}
