// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseUrl = 'http://localhost:3000/api'; // backend API URL
  private username = 'User'; // Replace with actual logic to get the username

  constructor(private http: HttpClient) {}

  // Login function sending the username and password to backend API
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { username, password });
  }

  // Logout function to clear token from localStorage
  logout() {
    localStorage.removeItem('token');
  }

  // Check if user is authenticated by checking the existence of the token
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUsername(): string {
    return this.username; // Replace with actual username
  }
}