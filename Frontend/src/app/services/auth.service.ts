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

export interface MemberRecord {
  memberId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipNumber: string;
  membershipDate: string;
  memberType: string;
  isActive: boolean;
}

export interface RegisterMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface BookRecord {
  bookId: number;
  title: string;
  author: string;
  isbn: string;
  publicationDate: string;
  availableQuantity: number;
  totalQuantity: number;
  category: string;
  isAvailable: boolean;
}

export interface TransactionRecord {
  transactionId: number;
  bookId: number;
  memberId: number;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  fine: number;
  isDamaged: boolean;
  status: string;
}

export interface IssueTransactionRequest {
  bookId: number;
  memberId: number;
  daysToReturn: number;
}

export interface ReturnTransactionRequest {
  transactionId: number;
  isDamaged: boolean;
}

export interface ReservationRecord {
  reservationId: number;
  bookId: number;
  memberId: number;
  bookTitle: string;
  memberName: string;
  reservationDate: string;
  reservationExpiryDate: string | null;
  status: string;
}

export interface CreateReservationRequest {
  bookId: number;
  memberId: number;
}

export interface CancelReservationRequest {
  reservationId: number;
}

export interface AdminDashboardData {
  users: Array<{
    memberId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    membershipNumber: string;
    membershipDate: string;
    memberType: string;
    isActive: boolean;
  }>;
  books: Array<{
    bookId: number;
    title: string;
    author: string;
    isbn: string;
    publicationDate: string;
    availableQuantity: number;
    totalQuantity: number;
    category: string;
    isAvailable: boolean;
  }>;
  transactions: Array<{
    transactionId: number;
    bookId: number;
    memberId: number;
    bookTitle: string;
    memberName: string;
    issueDate: string;
    dueDate: string;
    returnDate: string | null;
    fine: number;
    status: string;
  }>;
  reservations: Array<{
    reservationId: number;
    bookId: number;
    memberId: number;
    bookTitle: string;
    memberName: string;
    reservationDate: string;
    reservationExpiryDate: string | null;
    status: string;
  }>;
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

  async updateMember(memberId: number, data: any): Promise<any> {
    try {
      const response = await this.api.put(`/members/${memberId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update member');
    }
  }

  async deleteMember(memberId: number): Promise<void> {
    try {
      await this.api.delete(`/members/${memberId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete member');
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

  async getAdminDashboardData(): Promise<AdminDashboardData> {
    try {
      const response = await this.api.get<AdminDashboardData>('/admin/dashboard');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load admin dashboard data');
    }
  }

  async getAllMembers(): Promise<MemberRecord[]> {
    try {
      const response = await this.api.get<MemberRecord[]>('/members');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load members');
    }
  }

  async registerMember(data: RegisterMemberRequest): Promise<MemberRecord> {
    try {
      // Use the same endpoint as public registration so behavior (validation, hashing)
      // is consistent with the login portal (`/auth/register`).
      const response = await this.api.post<MemberRecord>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to register member');
    }
  }

  async getAllBooks(): Promise<BookRecord[]> {
    try {
      const response = await this.api.get<BookRecord[]>('/books');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load books');
    }
  }

  async createBook(data: { title: string; author: string; isbn: string; publicationDate: string; totalQuantity: number; category: string; }): Promise<BookRecord> {
    try {
      const payload = {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        publicationDate: data.publicationDate,
        totalQuantity: data.totalQuantity,
        category: data.category
      };
      const response = await this.api.post<BookRecord>('/books', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create book');
    }
  }

  async updateBook(bookId: number, data: any): Promise<BookRecord> {
    try {
      const response = await this.api.put<BookRecord>(`/books/${bookId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update book');
    }
  }

  async deleteBook(bookId: number): Promise<void> {
    try {
      await this.api.delete(`/books/${bookId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete book');
    }
  }

  async getAllTransactions(): Promise<TransactionRecord[]> {
    try {
      const response = await this.api.get<TransactionRecord[]>('/transactions');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load transactions');
    }
  }

  async issueTransaction(data: IssueTransactionRequest): Promise<TransactionRecord> {
    try {
      const response = await this.api.post<TransactionRecord>('/transactions/issue', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create transaction');
    }
  }

  async returnTransaction(data: ReturnTransactionRequest): Promise<TransactionRecord> {
    try {
      const response = await this.api.put<TransactionRecord>('/transactions/return', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to return book');
    }
  }

  async getAllReservations(): Promise<ReservationRecord[]> {
    try {
      const response = await this.api.get<ReservationRecord[]>('/reservations');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load reservations');
    }
  }

  async createReservation(data: CreateReservationRequest): Promise<ReservationRecord> {
    try {
      const response = await this.api.post<ReservationRecord>('/reservations', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create reservation');
    }
  }

  async cancelReservation(data: CancelReservationRequest): Promise<void> {
    try {
      await this.api.put('/reservations/cancel', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  }
}