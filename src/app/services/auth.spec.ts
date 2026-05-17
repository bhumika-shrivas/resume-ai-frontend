import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8081/auth';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  updateProfile(data: any) {
    return this.http.put(`${this.baseUrl}/profile`, data);
  }

  changePassword(data: any) {
    return this.http.put(`${this.baseUrl}/password`, data);
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  refresh() {
    return this.http.post(`${this.baseUrl}/refresh`, {});
  }
}