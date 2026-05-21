import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export class LoginComponent {
  private authService: AuthService;
  private toastService: ToastService;
  private email: string = '';
  private password: string = '';
  private loading: boolean = false;

  constructor(authService: AuthService, toastService: ToastService) {
    this.authService = authService;
    this.toastService = toastService;
  }

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      this.toastService.warning('Please fill in all fields');
      return;
    }

    this.loading = true;
    try {
      const response = await this.authService.login(this.email, this.password);
      this.authService.setUser(response, response.token);
      this.toastService.success('Login successful!');
      window.navigateTo('dashboard');
    } catch (error: any) {
      this.toastService.error(error.message);
    } finally {
      this.loading = false;
    }
  }

  goToRegister(): void {
    window.navigateTo('register');
  }

  render(): string {
    return `
      <div class="login-container">
        <div class="login-card">
          <h2>📚 Library Management System</h2>
          <h3>Login</h3>

          <form id="loginForm">
            <div class="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                id="email"
                placeholder="Enter your email"
                required
              >
            </div>

            <div class="form-group">
              <label>Password:</label>
              <input 
                type="password" 
                id="password"
                placeholder="Enter your password"
                required
              >
            </div>

            <button type="submit" id="loginBtn">Login</button>
          </form>

          <p class="register-link">
            Don't have an account? 
            <a href="#" onclick="window.navigateTo('register'); return false;">Register here</a>
          </p>
        </div>
      </div>

      <style>
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-card {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
        }

        .login-card h2 {
          text-align: center;
          color: #667eea;
          margin-bottom: 10px;
        }

        .login-card h3 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: bold;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 5px rgba(102, 126, 234, 0.1);
        }

        button {
          width: 100%;
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }

        button:hover {
          background: #764ba2;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .register-link {
          text-align: center;
          margin-top: 20px;
          color: #666;
        }

        .register-link a {
          color: #667eea;
          cursor: pointer;
          font-weight: bold;
          text-decoration: none;
        }

        .register-link a:hover {
          text-decoration: underline;
        }
      </style>
    `;
  }
}