import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BookRecord,
  LoginResponse,
  MemberRecord,
  TransactionRecord
} from '../../core/models/library.models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './member-dashboard.component.html',
  styleUrl: './member-dashboard.component.css'
})
export class MemberDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  currentUser: LoginResponse | null = null;
  memberProfile: MemberRecord | null = null;
  books: BookRecord[] = [];
  transactions: TransactionRecord[] = [];

  bookSearch = '';
  bookFilter = 'all';
  profileModalOpen = false;
  loading = signal(false);

  profileForm = { firstName: '', lastName: '', email: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  async ngOnInit(): Promise<void> {
    this.currentUser = this.auth.getCurrentUser();
    if (!this.currentUser) {
      await this.router.navigate(['/login']);
      return;
    }

    try {
      const [books, transactions, members] = await Promise.all([
        this.auth.getAllBooks(),
        this.auth.getAllTransactions(),
        this.auth.getAllMembers()
      ]);

      this.books = books;
      this.transactions = transactions;
      this.memberProfile =
        members.find(m => m.memberId === this.currentUser?.memberId) ?? null;
      this.profileForm = {
        firstName: this.memberProfile?.firstName || this.currentUser.firstName || '',
        lastName: this.memberProfile?.lastName || this.currentUser.lastName || '',
        email: this.memberProfile?.email || this.currentUser.email || ''
      };
    } catch {
      this.toast.error('Failed to load dashboard data');
    }
  }

  get filteredBooks(): BookRecord[] {
    const search = this.bookSearch.trim().toLowerCase();
    return this.books.filter(book => {
      const matchesSearch =
        !search ||
        [book.title, book.author, book.isbn, book.category].join(' ').toLowerCase().includes(search);
      const matchesFilter =
        this.bookFilter === 'all' ||
        (this.bookFilter === 'available' && book.isAvailable) ||
        (this.bookFilter === 'unavailable' && !book.isAvailable);
      return matchesSearch && matchesFilter;
    });
  }

  get borrowedTransactions(): TransactionRecord[] {
    return this.myTransactions.filter(t => t.status !== 'Returned');
  }

  get overdueTransactions(): TransactionRecord[] {
    return this.borrowedTransactions.filter(t => this.isOverdue(t));
  }

  get stats() {
    return [
      { title: 'Total Books', value: this.books.length, icon: '📚', tone: 'books' },
      {
        title: 'Available Books',
        value: this.books.filter(b => b.isAvailable).length,
        icon: '✅',
        tone: 'available'
      },
      { title: 'Borrowed Books', value: this.borrowedTransactions.length, icon: '📖', tone: 'borrowed' },
      { title: 'Overdue Books', value: this.overdueTransactions.length, icon: '⏰', tone: 'overdue' }
    ];
  }

  private get myTransactions(): TransactionRecord[] {
    return this.transactions.filter(t => t.memberId === this.currentUser?.memberId);
  }

  private isOverdue(transaction: TransactionRecord): boolean {
    if (transaction.status === 'Overdue') return true;
    if (!transaction.dueDate) return false;
    return new Date(transaction.dueDate).getTime() < Date.now();
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  }

  toggleProfileModal(): void {
    this.profileModalOpen = !this.profileModalOpen;
  }

  async saveProfile(): Promise<void> {
    if (!this.currentUser) return;
    if (!this.profileForm.firstName || !this.profileForm.lastName || !this.profileForm.email) {
      this.toast.error('Please fill in all profile fields');
      return;
    }

    this.loading.set(true);
    try {
      const updated = await this.auth.updateProfile(this.currentUser.memberId, {
        FirstName: this.profileForm.firstName,
        LastName: this.profileForm.lastName,
        Email: this.profileForm.email,
        Phone: this.memberProfile?.phone || ''
      });
      this.memberProfile = updated;
      this.currentUser = {
        ...this.currentUser,
        firstName: updated.firstName ?? this.profileForm.firstName,
        lastName: updated.lastName ?? this.profileForm.lastName,
        email: updated.email ?? this.profileForm.email
      };
      this.auth.setCurrentUser(this.currentUser);
      this.toast.success('Profile updated successfully');
    } catch {
      this.toast.error('Failed to update profile');
    } finally {
      this.loading.set(false);
    }
  }

  async changePassword(): Promise<void> {
    if (!this.currentUser) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      this.toast.error('Password must be at least 8 characters');
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.changePassword(this.currentUser.memberId, currentPassword, newPassword);
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.toast.success('Password changed successfully');
    } catch {
      this.toast.error('Failed to change password');
    } finally {
      this.loading.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
    this.toast.info('Logged out successfully');
    void this.router.navigate(['/login']);
  }
}
