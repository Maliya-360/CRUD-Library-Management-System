import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export class AdminDashboardComponent {
  private authService: AuthService;
  private toastService: ToastService;
  private sidebarOpen: boolean = false;
  private currentUser: any = null;
  private currentSection: 'dashboard' | 'users' = 'dashboard';
  private members: any[] = [];
  private books: any[] = [];
  private memberSearch = '';
  private memberFilter = 'all';
  private memberPage = 1;
  private bookSearch = '';
  private bookFilter = 'all';
  private bookPage = 1;
  private readonly pageSize = 4;
  private totalUsers = 0;
  private totalBooks = 0;
  private totalTransactions = 0;
  private totalReservations = 0;
  private registerMemberForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };
  private registerBookForm = {
    title: '',
    author: '',
    isbn: '',
    publicationDate: '',
    totalQuantity: 1,
    category: ''
  };
  private editMemberModalOpen = false;
  private editMemberForm: any = null;
  private editBookModalOpen = false;
  private editBookForm: any = null;
  private deleteBookConfirmOpen = false;
  private deleteBookTargetId: number | null = null;

  constructor(authService: AuthService, toastService: ToastService) {
    this.authService = authService;
    this.toastService = toastService;
  }

  async initialize(): Promise<boolean> {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser?.memberType !== 'Admin') {
      window.navigateTo('dashboard');
      return false;
    }

    try {
      const members = await this.authService.getAllMembers();
      this.members = members.filter(member => member.memberType === 'Member');
      this.totalUsers = this.members.length;

      const [books, transactions, reservations] = await Promise.all([
        this.authService.getAllBooks(),
        this.authService.getAllTransactions(),
        this.authService.getAllReservations()
      ]);

      this.totalBooks = books.length;
      this.totalTransactions = transactions.length;
      this.totalReservations = reservations.length;
      this.books = books;
    } catch (error: any) {
      this.totalUsers = 0;
      this.totalBooks = 0;
      this.totalTransactions = 0;
      this.totalReservations = 0;
      this.toastService.error(error.message || 'Failed to load dashboard data');
    }

    return true;
  }

  setSection(section: 'dashboard' | 'users' | 'books'): void {
    this.currentSection = section;
    this.memberPage = 1;
    if (section === 'books') {
      this.bookPage = 1;
    }
  }

  updateMemberSearch(value: string): void {
    this.memberSearch = value;
    this.memberPage = 1;
  }

  updateMemberFilter(value: string): void {
    this.memberFilter = value;
    this.memberPage = 1;
  }

  updateBookSearch(value: string): void {
    this.bookSearch = value;
    this.bookPage = 1;
  }

  updateBookFilter(value: string): void {
    this.bookFilter = value;
    this.bookPage = 1;
  }

  nextMemberPage(): void {
    const totalPages = this.getMemberPages();
    if (this.memberPage < totalPages) {
      this.memberPage += 1;
    }
  }

  previousMemberPage(): void {
    if (this.memberPage > 1) {
      this.memberPage -= 1;
    }
  }

  updateRegisterField(field: keyof typeof this.registerMemberForm, value: string): void {
    this.registerMemberForm = {
      ...this.registerMemberForm,
      [field]: value
    };
  }

  updateBookField(field: keyof typeof this.registerBookForm, value: string): void {
    const parsed = field === 'totalQuantity' ? parseInt(value || '0', 10) : value;
    this.registerBookForm = {
      ...this.registerBookForm,
      [field]: parsed as any
    };
  }

  async registerMember(): Promise<void> {
    const { firstName, lastName, email, phone, password } = this.registerMemberForm;

    if (!firstName || !lastName || !email || !phone || !password) {
      this.toastService.error('Please fill in all fields');
      return;
    }

    try {
      await this.authService.registerMember({ firstName, lastName, email, phone, password });
      this.toastService.success('Member registered successfully');
      this.registerMemberForm = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
      };
      const members = await this.authService.getAllMembers();
      this.members = members.filter(member => member.memberType === 'Member');
      this.totalUsers = this.members.length;
      this.currentSection = 'users';
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to register member');
    }
  }

  async registerBook(): Promise<void> {
    const { title, author, isbn, publicationDate, totalQuantity, category } = this.registerBookForm as any;

    if (!title || !author || !isbn || !publicationDate || !totalQuantity || !category) {
      this.toastService.error('Please fill in all book fields');
      return;
    }

    try {
      await this.authService.createBook({ title, author, isbn, publicationDate, totalQuantity, category });
      this.toastService.success('Book created successfully');
      this.registerBookForm = { title: '', author: '', isbn: '', publicationDate: '', totalQuantity: 1, category: '' };
      const books = await this.authService.getAllBooks();
      this.books = books;
      this.totalBooks = this.books.length;
      this.currentSection = 'books';
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to create book');
    }
  }

  openEditMember(memberId: number): void {
    const member = this.members.find(m => m.memberId === memberId);
    if (!member) return;
    this.editMemberForm = { ...member };
    this.editMemberModalOpen = true;
  }

  updateEditMemberField(field: string, value: string): void {
    if (!this.editMemberForm) return;
    if (field === 'isActive') {
      this.editMemberForm.isActive = value === 'true' || value === '1' || value === 'on';
    } else {
      this.editMemberForm[field] = value;
    }
  }

  async submitEditMember(): Promise<void> {
    if (!this.editMemberForm) return;
    try {
      const id = this.editMemberForm.memberId;
      const payload = {
        FirstName: this.editMemberForm.firstName,
        LastName: this.editMemberForm.lastName,
        Email: this.editMemberForm.email,
        Phone: this.editMemberForm.phone,
        IsActive: this.editMemberForm.isActive
      };
      await this.authService.updateMember(id, payload);
      this.toastService.success('Member updated');
      const members = await this.authService.getAllMembers();
      this.members = members.filter(member => member.memberType === 'Member');
      this.totalUsers = this.members.length;
      this.editMemberModalOpen = false;
      this.editMemberForm = null;
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to update member');
    }
  }

  closeEditMember(): void {
    this.editMemberModalOpen = false;
    this.editMemberForm = null;
  }

  openEditBook(bookId: number): void {
    const book = this.books.find(b => b.bookId === bookId);
    if (!book) return;
    this.editBookForm = { ...book };
    this.editBookModalOpen = true;
  }

  updateEditBookField(field: string, value: string): void {
    if (!this.editBookForm) return;
    if (field === 'totalQuantity') {
      this.editBookForm.totalQuantity = parseInt(value || '0', 10);
    } else {
      this.editBookForm[field] = value;
    }
  }

  async submitEditBook(): Promise<void> {
    if (!this.editBookForm) return;
    try {
      const id = this.editBookForm.bookId;
      const payload = {
        title: this.editBookForm.title,
        author: this.editBookForm.author,
        isbn: this.editBookForm.isbn,
        publicationDate: this.editBookForm.publicationDate,
        availableQuantity: this.editBookForm.availableQuantity,
        totalQuantity: this.editBookForm.totalQuantity,
        category: this.editBookForm.category
      };
      await this.authService.updateBook(id, payload);
      this.toastService.success('Book updated');
      const books = await this.authService.getAllBooks();
      this.books = books;
      this.totalBooks = this.books.length;
      this.editBookModalOpen = false;
      this.editBookForm = null;
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to update book');
    }
  }

  closeEditBook(): void {
    this.editBookModalOpen = false;
    this.editBookForm = null;
  }

  openDeleteBook(bookId: number): void {
    this.deleteBookConfirmOpen = true;
    this.deleteBookTargetId = bookId;
  }

  async confirmDeleteBook(): Promise<void> {
    if (!this.deleteBookTargetId) return;
    try {
      await this.authService.deleteBook(this.deleteBookTargetId);
      this.toastService.success('Book deleted');
      const books = await this.authService.getAllBooks();
      this.books = books;
      this.totalBooks = this.books.length;
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to delete book');
    }
    this.deleteBookConfirmOpen = false;
    this.deleteBookTargetId = null;
  }

  closeDeleteBook(): void {
    this.deleteBookConfirmOpen = false;
    this.deleteBookTargetId = null;
  }

  private getFilteredMembers(): any[] {
    const search = this.memberSearch.trim().toLowerCase();

    return this.members.filter(member => {
      const matchesSearch = !search || [member.firstName, member.lastName, member.email, member.phone, member.membershipNumber]
        .join(' ')
        .toLowerCase()
        .includes(search);

      const matchesFilter = this.memberFilter === 'all'
        || (this.memberFilter === 'active' && member.isActive)
        || (this.memberFilter === 'inactive' && !member.isActive);

      return matchesSearch && matchesFilter;
    });
  }

  private getFilteredBooks(): any[] {
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

  private getBookPages(): number {
    return Math.max(1, Math.ceil(this.getFilteredBooks().length / this.pageSize));
  }

  private getVisibleBooks(): any[] {
    const start = (this.bookPage - 1) * this.pageSize;
    return this.getFilteredBooks().slice(start, start + this.pageSize);
  }

  nextBookPage(): void {
    const totalPages = this.getBookPages();
    if (this.bookPage < totalPages) {
      this.bookPage += 1;
    }
  }

  previousBookPage(): void {
    if (this.bookPage > 1) {
      this.bookPage -= 1;
    }
  }

  private getMemberPages(): number {
    return Math.max(1, Math.ceil(this.getFilteredMembers().length / this.pageSize));
  }

  private getVisibleMembers(): any[] {
    const start = (this.memberPage - 1) * this.pageSize;
    return this.getFilteredMembers().slice(start, start + this.pageSize);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(page: string): void {
    (window as any).navigateToPage(page);
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  render(): string {
    const visibleMembers = this.getVisibleMembers();
    const totalMemberPages = this.getMemberPages();
    const visibleBooks = this.getVisibleBooks();
    const totalBookPages = this.getBookPages();

    // Prepare section-specific HTML so only the chosen section renders
    let sectionHtml = '';

    if (this.currentSection === 'dashboard') {
      sectionHtml = `
              <div class="content-header">
                <h1>Admin Dashboard</h1>
                <p class="subtitle">Users from the database</p>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon users">👥</div>
                  <div class="stat-info">
                    <h3>Total Users</h3>
                    <p class="stat-value">${this.totalUsers}</p>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon books">📚</div>
                  <div class="stat-info">
                    <h3>Total Books</h3>
                    <p class="stat-value">${this.totalBooks}</p>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon transactions">💳</div>
                  <div class="stat-info">
                    <h3>Transactions</h3>
                    <p class="stat-value">${this.totalTransactions}</p>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon reservations">🔖</div>
                  <div class="stat-info">
                    <h3>Reservations</h3>
                    <p class="stat-value">${this.totalReservations}</p>
                  </div>
                </div>
              </div>

              <div class="quick-actions">
                <h2>Quick Actions</h2>
                <div class="actions-grid">
                  <button class="action-btn" onclick="window.navigateToAdminPage('users')">
                    <span class="btn-icon">👥</span>
                    <span>Open Users</span>
                  </button>
                  <button class="action-btn" onclick="window.navigateToAdminPage('dashboard')">
                    <span class="btn-icon">📊</span>
                    <span>Refresh Overview</span>
                  </button>
                </div>
              </div>
      `;
    } else if (this.currentSection === 'users') {
      sectionHtml = `
              <div class="members-toolbar">
                <input
                  class="members-search"
                  type="text"
                  placeholder="Search name, email, phone, membership number"
                  value="${this.memberSearch}"
                  oninput="window.updateAdminMemberSearch(this.value)"
                >
                <select class="members-filter" onchange="window.updateAdminMemberFilter(this.value)">
                  <option value="all" ${this.memberFilter === 'all' ? 'selected' : ''}>All members</option>
                  <option value="active" ${this.memberFilter === 'active' ? 'selected' : ''}>Active</option>
                  <option value="inactive" ${this.memberFilter === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>

              <div class="members-layout">
                <section class="members-panel">
                  <div class="members-panel-header">
                    <h2>Member List</h2>
                    <span>${this.getFilteredMembers().length} results</span>
                  </div>
                  <div class="members-list">
                    ${visibleMembers.length ? visibleMembers.map(member => `
                      <div class="member-row">
                        <div class="member-main">
                          <strong>${member.firstName} ${member.lastName}</strong>
                          <span>${member.email}</span>
                          <small>${member.phone} · ${member.membershipNumber}</small>
                        </div>
                        <div class="member-meta">
                          <span class="member-type">${member.memberType}</span>
                          <span class="member-status ${member.isActive ? 'active' : 'inactive'}">${member.isActive ? 'Active' : 'Inactive'}</span>
                          <div class="member-actions">
                            <button class="action-icon" title="Edit member" aria-label="Edit member" onclick="window.openAdminEditMember(${member.memberId})">✎</button>
                          </div>
                        </div>
                      </div>
                    `).join('') : '<div class="empty-state">No members match your search.</div>'}
                  </div>
                  <div class="members-pagination">
                    <button class="pagination-btn" onclick="window.adminPreviousMemberPage()" ${this.memberPage === 1 ? 'disabled' : ''}>Prev</button>
                    <span>Page ${this.memberPage} of ${totalMemberPages}</span>
                    <button class="pagination-btn" onclick="window.adminNextMemberPage()" ${this.memberPage >= totalMemberPages ? 'disabled' : ''}>Next</button>
                  </div>
                </section>

                <section class="members-panel register-panel">
                  <div class="members-panel-header">
                    <h2>Register Member</h2>
                  </div>
                  <div class="register-form">
                    <input class="register-input" type="text" placeholder="First name" value="${this.registerMemberForm.firstName}" oninput="window.updateAdminRegisterField('firstName', this.value)">
                    <input class="register-input" type="text" placeholder="Last name" value="${this.registerMemberForm.lastName}" oninput="window.updateAdminRegisterField('lastName', this.value)">
                    <input class="register-input" type="email" placeholder="Email" value="${this.registerMemberForm.email}" oninput="window.updateAdminRegisterField('email', this.value)">
                    <input class="register-input" type="text" placeholder="Phone" value="${this.registerMemberForm.phone}" oninput="window.updateAdminRegisterField('phone', this.value)">
                    <input class="register-input" type="password" placeholder="Password" value="${this.registerMemberForm.password}" oninput="window.updateAdminRegisterField('password', this.value)">
                    <button class="register-btn" onclick="window.submitAdminRegisterMember()">Register Member</button>
                  </div>
                </section>
              </div>
      `;
    } else if (this.currentSection === 'books') {
      sectionHtml = `
              <div class="members-layout">
                <section class="members-panel">
                  <div class="members-panel-header">
                    <h2>Book List</h2>
                    <span>${this.getFilteredBooks().length} results</span>
                  </div>
                  <div class="members-toolbar">
                    <input
                      class="members-search"
                      type="text"
                      placeholder="Search title, author, isbn, category"
                      value="${this.bookSearch}"
                      oninput="window.updateAdminBookSearch(this.value)"
                    >
                    <select class="members-filter" onchange="window.updateAdminBookFilter(this.value)">
                      <option value="all" ${this.bookFilter === 'all' ? 'selected' : ''}>All books</option>
                      <option value="available" ${this.bookFilter === 'available' ? 'selected' : ''}>Available</option>
                      <option value="unavailable" ${this.bookFilter === 'unavailable' ? 'selected' : ''}>Unavailable</option>
                    </select>
                  </div>
                  <div class="members-list">
                    ${visibleBooks.length ? visibleBooks.map(book => `
                      <div class="member-row">
                        <div class="member-main">
                          <strong>${book.title}</strong>
                          <span>${book.author}</span>
                          <small>${book.isbn} · ${book.category}</small>
                        </div>
                        <div class="member-meta">
                          <span class="member-status ${book.isAvailable ? 'active' : 'inactive'}">${book.isAvailable ? 'Available' : 'Unavailable'}</span>
                          <small>Qty: ${book.availableQuantity}/${book.totalQuantity}</small>
                          <div class="member-actions">
                            <button class="action-icon" title="Edit book" aria-label="Edit book" onclick="window.openAdminEditBook(${book.bookId})">✎</button>
                            <button class="action-icon danger" title="Delete book" aria-label="Delete book" onclick="window.openAdminDeleteBook(${book.bookId})">🗑</button>
                          </div>
                        </div>
                      </div>
                    `).join('') : '<div class="empty-state">No books match your search.</div>'}
                  </div>
                  <div class="members-pagination">
                    <button class="pagination-btn" onclick="window.adminPreviousBookPage()" ${this.bookPage === 1 ? 'disabled' : ''}>Prev</button>
                    <span>Page ${this.bookPage} of ${totalBookPages}</span>
                    <button class="pagination-btn" onclick="window.adminNextBookPage()" ${this.bookPage >= totalBookPages ? 'disabled' : ''}>Next</button>
                  </div>
                </section>

                <section class="members-panel register-panel">
                  <div class="members-panel-header">
                    <h2>Add Book</h2>
                  </div>
                  <div class="register-form">
                    <input class="register-input" type="text" placeholder="Title" value="${this.registerBookForm.title}" oninput="window.updateAdminBookField('title', this.value)">
                    <input class="register-input" type="text" placeholder="Author" value="${this.registerBookForm.author}" oninput="window.updateAdminBookField('author', this.value)">
                    <input class="register-input" type="text" placeholder="ISBN" value="${this.registerBookForm.isbn}" oninput="window.updateAdminBookField('isbn', this.value)">
                    <input class="register-input" type="date" placeholder="Publication Date" value="${this.registerBookForm.publicationDate}" oninput="window.updateAdminBookField('publicationDate', this.value)">
                    <input class="register-input" type="number" min="1" placeholder="Total Quantity" value="${this.registerBookForm.totalQuantity}" oninput="window.updateAdminBookField('totalQuantity', this.value)">
                    <input class="register-input" type="text" placeholder="Category" value="${this.registerBookForm.category}" oninput="window.updateAdminBookField('category', this.value)">
                    <button class="register-btn" onclick="window.submitAdminRegisterBook()">Add Book</button>
                  </div>
                </section>
              </div>
      `;
    }

    return `
      <div class="admin-container">
        <!-- Sidebar -->
        <aside class="sidebar ${this.sidebarOpen ? 'open' : ''}">
          <div class="sidebar-header">
            <h2>📚 Library Admin</h2>
            <button class="sidebar-close" onclick="window.toggleAdminSidebar()">✕</button>
          </div>

          <nav class="sidebar-nav">
            <a href="#" onclick="window.navigateToAdminPage('dashboard')" class="nav-item ${this.currentSection === 'dashboard' ? 'active' : ''}">
              <span class="icon">📊</span>
              <span class="label">Dashboard</span>
            </a>
            <a href="#" onclick="window.navigateToAdminPage('users')" class="nav-item ${this.currentSection === 'users' ? 'active' : ''}">
              <span class="icon">👥</span>
              <span class="label">Users</span>
            </a>
            <a href="#" onclick="window.navigateToAdminPage('books')" class="nav-item ${this.currentSection === 'books' ? 'active' : ''}">
              <span class="icon">📚</span>
              <span class="label">Books</span>
            </a>
            <a href="#" onclick="window.navigateToAdminPage('reservations')" class="nav-item">
              <span class="icon">🔖</span>
              <span class="label">Reservations</span>
            </a>
            <a href="#" onclick="window.navigateToAdminPage('transactions')" class="nav-item">
              <span class="icon">💳</span>
              <span class="label">Transactions</span>
            </a>
            <hr class="nav-divider">
            <a href="#" onclick="window.navigateToAdminPage('profile')" class="nav-item">
              <span class="icon">⚙️</span>
              <span class="label">Profile Settings</span>
            </a>
            <a href="#" onclick="window.logoutAdmin()" class="nav-item logout">
              <span class="icon">🚪</span>
              <span class="label">Logout</span>
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="admin-main">
          <!-- Top Bar -->
          <div class="admin-topbar">
            <button class="menu-toggle" onclick="window.toggleAdminSidebar()">☰</button>
            <div class="topbar-right">
              <span class="user-name">Welcome, ${this.currentUser?.firstName || 'Admin'}</span>
              <div class="user-avatar">${this.currentUser?.firstName?.charAt(0) || 'A'}</div>
            </div>
          </div>

          <!-- Admin Content -->
          <div class="admin-content">
            ${sectionHtml}

            ${this.editMemberModalOpen && this.editMemberForm ? `
              <div class="modal-overlay">
                <div class="modal">
                  <div class="modal-header">
                    <div>
                      <span class="modal-kicker">Update user</span>
                      <h3>Edit Member</h3>
                    </div>
                    <button class="modal-close" aria-label="Close member editor" onclick="window.closeAdminEditMember()">✕</button>
                  </div>
                  <div class="modal-grid">
                    <label>
                      First name
                      <input type="text" value="${this.editMemberForm.firstName}" oninput="window.updateAdminEditMemberField('firstName', this.value)" placeholder="First name">
                    </label>
                    <label>
                      Last name
                      <input type="text" value="${this.editMemberForm.lastName}" oninput="window.updateAdminEditMemberField('lastName', this.value)" placeholder="Last name">
                    </label>
                    <label class="modal-span-2">
                      Email
                      <input type="email" value="${this.editMemberForm.email}" oninput="window.updateAdminEditMemberField('email', this.value)" placeholder="Email">
                    </label>
                    <label>
                      Phone
                      <input type="text" value="${this.editMemberForm.phone}" oninput="window.updateAdminEditMemberField('phone', this.value)" placeholder="Phone">
                    </label>
                    <label>
                      Active
                      <select onchange="window.updateAdminEditMemberField('isActive', this.value)"><option value="true" ${this.editMemberForm.isActive ? 'selected' : ''}>Yes</option><option value="false" ${!this.editMemberForm.isActive ? 'selected' : ''}>No</option></select>
                    </label>
                  </div>
                  <div class="modal-actions">
                    <button class="modal-primary" onclick="window.submitAdminEditMember()">Save changes</button>
                    <button class="modal-secondary" onclick="window.closeAdminEditMember()">Cancel</button>
                  </div>
                </div>
              </div>
            ` : ''}

            ${this.editBookModalOpen && this.editBookForm ? `
              <div class="modal-overlay">
                <div class="modal">
                  <div class="modal-header">
                    <div>
                      <span class="modal-kicker">Update book</span>
                      <h3>Edit Book</h3>
                    </div>
                    <button class="modal-close" aria-label="Close book editor" onclick="window.closeAdminEditBook()">✕</button>
                  </div>
                  <div class="modal-grid">
                    <label class="modal-span-2">
                      Title
                      <input type="text" value="${this.editBookForm.title}" oninput="window.updateAdminEditBookField('title', this.value)" placeholder="Title">
                    </label>
                    <label class="modal-span-2">
                      Author
                      <input type="text" value="${this.editBookForm.author}" oninput="window.updateAdminEditBookField('author', this.value)" placeholder="Author">
                    </label>
                    <label class="modal-span-2">
                      ISBN
                      <input type="text" value="${this.editBookForm.isbn}" oninput="window.updateAdminEditBookField('isbn', this.value)" placeholder="ISBN">
                    </label>
                    <label>
                      Publication date
                      <input type="date" value="${this.editBookForm.publicationDate ? this.editBookForm.publicationDate.split('T')[0] : ''}" oninput="window.updateAdminEditBookField('publicationDate', this.value)" placeholder="Publication Date">
                    </label>
                    <label>
                      Total quantity
                      <input type="number" value="${this.editBookForm.totalQuantity}" min="1" oninput="window.updateAdminEditBookField('totalQuantity', this.value)" placeholder="Total Quantity">
                    </label>
                    <label class="modal-span-2">
                      Category
                      <input type="text" value="${this.editBookForm.category}" oninput="window.updateAdminEditBookField('category', this.value)" placeholder="Category">
                    </label>
                  </div>
                  <div class="modal-actions">
                    <button class="modal-primary" onclick="window.submitAdminEditBook()">Save changes</button>
                    <button class="modal-secondary" onclick="window.closeAdminEditBook()">Cancel</button>
                  </div>
                </div>
              </div>
            ` : ''}

            ${this.deleteBookConfirmOpen && this.deleteBookTargetId ? `
              <div class="modal-overlay">
                <div class="modal">
                  <div class="modal-header">
                    <div>
                      <span class="modal-kicker danger">Danger zone</span>
                      <h3>Delete Book</h3>
                    </div>
                    <button class="modal-close" aria-label="Close delete confirmation" onclick="window.closeAdminDeleteBook()">✕</button>
                  </div>
                  <p class="modal-copy">Are you sure you want to delete this book? This action cannot be undone.</p>
                  <div class="modal-actions">
                    <button class="modal-danger" onclick="window.confirmAdminDeleteBook()">Delete book</button>
                    <button class="modal-secondary" onclick="window.closeAdminDeleteBook()">Cancel</button>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </main>
      </div>
    `;
  }
}