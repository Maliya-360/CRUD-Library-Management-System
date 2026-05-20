import { ToastService } from './app/services/toast.service';
import { AuthService } from './app/services/auth.service';
import { LoginComponent } from './app/pages/login/login.component';
import { RegisterComponent } from './app/pages/register/register.component';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import './styles.css';

const toastService = new ToastService();
const authService = new AuthService(toastService);
const loginComponent = new LoginComponent(authService, toastService);
const registerComponent = new RegisterComponent(authService, toastService);
const dashboardComponent = new DashboardComponent(authService, toastService);

(window as any).navigateTo = (page: string) => {
  const app = document.getElementById('app');
  if (!app) return;

  switch (page) {
    case 'login':
      app.innerHTML = loginComponent.render();
      attachLoginListeners();
      break;
    case 'register':
      app.innerHTML = registerComponent.render();
      attachRegisterListeners();
      break;
    case 'dashboard':
      if (!authService.isLoggedIn()) {
        window.navigateTo('login');
        return;
      }
      app.innerHTML = dashboardComponent.render();
      break;
    default:
      window.navigateTo('login');
  }
  window.history.pushState({}, '', `/${page}`);
};

(window as any).logout = () => {
  dashboardComponent.logout();
};

function attachLoginListeners(): void {
  const form = document.getElementById('loginForm') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const btn = document.getElementById('loginBtn') as HTMLButtonElement;

      btn.disabled = true;
      btn.textContent = 'Logging in...';

      try {
        const response = await authService.login(email, password);
        authService.setUser(response, response.token);
        toastService.success('Login successful!');
        window.navigateTo('dashboard');
      } catch (error: any) {
        toastService.error(error.message);
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    });
  }
}

function attachRegisterListeners(): void {
  const form = document.getElementById('registerForm') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
      const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const phone = (document.getElementById('phone') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
      const btn = document.getElementById('registerBtn') as HTMLButtonElement;

      if (password !== confirmPassword) {
        toastService.error('Passwords do not match');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Registering...';

      try {
        await authService.register({ firstName, lastName, email, phone, password });
        toastService.success('Registration successful! Please login.');
        window.navigateTo('login');
      } catch (error: any) {
        toastService.error(error.message);
        btn.disabled = false;
        btn.textContent = 'Register';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.navigateTo('login');
});