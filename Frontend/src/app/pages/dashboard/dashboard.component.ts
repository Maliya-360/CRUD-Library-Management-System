import { AuthService, LoginResponse } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export class DashboardComponent {
  private authService: AuthService;
  private toastService: ToastService;
  private user: LoginResponse | null = null;

  constructor(authService: AuthService, toastService: ToastService) {
    this.authService = authService;
    this.toastService = toastService;
    this.user = authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    window.navigateTo('login');
  }

  render(): string {
    return `
      <div class="dashboard-container">
        <nav class="navbar">
          <div class="nav-content">
            <h1>📚 Library Management</h1>
            <div class="user-info">
              <span>Welcome, ${this.user?.firstName}!</span>
              <button class="logout-btn" onclick="window.logout()">Logout</button>
            </div>
          </div>
        </nav>

        <div class="dashboard-content">
          <h2>Dashboard</h2>
          <p>Welcome to the Library Management System!</p>
          
          <div class="cards">
            <div class="card">
              <h3>📖 Books</h3>
              <p>Manage library books</p>
            </div>
            <div class="card">
              <h3>👥 Members</h3>
              <p>Manage members</p>
            </div>
            <div class="card">
              <h3>📝 Transactions</h3>
              <p>View transactions</p>
            </div>
            <div class="card">
              <h3>🔖 Reservations</h3>
              <p>Manage reservations</p>
            </div>
          </div>
        </div>
      </div>

      <style>
        .dashboard-container {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .navbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }

        .nav-content h1 {
          margin: 0;
          font-size: 24px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logout-btn {
          padding: 8px 16px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: transform 0.2s;
        }

        .logout-btn:hover {
          transform: scale(1.05);
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .dashboard-content h2 {
          color: #333;
          margin-bottom: 20px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }

        .card h3 {
          color: #667eea;
          margin-bottom: 10px;
        }

        .card p {
          color: #666;
          margin: 0;
        }
      </style>
    `;
  }
}