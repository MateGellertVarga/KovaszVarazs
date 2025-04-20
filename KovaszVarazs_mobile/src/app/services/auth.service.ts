import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserModel } from 'src/models/userModel';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { map, Observable } from 'rxjs';
import { ConfigService } from './config.service';

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
      .post<UserModel>(`${this.configService.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        map((result: UserModel) => {
          this.loggedInUser = result;
          this.storeUserData(result);
          return true;
        })
      );
  }

  logout() {
    this.removeUserData();
    if (this.loggedInUser) {
      this.http
        .post(`${this.configService.apiUrl}/auth/logout`, {})
        .subscribe();
      this.loggedInUser = null;
    }
  }

  // register(user: UserModel) {
  //   return this.http.post(`${this.configService.apiUrl}/auth/register`, user);
  // }

  // refresh_token() {
  //   return this.http.post(`${this.configService.apiUrl}/auth/refresh`, {});
  // }

  async loadUserData(): Promise<void> {
    this.loggedInUser = await this.getUserData();
  }

  async storeUserData(user: UserModel) {
    if (Capacitor.isNativePlatform()) {
      await SecureStorage.setItem('loggedInUser', JSON.stringify(user));
    } else {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
    }
  }

  async getUserData(): Promise<any> {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await SecureStorage.getItem('loggedInUser');
        return result ? JSON.parse(result) : null;
      } catch (error) {
        console.error('SecureStorage error:', error);
        return null;
      }
    } else {
      const stored = localStorage.getItem('loggedInUser');
      return stored ? JSON.parse(stored) : null;
    }
  }

  async removeUserData() {
    if (Capacitor.isNativePlatform()) {
      await SecureStorage.removeItem('loggedInUser');
    } else {
      localStorage.removeItem('loggedInUser');
    }
  }
}
