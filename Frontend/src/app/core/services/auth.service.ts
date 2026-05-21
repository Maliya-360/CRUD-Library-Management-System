import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BookRecord,
  LoginResponse,
  MemberRecord,
  RegisterRequest,
  ReservationRecord,
  TransactionRecord
} from '../models/library.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  login(email: string, password: string): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
    );
  }

  register(data: RegisterRequest): Promise<unknown> {
    return firstValueFrom(this.http.post(`${this.apiUrl}/auth/register`, data));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): LoginResponse | null {
    const user = localStorage.getItem('user');
    return user ? (JSON.parse(user) as LoginResponse) : null;
  }

  setUser(user: LoginResponse, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  setCurrentUser(user: LoginResponse): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  updateProfile(memberId: number, data: Record<string, unknown>): Promise<MemberRecord> {
    return firstValueFrom(this.http.put<MemberRecord>(`${this.apiUrl}/members/${memberId}`, data));
  }

  updateMember(memberId: number, data: Record<string, unknown>): Promise<MemberRecord> {
    return firstValueFrom(this.http.put<MemberRecord>(`${this.apiUrl}/members/${memberId}`, data));
  }

  deleteMember(memberId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/members/${memberId}`));
  }

  changePassword(memberId: number, currentPassword: string, newPassword: string): Promise<unknown> {
    return firstValueFrom(
      this.http.post(`${this.apiUrl}/members/${memberId}/change-password`, {
        currentPassword,
        newPassword
      })
    );
  }

  getAllMembers(): Promise<MemberRecord[]> {
    return firstValueFrom(this.http.get<MemberRecord[]>(`${this.apiUrl}/members`));
  }

  registerMember(data: RegisterRequest): Promise<MemberRecord> {
    return firstValueFrom(this.http.post<MemberRecord>(`${this.apiUrl}/auth/register`, data));
  }

  getAllBooks(): Promise<BookRecord[]> {
    return firstValueFrom(this.http.get<BookRecord[]>(`${this.apiUrl}/books`));
  }

  createBook(data: {
    title: string;
    author: string;
    isbn: string;
    publicationDate: string;
    totalQuantity: number;
    category: string;
  }): Promise<BookRecord> {
    return firstValueFrom(this.http.post<BookRecord>(`${this.apiUrl}/books`, data));
  }

  updateBook(bookId: number, data: Record<string, unknown>): Promise<BookRecord> {
    return firstValueFrom(this.http.put<BookRecord>(`${this.apiUrl}/books/${bookId}`, data));
  }

  deleteBook(bookId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/books/${bookId}`));
  }

  getAllTransactions(): Promise<TransactionRecord[]> {
    return firstValueFrom(this.http.get<TransactionRecord[]>(`${this.apiUrl}/transactions`));
  }

  issueTransaction(data: { bookId: number; memberId: number; daysToReturn: number }): Promise<TransactionRecord> {
    return firstValueFrom(this.http.post<TransactionRecord>(`${this.apiUrl}/transactions/issue`, data));
  }

  returnTransaction(data: { transactionId: number; isDamaged: boolean }): Promise<TransactionRecord> {
    return firstValueFrom(this.http.put<TransactionRecord>(`${this.apiUrl}/transactions/return`, data));
  }

  getAllReservations(): Promise<ReservationRecord[]> {
    return firstValueFrom(this.http.get<ReservationRecord[]>(`${this.apiUrl}/reservations`));
  }

  createReservation(data: { bookId: number; memberId: number }): Promise<ReservationRecord> {
    return firstValueFrom(this.http.post<ReservationRecord>(`${this.apiUrl}/reservations`, data));
  }

  cancelReservation(data: { reservationId: number }): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.apiUrl}/reservations/cancel`, data));
  }
}
