// services/api/auth.service.ts
import { apiClient } from '@/lib/api/client';

export interface LoginCredentials {
  username: string;
  password: string;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
    };
  };
  message?: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export class AuthService {
  private static readonly access_token = 'access_token';
  private static readonly REFRESH_access_token = 'refreshToken';
  private static readonly USER_KEY = 'user';

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/tenant/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        this.setTokens(response.data.data.token, response.data.data.refreshToken);
        this.setUser(response.data.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  static async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>('/tenant/logout');
      this.clearAuth();
      return response.data;
    } catch (error: any) {
      // Clear local auth even if logout fails on server
      this.clearAuth();
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  static setTokens(token: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.access_token, token);
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_access_token, refreshToken);
      }
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.access_token);
    }
    return null;
  }

  static setUser(user: LoginResponse['data']['user']): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): LoginResponse['data']['user'] | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  static clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.access_token);
      localStorage.removeItem(this.REFRESH_access_token);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
