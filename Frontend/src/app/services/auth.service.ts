import axios, { AxiosInstance } from 'axios';
import { ToastService } from './toast.service';

export interface LoginResponse {
  memberId: number;
  firstName: string;
  lastName: string;
  email: string;
  memberType: string;
  token: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export class AuthService {
  private apiUrl = 'http://localhost:5289/api';
  private api: AxiosInstance;
  private toastService: ToastService;

  constructor(toastService: ToastService) {
    this.toastService = toastService;
    this.api = axios.create({
      baseURL: this.apiUrl
    });

    this.api.interceptors.request.use(config => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>('/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(data: RegisterRequest): Promise<any> {
    try {
      const response = await this.api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.toastService.info('Logged out successfully');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): LoginResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setUser(user: LoginResponse, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  setCurrentUser(user: LoginResponse): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  async updateProfile(memberId: number, data: any): Promise<any> {
    try {
      const response = await this.api.put(`/members/${memberId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  async changePassword(memberId: number, currentPassword: string, newPassword: string): Promise<any> {
    try {
      const response = await this.api.post(`/members/${memberId}/change-password`, {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }
}