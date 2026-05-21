import { Component, OnInit, inject } from '@angular/core';
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
  bookSearch = '';
  bookFilter = 'all';
  bookPage = 1;
  transactionSearch = '';
  transactionFilter = 'all';
  transactionPage = 1;
  reservationSearch = '';
  reservationFilter = 'all';
  reservationPage = 1;

  registerMemberForm = { firstName: '', lastName: '', email: '', phone: '', password: '' };
  registerBookForm = { title: '', author: '', isbn: '', publicationDate: '', totalQuantity: 1, category: '' };
  issueTransactionForm = { bookId: '', memberId: '', daysToReturn: 14 };
  reservationForm = { bookId: '', memberId: '' };
  returnTransactionForm = { transactionId: '', isDamaged: false };

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
      this.books = books;
      this.transactions = transactions;
      this.reservations = reservations;
      this.totalUsers = this.members.length;
      this.totalBooks = this.books.length;
      this.totalTransactions = this.transactions.length;
      this.totalReservations = this.reservations.length;
    } catch {
      this.toast.error('Failed to load admin dashboard data');
    }
  }

  setSection(section: AdminSection): void {
    this.currentSection = section;
    this.memberPage = this.bookPage = this.transactionPage = this.reservationPage = 1;
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
      this.toast.error('Failed to create reservation');
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
}
