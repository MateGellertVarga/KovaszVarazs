import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { UserModel } from '../../models/userModel';
import { Observable, firstValueFrom } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private configService: ConfigService) {
    this.loadUserData();
  }

  public loggedInUser: UserModel | null = null;

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post(`${this.configService.apiUrl}/auth/login`, { email, password })
      .pipe(
        switchMap(() =>
          this.http.get<UserModel>(`${this.configService.apiUrl}/auth/me`)
        ),
        tap((user) => (this.loggedInUser = user)),
        map(() => true)
      );
  }

  logout() {
    this.http.post(`${this.configService.apiUrl}/auth/logout`, {}).subscribe({
      next: () => (this.loggedInUser = null),
      error: () => (this.loggedInUser = null),
    });
  }

  register(user: UserModel) {
    return this.http.post(`${this.configService.apiUrl}/auth/register`, user);
  }

  async loadUserData(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<UserModel>(`${this.configService.apiUrl}/auth/me`)
      );
      this.loggedInUser = user;
    } catch {
      this.loggedInUser = null;
    }
  }
}
