import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

const API_BASE_URL = 'http://localhost:3000';
const TOKEN_KEY = 'locafi.jwt';

interface AuthResponse {
  accessToken: string;
}

export interface JwtUserIdentity {
  id: string;
  name?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  async register(payload: { name: string; email: string; password: string }): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${API_BASE_URL}/api/auth/signup`, payload),
    );
    this.setToken(res.accessToken);
  }

  async login(payload: { email: string; password: string }): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, payload),
    );
    this.setToken(res.accessToken);
  }

  /**
   * Optional server acknowledgement (stateless JWT), then clears the token and returns to `/`.
   */
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await firstValueFrom(
          this.http.post<{ ok: boolean }>(`${API_BASE_URL}/api/auth/logout`, {}),
        );
      } catch {
        // Still clear the client session if the network call fails.
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    await this.router.navigateByUrl('/');
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): JwtUserIdentity | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const [, payloadBase64] = token.split('.');
      if (!payloadBase64) {
        return null;
      }
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as { sub?: string; name?: string; email?: string };
      if (!payload.sub) {
        return null;
      }
      return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
      };
    } catch {
      return null;
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
}
