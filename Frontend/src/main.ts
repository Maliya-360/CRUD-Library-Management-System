import { ToastService } from './app/services/toast.service';
import { AuthService } from './app/services/auth.service';
import { LoginComponent } from './app/pages/login/login.component';
import { RegisterComponent } from './app/pages/register/register.component';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import { AdminDashboardComponent } from './app/pages/admin/admin-dashboard.component';
import './app/styles/admin.css';
import './styles.css';

const toastService = new ToastService();
const authService = new AuthService(toastService);
const loginComponent = new LoginComponent(authService, toastService);
const registerComponent = new RegisterComponent(authService, toastService);
const dashboardComponent = new DashboardComponent(authService, toastService);
const adminDashboardComponent = new AdminDashboardComponent(authService, toastService);

(window as any).navigateTo = async (page: string) => {
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
    case 'admin-dashboard':
      if (!authService.isLoggedIn()) {
        window.navigateTo('login');
        return;
      }
      if (!(await adminDashboardComponent.initialize())) {
        return;
      }
      app.innerHTML = adminDashboardComponent.render();
      break;
    default:
      window.navigateTo('login');
  }
  window.history.pushState({}, '', `/${page}`);
};

(window as any).logout = () => {
  authService.logout();
  toastService.success('Logged out successfully!');
  window.navigateTo('login');
};

(window as any).toggleAdminSidebar = function() {
  const sidebar = document.querySelector('.sidebar');
  sidebar?.classList.toggle('open');
};

(window as any).navigateToAdminPage = function(page: string) {
  if (page === 'dashboard' || page === 'users') {
    (adminDashboardComponent as any).setSection(page);
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = adminDashboardComponent.render();
    return;
  }

  console.log('Navigate to:', page);
};

(window as any).updateAdminMemberSearch = function(value: string) {
  (adminDashboardComponent as any).updateMemberSearch(value);
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = adminDashboardComponent.render();
};

(window as any).updateAdminMemberFilter = function(value: string) {
  (adminDashboardComponent as any).updateMemberFilter(value);
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = adminDashboardComponent.render();
};

(window as any).adminNextMemberPage = function() {
  (adminDashboardComponent as any).nextMemberPage();
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = adminDashboardComponent.render();
};

(window as any).adminPreviousMemberPage = function() {
  (adminDashboardComponent as any).previousMemberPage();
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = adminDashboardComponent.render();
};

(window as any).updateAdminRegisterField = function(field: string, value: string) {
  (adminDashboardComponent as any).updateRegisterField(field, value);
};

(window as any).submitAdminRegisterMember = async function() {
  await (adminDashboardComponent as any).registerMember();
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = adminDashboardComponent.render();
};

(window as any).logoutAdmin = function() {
  authService.logout();
  toastService.success('Logged out successfully!');
  window.location.href = '/login';
};

(window as any).updateAdminProfile = function(event: Event) {
  event.preventDefault();
  toastService.success('Profile updated successfully!');
};

(window as any).updateAdminFormField = function(field: string, value: string) {
  console.log(`Field: ${field}, Value: ${value}`);
};

(window as any).changeAdminPassword = function(event: Event) {
  event.preventDefault();
  toastService.success('Password changed successfully!');
};

(window as any).updateAdminPasswordField = function(field: string, value: string) {
  console.log(`Password Field: ${field}, Value: ${value}`);
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
        
        if (response.memberType === 'Admin') {
          window.navigateTo('admin-dashboard');
        } else {
          window.navigateTo('dashboard');
        }
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

      if (password.length < 8) {
        toastService.error('Password must be at least 8 characters');
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
  const currentPath = window.location.pathname.replace(/^\//, '');

  if (currentPath === 'dashboard' || currentPath === 'admin-dashboard') {
    void window.navigateTo(currentPath);
    return;
  }

  void window.navigateTo('login');
});