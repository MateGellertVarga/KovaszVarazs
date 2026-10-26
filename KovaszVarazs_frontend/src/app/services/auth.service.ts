import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { UserModel } from '../../models/userModel';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

export type UserRole = 'guest' | 'user' | 'admin';

export const ADMIN_HOME_URL = '/admin/rendelesek';
export const USER_HOME_URL = '/fooldal';

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

  // Igaz, ha a backend már megmondta, ki van belépve (vagy hogy senki).
  // Hálózati / szerverhiba esetén hamis marad, így a guard újrapróbálja.
  private userResolved = false;
  private logoutHandlers: (() => void)[] = [];

  get role(): UserRole {
    if (!this.loggedInUser) return 'guest';
    return this.loggedInUser.role === 'admin' ? 'admin' : 'user';
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  get homeUrl(): string {
    return this.isAdmin ? ADMIN_HOME_URL : USER_HOME_URL;
  }

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
          this.userResolved = true;
        }),
        map(() => true),
      );
  }

  logout(): Observable<void> {
    return this.http.post(`${this.configService.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null)),
      map(() => this.clearSession()),
    );
  }

  clearSession() {
    this.loggedInUser = null;
    this.userResolved = true;
    this.logoutHandlers.forEach((handler) => handler());
  }

  onLogout(handler: () => void) {
    this.logoutHandlers.push(handler);
  }

  register(user: UserModel) {
    return this.http.post(`${this.configService.apiUrl}/auth/register`, user);
  }

  // A PUT /auth/me válasza nem feltétlenül tartalmaz szerepkört – ilyenkor a már ismertet tartjuk meg.
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
            role: res.role ?? this.loggedInUser?.role ?? '',
            is_active: res.is_active ?? this.loggedInUser?.is_active ?? true,
          } as UserModel;
        }),
      );
  }

  sendPasswordResetEmail(email: string): Observable<boolean> {
    return this.http
      .post(`${this.configService.apiUrl}/auth/send-password-reset-email`, {
        email,
      })
      .pipe(map(() => true));
  }

  resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/auth/reset-password`, {
      email,
      token,
      newPassword,
    });
  }

  resolveUser(): Observable<UserModel | null> {
    return this.userResolved ? of(this.loggedInUser) : this.loadUserData();
  }

  loadUserData(): Observable<UserModel | null> {
    return this.http
      .get<UserModel>(`${this.configService.apiUrl}/auth/me`)
      .pipe(
        tap((user) => {
          this.loggedInUser = user ?? null;
          this.userResolved = true;
        }),
        catchError((error: HttpErrorResponse) => {
          this.loggedInUser = null;
          this.userResolved = error.status >= 400 && error.status < 500;
          return of(null);
        }),
      );
  }
}
