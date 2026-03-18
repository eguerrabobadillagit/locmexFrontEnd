import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly EXPIRES_AT_KEY = 'auth_expires_at';

  readonly isAuthenticated = signal<boolean>(this.hasValidToken());
  readonly accessToken = signal<string | null>(this.getToken());
  readonly expiresAt = signal<string | null>(this.getExpiresAt());

  constructor() {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setExpiresAt(response.expiresAtUtc);
        this.accessToken.set(response.accessToken);
        this.expiresAt.set(response.expiresAtUtc);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    this.clearToken();
    this.clearExpiresAt();
    this.accessToken.set(null);
    this.expiresAt.set(null);
    this.isAuthenticated.set(false);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private setExpiresAt(expiresAt: string): void {
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt);
  }

  private getExpiresAt(): string | null {
    return localStorage.getItem(this.EXPIRES_AT_KEY);
  }

  private clearExpiresAt(): void {
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    const expiresAt = this.getExpiresAt();
    
    if (!token || !expiresAt) {
      return false;
    }

    const expirationDate = new Date(expiresAt);
    const now = new Date();
    
    return expirationDate > now;
  }

  private checkAuthStatus(): void {
    if (!this.hasValidToken()) {
      this.logout();
    }
  }

  isUserAuthenticated(): boolean {
    return this.hasValidToken();
  }
}
