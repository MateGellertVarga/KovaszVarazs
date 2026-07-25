import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse, UserModel } from 'src/models/userModel';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { map, Observable, of, firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { PushNotificationService } from './push-notification.service';

type LoginResponseA = { user: UserModel; token: string };
type LoginResponseB = UserModel & { token: string };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private pushNotificationService: PushNotificationService
  ) {
    this.loadUserData();
  }

  public loggedInUser: UserModel | null = null;
  private tokenCache: string | null = null;

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponseA | LoginResponseB>(
        `${this.configService.apiUrl}/auth/login`,
        { email, password }
      )
      .pipe(
        map((res) => {
          const token = (res as any).token;
          if (!token) throw new Error('Missing token');

          const user: UserModel = (res as any).user ?? {
            id: (res as any).id,
            name: (res as any).name,
            email: (res as any).email,
            phone_number: (res as any).phone_number,
            role: (res as any).role,
          };

          this.loggedInUser = user;
          this.storeUserData(user);
          this.setToken(token);
          this.pushNotificationService.initPush();

          return true;
        })
      );
  }

  logout() {
    this.removeToken().then(() => {
      this.loggedInUser = null;
      this.http
        .post(`${this.configService.apiUrl}/auth/logout`, {})
        .subscribe();
    });
  }

  async loadUserData(): Promise<void> {
    const saved = await this.getStoredUser();
    if (saved) this.loggedInUser = saved;
    const token = await this.getToken();
    if (!token) this.loggedInUser = null;
  }

  async setToken(token: string) {
    this.tokenCache = token;
    if (Capacitor.isNativePlatform()) {
      await SecureStorage.setItem('auth_token', token);
    } else {
      localStorage.setItem('auth_token', token);
    }
  }

  async getToken(): Promise<string | null> {
    if (this.tokenCache) return this.tokenCache;
    if (Capacitor.isNativePlatform()) {
      try {
        const t = await SecureStorage.getItem('auth_token');
        this.tokenCache = t || null;
        return this.tokenCache;
      } catch {
        return null;
      }
    } else {
      const t = localStorage.getItem('auth_token');
      this.tokenCache = t || null;
      return this.tokenCache;
    }
  }

  async removeToken() {
    this.tokenCache = null;
    if (Capacitor.isNativePlatform()) {
      await SecureStorage.removeItem('auth_token');
    } else {
      localStorage.removeItem('auth_token');
    }
    await this.removeStoredUser();
  }

  async storeUserData(user: UserModel) {
    if (Capacitor.isNativePlatform()) {
      await SecureStorage.setItem('loggedInUser', JSON.stringify(user));
    } else {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
    }
  }

  async getStoredUser(): Promise<UserModel | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await SecureStorage.getItem('loggedInUser');
        return result ? JSON.parse(result) : null;
      } catch {
        return null;
      }
    } else {
      const stored = localStorage.getItem('loggedInUser');
      return stored ? JSON.parse(stored) : null;
    }
  }

  saveFcmToken(token: string): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/auth/fcm-token`, {
      fcm_token: token,
    });
  }

  async removeStoredUser() {
    if (Capacitor.isNativePlatform()) {
      await SecureStorage.removeItem('loggedInUser');
    } else {
      localStorage.removeItem('loggedInUser');
    }
  }
}
