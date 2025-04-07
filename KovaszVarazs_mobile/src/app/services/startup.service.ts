import { AuthService } from './auth.service';

export function startup(authService: AuthService) {
  return () => authService.loadUserData();
}
