import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserModel } from 'src/models/userModel';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }
  apiUrl:string = 'http://localhost:8000/api';

  headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  register(user:UserModel) {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  refreshToken() {
    return this.http.post(`${this.apiUrl}/refresh`, {});
  }
}
