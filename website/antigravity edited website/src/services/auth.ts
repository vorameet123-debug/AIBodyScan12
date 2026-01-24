import api from './api';

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
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
  token_type: string;
  created_at?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  created_at: string;
}

class AuthServiceClass {
  private tokenKey = 'auth_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    delete api.defaults.headers.common['Authorization'];
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/api/v1/auth/me');
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Initialize token in axios headers if it exists
  init(): void {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

export const AuthService = new AuthServiceClass();

// Initialize on load
AuthService.init();
