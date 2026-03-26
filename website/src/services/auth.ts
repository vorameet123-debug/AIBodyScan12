import api from './api';
import { tokenStorage } from '../utils/tokenStorage';

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone_number?: string;  // For WhatsApp notifications
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  full_name?: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  created_at?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  phone_number?: string;
  created_at: string;
}

class AuthServiceClass {
  getToken(): string | null {
    return tokenStorage.getToken();
  }

  setToken(token: string, refreshToken?: string): void {
    tokenStorage.setToken(token);
    if (refreshToken) {
      tokenStorage.setRefreshToken(refreshToken);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken(): void {
    tokenStorage.clearAll();
    delete api.defaults.headers.common['Authorization'];
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    this.setToken(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    this.setToken(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async googleAuth(credential: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/google', { credential });
    this.setToken(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async updateProfile(data: { full_name?: string; phone_number?: string }): Promise<any> {
    const response = await api.put('/api/v1/auth/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await api.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  async forgotPassword(email: string): Promise<any> {
    const response = await api.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    const response = await api.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  }

  async verifyEmail(token: string): Promise<any> {
    const response = await api.post('/api/v1/auth/verify-email', { token });
    return response.data;
  }

  async resendVerification(): Promise<any> {
    const response = await api.post('/api/v1/auth/resend-verification');
    return response.data;
  }

  async deleteAccount(): Promise<any> {
    const response = await api.delete('/api/v1/auth/account');
    return response.data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/api/v1/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await api.post<{ access_token: string }>('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      });
      this.setToken(response.data.access_token);
      return true;
    } catch {
      this.clearToken();
      return false;
    }
  }

  logout(): void {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return tokenStorage.hasValidToken() && !tokenStorage.isTokenExpired();
  }

  isTokenExpiringSoon(thresholdSeconds: number = 300): boolean {
    const timeLeft = tokenStorage.getTimeUntilExpiry();
    return timeLeft > 0 && timeLeft < thresholdSeconds;
  }

  // Initialize token in axios headers if it exists
  init(): void {
    const token = this.getToken();
    if (token && !tokenStorage.isTokenExpired()) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else if (token) {
      // Token exists but expired, try refresh
      this.refreshToken();
    }
  }
}

export const AuthService = new AuthServiceClass();

// Initialize on load
AuthService.init();

