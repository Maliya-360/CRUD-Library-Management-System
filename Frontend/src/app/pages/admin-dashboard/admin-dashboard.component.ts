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

type AdminSection = 'dashboard' | 'users' | 'books' | 'transactions' | 'reservations';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly pageSize = 3;
  currentUser: LoginResponse | null = null;
  currentSection: AdminSection = 'dashboard';
  sidebarOpen = false;

  members: MemberRecord[] = [];
  adminProfile: MemberRecord | null = null;
  books: BookRecord[] = [];
  transactions: TransactionRecord[] = [];
  reservations: ReservationRecord[] = [];

  totalUsers = 0;
  totalBooks = 0;
  totalTransactions = 0;
  totalReservations = 0;

  memberSearch = '';
  memberFilter = 'all';
  memberPage = 1;
  membersExpanded = false;

  bookSearch = '';
  bookFilter = 'all';
  bookPage = 1;
  booksExpanded = false;

  transactionSearch = '';
  transactionFilter = 'all';
  transactionPage = 1;
  transactionsExpanded = false;

  reservationSearch = '';
  reservationFilter = 'all';
  reservationPage = 1;
  reservationsExpanded = false;

  registerMemberForm = { firstName: '', lastName: '', email: '', phone: '', password: '' };
  registerBookForm = { title: '', author: '', isbn: '', publicationDate: '', totalQuantity: 1, category: '' };
  issueTransactionForm = { bookId: '', memberId: '', daysToReturn: 14 };
  reservationForm = { bookId: '', memberId: '' };
  returnTransactionForm = { transactionId: '', isDamaged: false };

  profileModalOpen = false;
  loadingProfile = signal(false);
  profileForm = { firstName: '', lastName: '', email: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  editMemberModalOpen = false;
  editMemberForm: MemberRecord | null = null;
  editBookModalOpen = false;
  editBookForm: BookRecord | null = null;

  deleteBookConfirmOpen = false;
  deleteBookTargetId: number | null = null;

  async ngOnInit(): Promise<void> {
    this.currentUser = this.auth.getCurrentUser();
    if (!this.currentUser || this.currentUser.memberType !== 'Admin') {
      await this.router.navigate(['/dashboard']);
      return;
    }
    await this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const [members, books, transactions, reservations] = await Promise.all([
        this.auth.getAllMembers(),
        this.auth.getAllBooks(),
        this.auth.getAllTransactions(),
        this.auth.getAllReservations()
      ]);
      this.members = members.filter(m => m.memberType === 'Member');
      this.adminProfile = members.find(m => m.memberId === this.currentUser?.memberId) ?? null;
      this.books = books;
      this.transactions = transactions;
      this.reservations = reservations.sort((left, right) => {
        const bookOrder = left.bookId - right.bookId;
        if (bookOrder !== 0) return bookOrder;

        const statusOrder = this.getReservationStatusPriority(left.status) - this.getReservationStatusPriority(right.status);
        if (statusOrder !== 0) return statusOrder;

        return new Date(left.reservationDate).getTime() - new Date(right.reservationDate).getTime();
      });
      this.totalUsers = this.members.length;
      this.totalBooks = this.books.length;
      this.totalTransactions = this.transactions.length;
      this.totalReservations = this.reservations.length;

      if (this.currentUser) {
        this.profileForm = {
          firstName: this.adminProfile?.firstName || this.currentUser.firstName || '',
          lastName: this.adminProfile?.lastName || this.currentUser.lastName || '',
          email: this.adminProfile?.email || this.currentUser.email || ''
        };
      }
    } catch {
      this.toast.error('Failed to load admin dashboard data');
    }
  }

  setSection(section: AdminSection): void {
    this.currentSection = section;
    this.memberPage = this.bookPage = this.transactionPage = this.reservationPage = 1;
    this.membersExpanded = this.booksExpanded = this.transactionsExpanded = this.reservationsExpanded = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.auth.logout();
    this.toast.success('Logged out successfully');
    void this.router.navigate(['/login']);
  }

  get filteredMembers(): MemberRecord[] {
    const search = this.memberSearch.trim().toLowerCase();
    return this.members.filter(m => {
      const matchesSearch =
        !search ||
        [m.firstName, m.lastName, m.email, m.phone, m.membershipNumber]
          .join(' ')
          .toLowerCase()
          .includes(search);
      const matchesFilter =
        this.memberFilter === 'all' ||
        (this.memberFilter === 'active' && m.isActive) ||
        (this.memberFilter === 'inactive' && !m.isActive);
      return matchesSearch && matchesFilter;
    });
  }

  get pagedMembers(): MemberRecord[] {
    const start = (this.memberPage - 1) * this.pageSize;
    return this.filteredMembers.slice(start, start + this.pageSize);
  }

  get memberPages(): number {
    return Math.max(1, Math.ceil(this.filteredMembers.length / this.pageSize));
  }

  get filteredBooks(): BookRecord[] {
    const search = this.bookSearch.trim().toLowerCase();
    return this.books.filter(b => {
      const matchesSearch =
        !search ||
        [b.title, b.author, b.isbn, b.category].join(' ').toLowerCase().includes(search);
      const matchesFilter =
        this.bookFilter === 'all' ||
        (this.bookFilter === 'available' && b.isAvailable) ||
        (this.bookFilter === 'unavailable' && !b.isAvailable);
      return matchesSearch && matchesFilter;
    });
  }

  get pagedBooks(): BookRecord[] {
    const start = (this.bookPage - 1) * this.pageSize;
    return this.filteredBooks.slice(start, start + this.pageSize);
  }

  get bookPages(): number {
    return Math.max(1, Math.ceil(this.filteredBooks.length / this.pageSize));
  }

  get filteredTransactions(): TransactionRecord[] {
    const search = this.transactionSearch.trim().toLowerCase();
    return this.transactions.filter(t => {
      const matchesSearch =
        !search || [t.bookTitle, t.memberName, t.status].join(' ').toLowerCase().includes(search);
      const matchesFilter = this.transactionFilter === 'all' || t.status === this.transactionFilter;
      return matchesSearch && matchesFilter;
    });
  }

  get overdueTransactions(): TransactionRecord[] {
    return this.transactions
      .filter(transaction => this.isOverdue(transaction))
      .sort((left, right) => this.getComparableDate(left.dueDate) - this.getComparableDate(right.dueDate));
  }

  get overdueDashboardItems(): Array<{
    transactionId: number;
    bookTitle: string;
    memberName: string;
    dueDate: string;
    overdueDays: number;
  }> {
    return this.overdueTransactions.map(transaction => ({
      transactionId: transaction.transactionId,
      bookTitle: transaction.bookTitle,
      memberName: transaction.memberName,
      dueDate: transaction.dueDate,
      overdueDays: this.getOverdueDays(transaction.dueDate)
    }));
  }

  get pagedTransactions(): TransactionRecord[] {
    const start = (this.transactionPage - 1) * this.pageSize;
    return this.filteredTransactions.slice(start, start + this.pageSize);
  }

  get transactionPages(): number {
    return Math.max(1, Math.ceil(this.filteredTransactions.length / this.pageSize));
  }

  get filteredReservations(): ReservationRecord[] {
    const search = this.reservationSearch.trim().toLowerCase();
    return this.reservations.filter(r => {
      const matchesSearch =
        !search || [r.bookTitle, r.memberName, r.status].join(' ').toLowerCase().includes(search);
      const matchesFilter = this.reservationFilter === 'all' || r.status === this.reservationFilter;
      return matchesSearch && matchesFilter;
    });
  }

  get pagedReservations(): ReservationRecord[] {
    const start = (this.reservationPage - 1) * this.pageSize;
    return this.filteredReservations.slice(start, start + this.pageSize);
  }

  get reservationPages(): number {
    return Math.max(1, Math.ceil(this.filteredReservations.length / this.pageSize));
  }

  get nextInLineReservations(): Array<{ bookId: number; bookTitle: string; memberName: string; reservationDate: string }> {
    const queueByBook = new Map<number, ReservationRecord[]>();

    this.reservations
      .filter(reservation => this.isQueueReservation(reservation))
      .forEach(reservation => {
        const existing = queueByBook.get(reservation.bookId) ?? [];
        queueByBook.set(reservation.bookId, [...existing, reservation]);
      });

    return [...queueByBook.values()]
      .map(queue => queue.sort((left, right) => new Date(left.reservationDate).getTime() - new Date(right.reservationDate).getTime())[0])
      .filter((reservation): reservation is ReservationRecord => !!reservation)
      .map(reservation => ({
        bookId: reservation.bookId,
        bookTitle: reservation.bookTitle,
        memberName: reservation.memberName,
        reservationDate: reservation.reservationDate
      }));
  }

  reservationQueuePosition(reservation: ReservationRecord): number {
    const queue = this.getQueueForBook(reservation.bookId);
    const index = queue.findIndex(item => item.reservationId === reservation.reservationId);
    return index >= 0 ? index + 1 : 0;
  }

  isNextInLine(reservation: ReservationRecord): boolean {
    return this.reservationQueuePosition(reservation) === 1;
  }

  async registerMember(): Promise<void> {
    const f = this.registerMemberForm;
    if (!f.firstName || !f.lastName || !f.email || !f.phone || !f.password) {
      this.toast.error('Please fill in all fields');
      return;
    }
    try {
      await this.auth.registerMember(f);
      this.toast.success('Member registered successfully');
      this.registerMemberForm = { firstName: '', lastName: '', email: '', phone: '', password: '' };
      await this.loadData();
      this.setSection('users');
    } catch {
      this.toast.error('Failed to register member');
    }
  }

  async registerBook(): Promise<void> {
    const f = this.registerBookForm;
    if (!f.title || !f.author || !f.isbn || !f.publicationDate || !f.category) {
      this.toast.error('Please fill in all book fields');
      return;
    }
    try {
      await this.auth.createBook(f);
      this.toast.success('Book created successfully');
      this.registerBookForm = { title: '', author: '', isbn: '', publicationDate: '', totalQuantity: 1, category: '' };
      await this.loadData();
      this.setSection('books');
    } catch {
      this.toast.error('Failed to create book');
    }
  }

  async submitIssueTransaction(): Promise<void> {
    const bookId = parseInt(this.issueTransactionForm.bookId, 10);
    const memberId = parseInt(this.issueTransactionForm.memberId, 10);
    const daysToReturn = this.issueTransactionForm.daysToReturn;
    if (!bookId || !memberId || !daysToReturn) {
      this.toast.error('Please fill in all transaction fields');
      return;
    }
    const book = this.books.find(b => b.bookId === bookId);
    if (!book) {
      this.toast.error('Selected book was not found');
      return;
    }
    if (book.availableQuantity <= 0) {
      this.toast.error(`Book '${book.title}' has no available copies`);
      return;
    }
    try {
      await this.auth.issueTransaction({ bookId, memberId, daysToReturn });
      this.toast.success('Transaction created successfully');
      this.issueTransactionForm = { bookId: '', memberId: '', daysToReturn: 14 };
      await this.loadData();
      this.setSection('transactions');
    } catch {
      this.toast.error('Failed to create transaction');
    }
  }

  openReturnTransaction(transactionId: number): void {
    this.returnTransactionForm = { transactionId: String(transactionId), isDamaged: false };
  }

  async submitReturnTransaction(): Promise<void> {
    const transactionId = parseInt(this.returnTransactionForm.transactionId, 10);
    if (!transactionId) {
      this.toast.error('Please select a transaction to return');
      return;
    }
    try {
      await this.auth.returnTransaction({
        transactionId,
        isDamaged: this.returnTransactionForm.isDamaged
      });
      this.toast.success('Book returned successfully');
      this.returnTransactionForm = { transactionId: '', isDamaged: false };
      await this.loadData();
      this.setSection('transactions');
    } catch {
      this.toast.error('Failed to return book');
    }
  }

  async createReservation(): Promise<void> {
    const bookId = parseInt(this.reservationForm.bookId, 10);
    const memberId = parseInt(this.reservationForm.memberId, 10);
    if (!bookId || !memberId) {
      this.toast.error('Please fill in all reservation fields');
      return;
    }
    try {
      await this.auth.createReservation({ bookId, memberId });
      this.toast.success('Reservation created successfully');
      this.reservationForm = { bookId: '', memberId: '' };
      await this.loadData();
      this.setSection('reservations');
    } catch {
      this.toast.error('Copies are available, no need to reserve');
    }
  }

  async cancelReservation(reservationId: number): Promise<void> {
    try {
      await this.auth.cancelReservation({ reservationId });
      this.toast.success('Reservation cancelled');
      await this.loadData();
    } catch {
      this.toast.error('Failed to cancel reservation');
    }
  }

  openEditMember(member: MemberRecord): void {
    this.editMemberForm = { ...member };
    this.editMemberModalOpen = true;
  }

  async submitEditMember(): Promise<void> {
    if (!this.editMemberForm) return;
    try {
      await this.auth.updateMember(this.editMemberForm.memberId, {
        FirstName: this.editMemberForm.firstName,
        LastName: this.editMemberForm.lastName,
        Email: this.editMemberForm.email,
        Phone: this.editMemberForm.phone,
        IsActive: this.editMemberForm.isActive
      });
      this.toast.success('Member updated');
      this.editMemberModalOpen = false;
      this.editMemberForm = null;
      await this.loadData();
    } catch {
      this.toast.error('Failed to update member');
    }
  }

  openEditBook(book: BookRecord): void {
    this.editBookForm = { ...book };
    this.editBookModalOpen = true;
  }

  async submitEditBook(): Promise<void> {
    if (!this.editBookForm) return;
    try {
      await this.auth.updateBook(this.editBookForm.bookId, {
        title: this.editBookForm.title,
        author: this.editBookForm.author,
        isbn: this.editBookForm.isbn,
        publicationDate: this.editBookForm.publicationDate,
        availableQuantity: this.editBookForm.availableQuantity,
        totalQuantity: this.editBookForm.totalQuantity,
        category: this.editBookForm.category
      });
      this.toast.success('Book updated');
      this.editBookModalOpen = false;
      this.editBookForm = null;
      await this.loadData();
    } catch {
      this.toast.error('Failed to update book');
    }
  }

  openDeleteBook(bookId: number): void {
    this.deleteBookTargetId = bookId;
    this.deleteBookConfirmOpen = true;
  }

  async confirmDeleteBook(): Promise<void> {
    if (!this.deleteBookTargetId) return;
    try {
      await this.auth.deleteBook(this.deleteBookTargetId);
      this.toast.success('Book deleted');
      await this.loadData();
    } catch {
      this.toast.error('Failed to delete book');
    }
    this.deleteBookConfirmOpen = false;
    this.deleteBookTargetId = null;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'N/A';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  }

  private getQueueForBook(bookId: number): ReservationRecord[] {
    return this.reservations
      .filter(reservation => reservation.bookId === bookId && this.isQueueReservation(reservation))
      .sort((left, right) => new Date(left.reservationDate).getTime() - new Date(right.reservationDate).getTime());
  }

  private isQueueReservation(reservation: ReservationRecord): boolean {
    return reservation.status === 'Active' || reservation.status === 'Ready';
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

  private getOverdueDays(dueDateValue: string | null | undefined): number {
    const dueDate = this.getComparableDate(dueDateValue);
    if (!Number.isFinite(dueDate)) return 0;

    const elapsed = Date.now() - dueDate;
    return elapsed > 0 ? Math.max(1, Math.ceil(elapsed / (1000 * 60 * 60 * 24))) : 0;
  }

  private getReservationStatusPriority(status: string): number {
    switch (status) {
      case 'Ready':
        return 0;
      case 'Active':
        return 1;
      case 'Expired':
        return 2;
      case 'Cancelled':
        return 3;
      default:
        return 4;
    }
  }

  toggleProfileModal(): void {
    this.profileModalOpen = !this.profileModalOpen;
    if (!this.profileModalOpen) {
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.currentUser) return;
    const f = this.profileForm;
    if (!f.firstName || !f.lastName || !f.email) {
      this.toast.error('Please fill in all profile fields');
      return;
    }

    this.loadingProfile.set(true);
    try {
      const updated = await this.auth.updateProfile(this.currentUser.memberId, {
        FirstName: f.firstName,
        LastName: f.lastName,
        Email: f.email,
        Phone: this.adminProfile?.phone || ''
      });

      this.currentUser = {
        ...this.currentUser,
        firstName: updated.firstName ?? f.firstName,
        lastName: updated.lastName ?? f.lastName,
        email: updated.email ?? f.email
      };
      this.auth.setCurrentUser(this.currentUser);
      this.toast.success('Profile updated successfully');
    } catch {
      this.toast.error('Failed to update profile');
    } finally {
      this.loadingProfile.set(false);
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

    this.loadingProfile.set(true);
    try {
      await this.auth.changePassword(currentPassword, newPassword);
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.toast.success('Password changed successfully');
    } catch {
      this.toast.error('Failed to change password');
    } finally {
      this.loadingProfile.set(false);
    }
  }
}
