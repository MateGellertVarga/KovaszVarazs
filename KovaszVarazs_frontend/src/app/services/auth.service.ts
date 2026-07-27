import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { UserModel } from '../../models/userModel';
import { Observable, firstValueFrom, of } from 'rxjs';
import { switchMap, tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) {
    this.loadUserData();
  }

  public loggedInUser: UserModel | null = null;

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<UserModel>(`${this.configService.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          this.loggedInUser = {
            id: res.id,
            name: res.name,
            email: res.email,
            phone_number: res.phone_number ?? '',
            role: (res as any).role ?? '',
            is_active: (res as any).is_active ?? true,
          } as UserModel;
        }),
        map(() => true),
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

  updateUserData(user: UserModel) {
    return this.http
      .put<UserModel>(`${this.configService.apiUrl}/auth/me`, user)
      .pipe(
        tap((res) => {
          this.loggedInUser = {
            id: res.id,
            name: res.name,
            email: res.email,
            phone_number: res.phone_number ?? '',
            role: (res as any).role ?? '',
            is_active: (res as any).is_active ?? true,
          } as UserModel;
        }),
      );
  }

  loadUserData(): Observable<UserModel | null> {
    return this.http
      .get<UserModel>(`${this.configService.apiUrl}/auth/me`)
      .pipe(
        tap((user) => {
          this.loggedInUser = user ?? null;
        }),
        catchError(() => {
          this.loggedInUser = null;
          return of(null);
        }),
      );
  }
}
