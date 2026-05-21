import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export class AdminDashboardComponent {
  private authService: AuthService;
  private toastService: ToastService;
  private sidebarOpen: boolean = false;
  private currentUser: any = null;
  private stats = {
    totalUsers: 0,
    totalBooks: 0,
    activeTransactions: 0,
    pendingReservations: 0
  };

  constructor(authService: AuthService, toastService: ToastService) {
    this.authService = authService;
    this.toastService = toastService;
  }

  async initialize(): Promise<void> {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser?.MemberType !== 'Admin') {
      window.location.href = '/dashboard';
      return;
    }

    await this.loadStats();
  }

  private async loadStats(): Promise<void> {
    try {
      this.stats = {
        totalUsers: 45,
        totalBooks: 320,
        activeTransactions: 12,
        pendingReservations: 8
      };
    } catch (error: any) {
      this.toastService.error('Failed to load statistics');
    }
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
    return `
      <div class="admin-container">
        <!-- Sidebar -->
        <aside class="sidebar ${this.sidebarOpen ? 'open' : ''}">
          <div class="sidebar-header">
            <h2>📚 Library Admin</h2>
            <button class="sidebar-close" onclick="window.toggleAdminSidebar()">✕</button>
          </div>

          <nav class="sidebar-nav">
            <a href="#" onclick="window.navigateToAdminPage('dashboard')" class="nav-item active">
              <span class="icon">📊</span>
              <span class="label">Dashboard</span>
            </a>
            <a href="#" onclick="window.navigateToAdminPage('users')" class="nav-item">
              <span class="icon">👥</span>
              <span class="label">Users</span>
            </a>
            <a href="#" onclick="window.navigateToAdminPage('books')" class="nav-item">
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

          <!-- Dashboard Content -->
          <div class="admin-content">
            <div class="content-header">
              <h1>Dashboard Analytics</h1>
              <p class="subtitle">Welcome to Library Management System</p>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon users">👥</div>
                <div class="stat-info">
                  <h3>Total Users</h3>
                  <p class="stat-value">${this.stats.totalUsers}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon books">📚</div>
                <div class="stat-info">
                  <h3>Total Books</h3>
                  <p class="stat-value">${this.stats.totalBooks}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon transactions">💳</div>
                <div class="stat-info">
                  <h3>Active Transactions</h3>
                  <p class="stat-value">${this.stats.activeTransactions}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon reservations">🔖</div>
                <div class="stat-info">
                  <h3>Pending Reservations</h3>
                  <p class="stat-value">${this.stats.pendingReservations}</p>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
              <h2>Quick Actions</h2>
              <div class="actions-grid">
                <button class="action-btn" onclick="window.navigateToAdminPage('users')">
                  <span class="btn-icon">➕</span>
                  <span>Manage Users</span>
                </button>
                <button class="action-btn" onclick="window.navigateToAdminPage('books')">
                  <span class="btn-icon">📖</span>
                  <span>Manage Books</span>
                </button>
                <button class="action-btn" onclick="window.navigateToAdminPage('transactions')">
                  <span class="btn-icon">📋</span>
                  <span>View Transactions</span>
                </button>
                <button class="action-btn" onclick="window.navigateToAdminPage('reservations')">
                  <span class="btn-icon">🗂️</span>
                  <span>View Reservations</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }
}