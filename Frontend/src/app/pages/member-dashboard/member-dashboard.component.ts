import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BookRecord,
  LoginResponse,
  MemberRecord,
  ReservationRecord,
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
  reservations: ReservationRecord[] = [];

  bookSearch = '';
  bookFilter = 'all';

  bookPage = 1;
  borrowedPage = 1;
  overduePage = 1;

  readonly pageSize = 3;

  profileModalOpen = false;
  notificationsOpen = false;
  loading = signal(false);

  booksExpanded = false;
  borrowedExpanded = false;
  overdueExpanded = false;

  profileForm = { firstName: '', lastName: '', email: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  async ngOnInit(): Promise<void> {
    this.currentUser = this.auth.getCurrentUser();
    if (!this.currentUser) {
      await this.router.navigate(['/login']);
      return;
    }

    try {
      const [books, transactions, members, reservations] = await Promise.all([
        this.auth.getAllBooks(),
        this.auth.getAllTransactions(),
        this.auth.getAllMembers(),
        this.auth.getAllReservations()
      ]);

      this.books = books;
      this.transactions = transactions;
      this.reservations = reservations;
      this.memberProfile =
        members.find(m => m.memberId === this.currentUser?.memberId) ?? null;

      this.bookPage = 1;
      this.borrowedPage = 1;
      this.overduePage = 1;

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
    return this.borrowedTransactions.filter(t => this.isOverdue(t)).sort((left, right) => {
      const leftDue = this.getComparableDate(left.dueDate);
      const rightDue = this.getComparableDate(right.dueDate);
      return leftDue - rightDue;
    });
  }

  get memberReservations(): ReservationRecord[] {
    return this.reservations.filter(reservation => reservation.memberId === this.currentUser?.memberId);
  }

  get readyReservations(): ReservationRecord[] {
    return this.memberReservations.filter(reservation => this.isReservationReady(reservation));
  }

  get notificationItems(): Array<{
    kind: 'available' | 'overdue';
    title: string;
    message: string;
    note: string;
  }> {
    const availableReservations = this.readyReservations.map(reservation => ({
      kind: 'available' as const,
      title: reservation.bookTitle,
      message: `${reservation.bookTitle} is available now. You are next in line.`,
      note: `Reserved on ${this.formatDate(reservation.reservationDate)}`
    }));

    const overdueItems = this.overdueTransactions.map(transaction => ({
      kind: 'overdue' as const,
      title: transaction.bookTitle,
      message: `${transaction.bookTitle} is overdue. Please return it to avoid more fine.`,
      note: `Due ${this.formatDate(transaction.dueDate)}`
    }));

    return [...overdueItems, ...availableReservations];
  }

  get overduePreview(): TransactionRecord[] {
    return this.overdueTransactions.slice(0, this.pageSize);
  }

  get notificationCount(): number {
    return this.notificationItems.length;
  }

  get hasOverdueNotifications(): boolean {
    return this.notificationItems.some(notification => notification.kind === 'overdue');
  }

  get pagedFilteredBooks(): BookRecord[] {
    return this.filteredBooks.slice((this.bookPage - 1) * this.pageSize, this.bookPage * this.pageSize);
  }

  get pagedBorrowedTransactions(): TransactionRecord[] {
    return this.borrowedTransactions.slice((this.borrowedPage - 1) * this.pageSize, this.borrowedPage * this.pageSize);
  }

  get pagedOverdueTransactions(): TransactionRecord[] {
    return this.overdueTransactions.slice((this.overduePage - 1) * this.pageSize, this.overduePage * this.pageSize);
  }

  get bookTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBooks.length / this.pageSize));
  }

  get borrowedTotalPages(): number {
    return Math.max(1, Math.ceil(this.borrowedTransactions.length / this.pageSize));
  }

  get overdueTotalPages(): number {
    return Math.max(1, Math.ceil(this.overdueTransactions.length / this.pageSize));
  }

  nextBooks(): void {
    this.bookPage = Math.min(this.bookTotalPages, this.bookPage + 1);
  }

  prevBooks(): void {
    this.bookPage = Math.max(1, this.bookPage - 1);
  }

  nextBorrowed(): void {
    this.borrowedPage = Math.min(this.borrowedTotalPages, this.borrowedPage + 1);
  }

  prevBorrowed(): void {
    this.borrowedPage = Math.max(1, this.borrowedPage - 1);
  }

  nextOverdue(): void {
    this.overduePage = Math.min(this.overdueTotalPages, this.overduePage + 1);
  }

  prevOverdue(): void {
    this.overduePage = Math.max(1, this.overduePage - 1);
  }

  onBookSearchOrFilterChanged(): void {
    this.bookPage = 1;
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

  private getReservationsForBook(bookId: number): ReservationRecord[] {
    return this.reservations
      .filter(reservation => reservation.bookId === bookId && this.isReservationQueued(reservation))
      .sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
  }

  private isReservationQueued(reservation: ReservationRecord): boolean {
    return reservation.status === 'Active' || reservation.status === 'Ready';
  }

  private isReservationReady(reservation: ReservationRecord): boolean {
    if (reservation.status === 'Ready') {
      return true;
    }

    if (reservation.status !== 'Active') {
      return false;
    }

    const book = this.books.find(bookItem => bookItem.bookId === reservation.bookId);
    if (!book || book.availableQuantity <= 0) {
      return false;
    }

    const queue = this.getReservationsForBook(reservation.bookId);
    return queue[0]?.reservationId === reservation.reservationId;
  }

  private isOverdue(transaction: TransactionRecord): boolean {
    if (transaction.status === 'Returned') return false;
    if (transaction.status === 'Overdue') return true;
    if (!transaction.dueDate) return false;
    const dueDate = new Date(transaction.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    dueDate.setHours(23, 59, 59, 999);
    return dueDate.getTime() < Date.now();
  }

  private getComparableDate(value: string | null | undefined): number {
    if (!value) return Number.POSITIVE_INFINITY;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime();
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  }

  toggleProfileModal(): void {
    this.notificationsOpen = false;
    this.profileModalOpen = !this.profileModalOpen;
  }

  toggleNotifications(): void {
    this.profileModalOpen = false;
    this.notificationsOpen = !this.notificationsOpen;
  }

  closeNotifications(): void {
    this.notificationsOpen = false;
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
      await this.auth.changePassword(currentPassword, newPassword);
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
