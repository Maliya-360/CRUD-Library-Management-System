import { AuthService, RegisterRequest } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export class RegisterComponent {
  private authService: AuthService;
  private toastService: ToastService;
  private firstName: string = '';
  private lastName: string = '';
  private email: string = '';
  private phone: string = '';
  private password: string = '';
  private confirmPassword: string = '';
  private loading: boolean = false;

  constructor(authService: AuthService, toastService: ToastService) {
    this.authService = authService;
    this.toastService = toastService;
  }

  async register(): Promise<void> {
    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.password) {
      this.toastService.warning('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    this.loading = true;
    try {
      const data: RegisterRequest = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        password: this.password
      };
      await this.authService.register(data);
      this.toastService.success('Registration successful! Please login.');
      window.navigateTo('login');
    } catch (error: any) {
      this.toastService.error(error.message);
    } finally {
      this.loading = false;
    }
  }

  goToLogin(): void {
    window.navigateTo('login');
  }

  render(): string {
    return `
      <div class="register-container">
        <div class="register-card">
          <h2>📚 Library Management System</h2>
          <h3>Register</h3>

          <form id="registerForm">
            <div class="form-group">
              <label>First Name:</label>
              <input type="text" id="firstName" placeholder="Enter first name" required>
            </div>

            <div class="form-group">
              <label>Last Name:</label>
              <input type="text" id="lastName" placeholder="Enter last name" required>
            </div>

            <div class="form-group">
              <label>Email:</label>
              <input type="email" id="email" placeholder="Enter your email" required>
            </div>

            <div class="form-group">
              <label>Phone:</label>
              <input type="tel" id="phone" placeholder="Enter phone number" required>
            </div>

            <div class="form-group">
              <label>Password:</label>
              <input type="password" id="password" placeholder="Enter password" required>
            </div>

            <div class="form-group">
              <label>Confirm Password:</label>
              <input type="password" id="confirmPassword" placeholder="Confirm password" required>
            </div>

            <button type="submit" id="registerBtn">Register</button>
          </form>

          <p class="login-link">
            Already have an account? 
            <a href="#" onclick="window.navigateTo('login'); return false;">Login here</a>
          </p>
        </div>
      </div>

      <style>
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .register-card {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 450px;
        }

        .register-card h2 {
          text-align: center;
          color: #667eea;
          margin-bottom: 10px;
        }

        .register-card h3 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: #333;
          font-weight: bold;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
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
          margin-top: 10px;
        }

        button:hover {
          background: #764ba2;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-link {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 14px;
        }

        .login-link a {
          color: #667eea;
          cursor: pointer;
          font-weight: bold;
          text-decoration: none;
        }

        .login-link a:hover {
          text-decoration: underline;
        }
      </style>
    `;
  }
}