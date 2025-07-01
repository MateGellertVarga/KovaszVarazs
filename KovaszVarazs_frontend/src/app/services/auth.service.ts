import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { UserModel } from '../../models/userModel';
import { map, Observable } from 'rxjs';

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

  register(user: UserModel) {
    return this.http.post(`${this.configService.apiUrl}/auth/register`, user);
  }

  // refresh_token() {
  //   return this.http.post(`${this.configService.apiUrl}/auth/refresh`, {});
  // }

  async loadUserData(): Promise<void> {
    this.loggedInUser = await this.getUserData();
  }

  async storeUserData(user: UserModel) {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
  }

  async getUserData(): Promise<any> {
    const stored = localStorage.getItem('loggedInUser');
    return stored ? JSON.parse(stored) : null;
  }

  async removeUserData() {
    localStorage.removeItem('loggedInUser');
  }
}
