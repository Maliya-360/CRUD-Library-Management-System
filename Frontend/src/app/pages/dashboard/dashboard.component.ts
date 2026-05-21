import { AuthService, BookRecord, LoginResponse, MemberRecord, TransactionRecord } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export class DashboardComponent {
  private authService: AuthService;
  private toastService: ToastService;
  private currentUser: LoginResponse | null = null;
  private memberProfile: MemberRecord | null = null;
  private books: BookRecord[] = [];
  private transactions: TransactionRecord[] = [];
  private bookSearch = '';
  private bookFilter = 'all';
  private profileModalOpen = false;
  private loading = false;
  private profileForm = {
    firstName: '',
    lastName: '',
    email: ''
  };
  private passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(authService: AuthService, toastService: ToastService) {
    this.authService = authService;
    this.toastService = toastService;
  }

  async initialize(): Promise<boolean> {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      window.navigateTo('login');
      return false;
    }

    if (this.currentUser.memberType === 'Admin') {
      window.navigateTo('admin-dashboard');
      return false;
    }

    try {
      const [books, transactions, members] = await Promise.all([
        this.authService.getAllBooks(),
        this.authService.getAllTransactions(),
        this.authService.getAllMembers()
      ]);

      this.books = books;
      this.transactions = transactions;
      this.memberProfile = members.find(member => member.memberId === this.currentUser?.memberId) || null;
      this.profileForm = {
        firstName: this.memberProfile?.firstName || this.currentUser.firstName || '',
        lastName: this.memberProfile?.lastName || this.currentUser.lastName || '',
        email: this.memberProfile?.email || this.currentUser.email || ''
      };
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to load dashboard data');
    }

    return true;
  }

  updateBookSearch(value: string): void {
    this.bookSearch = value;
  }

  updateBookFilter(value: string): void {
    this.bookFilter = value;
  }

  toggleProfileModal(): void {
    this.profileModalOpen = !this.profileModalOpen;
  }

  closeProfileModal(): void {
    this.profileModalOpen = false;
  }

  updateProfileField(field: 'firstName' | 'lastName' | 'email', value: string): void {
    this.profileForm = {
      ...this.profileForm,
      [field]: value
    };
  }

  updatePasswordField(field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string): void {
    this.passwordForm = {
      ...this.passwordForm,
      [field]: value
    };
  }

  async saveProfile(): Promise<void> {
    if (!this.currentUser) return;

    if (!this.profileForm.firstName || !this.profileForm.lastName || !this.profileForm.email) {
      this.toastService.error('Please fill in all profile fields');
      return;
    }

    this.loading = true;
    try {
      const updated = await this.authService.updateProfile(this.currentUser.memberId, {
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
      this.authService.setCurrentUser(this.currentUser);
      this.toastService.success('Profile updated successfully');
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to update profile');
    } finally {
      this.loading = false;
    }
  }

  async changePassword(): Promise<void> {
    if (!this.currentUser) return;

    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.toastService.error('Please fill in all password fields');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.toastService.error('Password must be at least 8 characters');
      return;
    }

    this.loading = true;
    try {
      await this.authService.changePassword(this.currentUser.memberId, this.passwordForm.currentPassword, this.passwordForm.newPassword);
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.toastService.success('Password changed successfully');
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to change password');
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    this.authService.logout();
    window.navigateTo('login');
  }

  private getMyTransactions(): TransactionRecord[] {
    if (!this.currentUser) return [];
    return this.transactions.filter(transaction => transaction.memberId === this.currentUser?.memberId);
  }

  private isBorrowedTransaction(transaction: TransactionRecord): boolean {
    return transaction.status !== 'Returned';
  }

  private isOverdueTransaction(transaction: TransactionRecord): boolean {
    if (!this.isBorrowedTransaction(transaction)) {
      return false;
    }

    if (transaction.status === 'Overdue') {
      return true;
    }

    if (!transaction.dueDate) {
      return false;
    }

    return new Date(transaction.dueDate).getTime() < Date.now();
  }

  private getBorrowedTransactions(): TransactionRecord[] {
    return this.getMyTransactions().filter(transaction => this.isBorrowedTransaction(transaction));
  }

  private getOverdueTransactions(): TransactionRecord[] {
    return this.getMyTransactions().filter(transaction => this.isOverdueTransaction(transaction));
  }

  private getFilteredBooks(): BookRecord[] {
    const search = this.bookSearch.trim().toLowerCase();

    return this.books.filter(book => {
      const matchesSearch = !search || [book.title, book.author, book.isbn, book.category]
        .join(' ')
        .toLowerCase()
        .includes(search);

      const matchesFilter = this.bookFilter === 'all'
        || (this.bookFilter === 'available' && book.isAvailable)
        || (this.bookFilter === 'unavailable' && !book.isAvailable);

      return matchesSearch && matchesFilter;
    });
  }

  private getAvailableBooksCount(): number {
    return this.books.filter(book => book.isAvailable).length;
  }

  private getBorrowedBooksCount(): number {
    return this.getBorrowedTransactions().length;
  }

  private getOverdueBooksCount(): number {
    return this.getOverdueTransactions().length;
  }

  private getDashboardStats(): Array<{ title: string; value: number; icon: string; tone: string; }> {
    return [
      { title: 'Total Books', value: this.books.length, icon: '📚', tone: 'books' },
      { title: 'Available Books', value: this.getAvailableBooksCount(), icon: '✅', tone: 'available' },
      { title: 'Borrowed Books', value: this.getBorrowedBooksCount(), icon: '📖', tone: 'borrowed' },
      { title: 'Overdue Books', value: this.getOverdueBooksCount(), icon: '⏰', tone: 'overdue' }
    ];
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  }

  render(): string {
    const filteredBooks = this.getFilteredBooks();
    const borrowedTransactions = this.getBorrowedTransactions();
    const overdueTransactions = this.getOverdueTransactions();
    const stats = this.getDashboardStats();

    return `
      <div class="dashboard-shell">
        <header class="admin-topbar dashboard-topbar">
          <div class="topbar-left">
            <div class="dashboard-brand">
              <div class="dashboard-brand-mark">📚</div>
              <div>
                <div class="topbar-title">Library Dashboard</div>
              </div>
            </div>
          </div>

          <div class="topbar-right dashboard-actions">
            <button class="profile-icon-btn" onclick="window.toggleDashboardProfileModal()" title="Profile settings" aria-label="Profile settings">
              <span class="profile-icon">👤</span>
            </button>
            <button class="logout-btn dashboard-logout" onclick="window.logout()">Logout</button>
          </div>
        </header>

        <main class="dashboard-content dashboard-page">
          <section class="stats-grid dashboard-stats">
            ${stats.map(stat => `
              <div class="stat-card dashboard-stat ${stat.tone}">
                <div class="stat-icon ${stat.tone}">${stat.icon}</div>
                <div class="stat-info">
                  <h3>${stat.title}</h3>
                  <p class="stat-value">${stat.value}</p>
                </div>
              </div>
            `).join('')}
          </section>

          <section class="members-layout dashboard-grid">
            <section class="members-panel dashboard-panel">
              <div class="members-panel-header">
                <h2>Books</h2>
                <span>${filteredBooks.length} results</span>
              </div>
              <div class="members-toolbar dashboard-toolbar">
                <input
                  class="members-search"
                  type="text"
                  placeholder="Search title, author, ISBN, category"
                  data-dashboard-search="books"
                  value="${this.bookSearch}"
                  oninput="window.updateDashboardBookSearch(this.value)"
                  onchange="window.updateDashboardBookSearch(this.value)"
                >
                <select class="members-filter" onchange="window.updateDashboardBookFilter(this.value)">
                  <option value="all" ${this.bookFilter === 'all' ? 'selected' : ''}>All books</option>
                  <option value="available" ${this.bookFilter === 'available' ? 'selected' : ''}>Available</option>
                  <option value="unavailable" ${this.bookFilter === 'unavailable' ? 'selected' : ''}>Unavailable</option>
                </select>
              </div>
              <div class="members-list dashboard-book-list">
                ${filteredBooks.length ? filteredBooks.map(book => `
                  <div class="member-row dashboard-book-row">
                    <div class="member-main">
                      <strong>${book.title}</strong>
                      <span>${book.author}</span>
                      <small>${book.isbn} · ${book.category}</small>
                    </div>
                    <div class="member-meta">
                      <span class="member-status ${book.isAvailable ? 'active' : 'inactive'}">${book.isAvailable ? 'Available' : 'Unavailable'}</span>
                      <small>Qty: ${book.availableQuantity}/${book.totalQuantity}</small>
                    </div>
                  </div>
                `).join('') : '<div class="empty-state">No books match your search.</div>'}
              </div>
            </section>

            <section class="members-panel dashboard-panel">
              <div class="members-panel-header">
                <h2>Borrowed Books</h2>
                <span>${borrowedTransactions.length} active</span>
              </div>
              <div class="members-list">
                ${borrowedTransactions.length ? borrowedTransactions.map(transaction => `
                  <div class="member-row dashboard-loan-row">
                    <div class="member-main">
                      <strong>${transaction.bookTitle}</strong>
                      <span>Due ${this.formatDate(transaction.dueDate)}</span>
                      <small>Borrowed on ${this.formatDate(transaction.issueDate)}</small>
                    </div>
                    <div class="member-meta">
                      <span class="member-status active">Borrowed</span>
                      <small>Fine: ${transaction.fine || 0}</small>
                    </div>
                  </div>
                `).join('') : '<div class="empty-state">You do not have any borrowed books right now.</div>'}
              </div>
            </section>

            <section class="members-panel dashboard-panel">
              <div class="members-panel-header">
                <h2>Overdue Books</h2>
                <span>${overdueTransactions.length} overdue</span>
              </div>
              <div class="members-list">
                ${overdueTransactions.length ? overdueTransactions.map(transaction => `
                  <div class="member-row dashboard-overdue-row">
                    <div class="member-main">
                      <strong>${transaction.bookTitle}</strong>
                      <span>Due ${this.formatDate(transaction.dueDate)}</span>
                      <small>Borrowed on ${this.formatDate(transaction.issueDate)} · Fine ${transaction.fine || 0}</small>
                    </div>
                    <div class="member-meta">
                      <span class="member-status inactive">Overdue</span>
                      <small>${transaction.isDamaged ? 'Damaged return' : 'Return pending'}</small>
                    </div>
                  </div>
                `).join('') : '<div class="empty-state">No overdue books at the moment.</div>'}
              </div>
            </section>
          </section>
        </main>

        ${this.profileModalOpen ? `
          <div class="modal-overlay">
            <div class="modal dashboard-modal">
              <div class="modal-header">
                <div>
                  <span class="modal-kicker">Profile</span>
                  <h3>Edit Profile Settings</h3>
                </div>
                <button class="modal-close" aria-label="Close profile settings" onclick="window.toggleDashboardProfileModal()">✕</button>
              </div>

              <div class="modal-grid">
                <label>
                  First name
                  <input type="text" value="${this.profileForm.firstName}" oninput="window.updateDashboardProfileField('firstName', this.value)" placeholder="First name">
                </label>
                <label>
                  Last name
                  <input type="text" value="${this.profileForm.lastName}" oninput="window.updateDashboardProfileField('lastName', this.value)" placeholder="Last name">
                </label>
                <label class="modal-span-2">
                  Email
                  <input type="email" value="${this.profileForm.email}" oninput="window.updateDashboardProfileField('email', this.value)" placeholder="Email">
                </label>
              </div>

              <div class="modal-actions">
                <button class="modal-primary" onclick="window.submitDashboardProfile()" ${this.loading ? 'disabled' : ''}>Save changes</button>
                <button class="modal-secondary" onclick="window.toggleDashboardProfileModal()">Cancel</button>
              </div>

              <div class="dashboard-password-block">
                <div class="members-panel-header">
                  <h2>Change Password</h2>
                </div>
                <div class="register-form">
                  <input class="register-input" type="password" placeholder="Current password" value="${this.passwordForm.currentPassword}" oninput="window.updateDashboardPasswordField('currentPassword', this.value)">
                  <input class="register-input" type="password" placeholder="New password" value="${this.passwordForm.newPassword}" oninput="window.updateDashboardPasswordField('newPassword', this.value)">
                  <input class="register-input" type="password" placeholder="Confirm new password" value="${this.passwordForm.confirmPassword}" oninput="window.updateDashboardPasswordField('confirmPassword', this.value)">
                  <button class="register-btn" onclick="window.submitDashboardPassword()" ${this.loading ? 'disabled' : ''}>Update password</button>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <style>
        .dashboard-shell {
          min-height: 100vh;
          background: var(--light-gray);
          color: var(--dark);
          overflow: hidden;
        }

        .dashboard-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .dashboard-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dashboard-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #fff;
          font-size: 1.2rem;
        }

        .dashboard-actions {
          gap: 12px;
        }

        .profile-icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--white);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
        }

        .profile-icon {
          font-size: 1.05rem;
        }

        .dashboard-logout {
          background: var(--dark);
          color: var(--white);
        }

        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 28px;
          height: calc(100vh - 70px);
          overflow: hidden;
        }

        .dashboard-stats {
          margin-bottom: 0;
          margin-top: 6px;
        }

        .dashboard-stat {
          border-radius: 14px;
        }

        .dashboard-stat.books .stat-icon {
          background: rgba(59, 130, 246, 0.1);
        }

        .dashboard-stat.available .stat-icon {
          background: rgba(34, 197, 94, 0.1);
        }

        .dashboard-stat.borrowed .stat-icon {
          background: rgba(245, 158, 11, 0.1);
        }

        .dashboard-stat.overdue .stat-icon {
          background: rgba(239, 68, 68, 0.1);
        }

        .dashboard-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: stretch;
          min-height: 0;
          flex: 1;
        }

        .dashboard-panel {
          min-height: 100%;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .dashboard-panel .members-panel-header {
          margin-bottom: 14px;
        }

        .dashboard-panel .members-panel-header h2 {
          font-size: 1rem;
        }

        .dashboard-toolbar {
          margin-bottom: 16px;
          flex: 0 0 auto;
        }

        .dashboard-book-list,
        .dashboard-loan-row,
        .dashboard-overdue-row {
          max-height: none;
        }

        .dashboard-panel .members-list {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 4px;
        }

        .dashboard-panel .members-list::-webkit-scrollbar {
          width: 6px;
        }

        .dashboard-panel .members-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .dashboard-panel .members-list::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 999px;
        }

        .dashboard-book-list,
        .dashboard-panel .members-list {
          max-height: calc(100vh - 360px);
        }

        .dashboard-book-list,
        .dashboard-panel .members-list {
          overflow-y: auto;
        }

        .dashboard-modal {
          width: min(100%, 720px);
        }

        .dashboard-password-block {
          margin-top: 18px;
          border-top: 1px solid var(--border);
          padding-top: 18px;
        }

        @media (max-width: 1100px) {
          .dashboard-page {
            height: auto;
            overflow: visible;
          }

          .dashboard-shell {
            overflow: auto;
          }

          .dashboard-grid {
            flex: none;
          }

          .dashboard-book-list,
          .dashboard-panel .members-list {
            max-height: 320px;
          }
        }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-book-list,
          .dashboard-panel .members-list {
            max-height: 280px;
          }
        }
      </style>
    `;
  }
}
