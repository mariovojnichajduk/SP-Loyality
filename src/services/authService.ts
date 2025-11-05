import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    email: string;
    name: string;
    points: number;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  }

  async register(data: RegisterData): Promise<void> {
    await api.post('/auth/register', data);
  }

  async verifyEmail(data: VerifyEmailData): Promise<void> {
    await api.post('/auth/verify-email', data);
  }

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await api.post('/auth/reset-password', data);
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
