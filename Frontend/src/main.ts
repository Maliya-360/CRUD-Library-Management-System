import { ToastService } from './app/services/toast.service';
import { AuthService } from './app/services/auth.service';
import { LoginComponent } from './app/pages/login/login.component';
import { RegisterComponent } from './app/pages/register/register.component';
import { DashboardComponent } from './app/pages/dashboard';
import { AdminDashboardComponent } from './app/pages/admin/admin-dashboard.component';
import './app/styles/admin.css';
import './styles.css';

const toastService = new ToastService();
const authService = new AuthService(toastService);
const loginComponent = new LoginComponent(authService, toastService);
const registerComponent = new RegisterComponent(authService, toastService);
const dashboardComponent = new DashboardComponent(authService, toastService);
const adminDashboardComponent = new AdminDashboardComponent(authService, toastService);

function rerenderDashboardApp(preserveSearchFocus: boolean = false): void {
  const app = document.getElementById('app');
  if (!app) return;

  const activeElement = preserveSearchFocus ? document.activeElement as HTMLInputElement | HTMLSelectElement | null : null;
  const focusKey = activeElement?.getAttribute('data-dashboard-search');
  const selectionStart = preserveSearchFocus && activeElement instanceof HTMLInputElement ? activeElement.selectionStart : null;
  const selectionEnd = preserveSearchFocus && activeElement instanceof HTMLInputElement ? activeElement.selectionEnd : null;

  app.innerHTML = dashboardComponent.render();

  if (!focusKey) return;

  const restored = app.querySelector(`[data-dashboard-search="${focusKey}"]`) as HTMLInputElement | HTMLSelectElement | null;
  restored?.focus();

  if (restored instanceof HTMLInputElement && selectionStart !== null && selectionEnd !== null) {
    restored.setSelectionRange(selectionStart, selectionEnd);
  }
}

function rerenderAdminApp(preserveSearchFocus: boolean = false): void {
  const app = document.getElementById('app');
  if (!app) return;

  const activeElement = preserveSearchFocus ? document.activeElement as HTMLInputElement | HTMLSelectElement | null : null;
  const focusKey = activeElement?.getAttribute('data-admin-search');
  const selectionStart = preserveSearchFocus && activeElement instanceof HTMLInputElement ? activeElement.selectionStart : null;
  const selectionEnd = preserveSearchFocus && activeElement instanceof HTMLInputElement ? activeElement.selectionEnd : null;

  app.innerHTML = adminDashboardComponent.render();

  if (!focusKey) return;

  const restored = app.querySelector(`[data-admin-search="${focusKey}"]`) as HTMLInputElement | HTMLSelectElement | null;
  restored?.focus();

  if (restored instanceof HTMLInputElement && selectionStart !== null && selectionEnd !== null) {
    restored.setSelectionRange(selectionStart, selectionEnd);
  }
}

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
      if (!(await dashboardComponent.initialize())) {
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

(window as any).toggleDashboardProfileModal = function() {
  (dashboardComponent as any).toggleProfileModal();
  rerenderDashboardApp();
};

(window as any).updateDashboardBookSearch = function(value: string) {
  (dashboardComponent as any).updateBookSearch(value);
  rerenderDashboardApp(true);
};

(window as any).updateDashboardBookFilter = function(value: string) {
  (dashboardComponent as any).updateBookFilter(value);
  rerenderDashboardApp();
};

(window as any).updateDashboardProfileField = function(field: string, value: string) {
  (dashboardComponent as any).updateProfileField(field, value);
};

(window as any).updateDashboardPasswordField = function(field: string, value: string) {
  (dashboardComponent as any).updatePasswordField(field, value);
};

(window as any).submitDashboardProfile = async function() {
  await (dashboardComponent as any).saveProfile();
  rerenderDashboardApp();
};

(window as any).submitDashboardPassword = async function() {
  await (dashboardComponent as any).changePassword();
  rerenderDashboardApp();
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

(window as any).toggleAdminSidebar = function() {
  const sidebar = document.querySelector('.sidebar');
  sidebar?.classList.toggle('open');
};

(window as any).navigateToAdminPage = function(page: string) {
  if (page === 'dashboard' || page === 'users' || page === 'books' || page === 'transactions' || page === 'reservations') {
    (adminDashboardComponent as any).setSection(page as any);
    rerenderAdminApp();
    return;
  }

  console.log('Navigate to:', page);
};

(window as any).updateAdminMemberSearch = function(value: string) {
  (adminDashboardComponent as any).updateMemberSearch(value);
  rerenderAdminApp(true);
};

(window as any).updateAdminMemberFilter = function(value: string) {
  (adminDashboardComponent as any).updateMemberFilter(value);
  rerenderAdminApp();
};

(window as any).adminNextMemberPage = function() {
  (adminDashboardComponent as any).nextMemberPage();
  rerenderAdminApp();
};

(window as any).adminPreviousMemberPage = function() {
  (adminDashboardComponent as any).previousMemberPage();
  rerenderAdminApp();
};

(window as any).updateAdminRegisterField = function(field: string, value: string) {
  (adminDashboardComponent as any).updateRegisterField(field, value);
};

(window as any).submitAdminRegisterMember = async function() {
  await (adminDashboardComponent as any).registerMember();
  rerenderAdminApp();
};

(window as any).updateAdminBookSearch = function(value: string) {
  (adminDashboardComponent as any).updateBookSearch(value);
  rerenderAdminApp(true);
};

(window as any).updateAdminBookFilter = function(value: string) {
  (adminDashboardComponent as any).updateBookFilter(value);
  rerenderAdminApp();
};

(window as any).adminNextBookPage = function() {
  (adminDashboardComponent as any).nextBookPage();
  rerenderAdminApp();
};

(window as any).adminPreviousBookPage = function() {
  (adminDashboardComponent as any).previousBookPage();
  rerenderAdminApp();
};

(window as any).updateAdminBookField = function(field: string, value: string) {
  (adminDashboardComponent as any).updateBookField(field, value);
};

(window as any).updateAdminTransactionSearch = function(value: string) {
  (adminDashboardComponent as any).updateTransactionSearch(value);
  rerenderAdminApp(true);
};

(window as any).updateAdminTransactionFilter = function(value: string) {
  (adminDashboardComponent as any).updateTransactionFilter(value);
  rerenderAdminApp();
};

(window as any).adminNextTransactionPage = function() {
  (adminDashboardComponent as any).nextTransactionPage();
  rerenderAdminApp();
};

(window as any).adminPreviousTransactionPage = function() {
  (adminDashboardComponent as any).previousTransactionPage();
  rerenderAdminApp();
};

(window as any).updateAdminIssueTransactionField = function(field: string, value: string) {
  (adminDashboardComponent as any).updateIssueTransactionField(field, value);
};

(window as any).submitAdminIssueTransaction = async function() {
  await (adminDashboardComponent as any).submitIssueTransaction();
  rerenderAdminApp();
};

(window as any).openAdminReturnTransaction = function(transactionId: number) {
  (adminDashboardComponent as any).openReturnTransaction(transactionId);
  rerenderAdminApp();
};

(window as any).updateAdminReturnTransactionField = function(field: string, value: string | boolean) {
  (adminDashboardComponent as any).updateReturnTransactionField(field, value);
};

(window as any).submitAdminReturnTransaction = async function() {
  await (adminDashboardComponent as any).submitReturnTransaction();
  rerenderAdminApp();
};

(window as any).updateAdminReservationSearch = function(value: string) {
  (adminDashboardComponent as any).updateReservationSearch(value);
  rerenderAdminApp(true);
};

(window as any).updateAdminReservationFilter = function(value: string) {
  (adminDashboardComponent as any).updateReservationFilter(value);
  rerenderAdminApp();
};

(window as any).adminNextReservationPage = function() {
  (adminDashboardComponent as any).nextReservationPage();
  rerenderAdminApp();
};

(window as any).adminPreviousReservationPage = function() {
  (adminDashboardComponent as any).previousReservationPage();
  rerenderAdminApp();
};

(window as any).updateAdminReservationField = function(field: string, value: string) {
  (adminDashboardComponent as any).updateReservationField(field, value);
};

(window as any).submitAdminCreateReservation = async function() {
  await (adminDashboardComponent as any).createReservation();
  rerenderAdminApp();
};

(window as any).cancelAdminReservation = async function(reservationId: number) {
  await (adminDashboardComponent as any).cancelReservation(reservationId);
  rerenderAdminApp();
};

(window as any).submitAdminRegisterBook = async function() {
  await (adminDashboardComponent as any).registerBook();
  rerenderAdminApp();
};

(window as any).openAdminEditMember = function(memberId: number) {
  (adminDashboardComponent as any).openEditMember(memberId);
  rerenderAdminApp();
};

(window as any).updateAdminEditMemberField = function(field: string, value: string) {
  (adminDashboardComponent as any).updateEditMemberField(field, value);
};

(window as any).submitAdminEditMember = async function() {
  await (adminDashboardComponent as any).submitEditMember();
  rerenderAdminApp();
};

(window as any).closeAdminEditMember = function() {
  (adminDashboardComponent as any).closeEditMember();
  rerenderAdminApp();
};

(window as any).openAdminEditBook = function(bookId: number) {
  (adminDashboardComponent as any).openEditBook(bookId);
  rerenderAdminApp();
};

(window as any).updateAdminEditBookField = function(field: string, value: string) {
  (adminDashboardComponent as any).updateEditBookField(field, value);
};

(window as any).submitAdminEditBook = async function() {
  await (adminDashboardComponent as any).submitEditBook();
  rerenderAdminApp();
};

(window as any).closeAdminEditBook = function() {
  (adminDashboardComponent as any).closeEditBook();
  rerenderAdminApp();
};

(window as any).openAdminDeleteBook = function(bookId: number) {
  (adminDashboardComponent as any).openDeleteBook(bookId);
  rerenderAdminApp();
};

(window as any).confirmAdminDeleteBook = async function() {
  await (adminDashboardComponent as any).confirmDeleteBook();
  rerenderAdminApp();
};

(window as any).closeAdminDeleteBook = function() {
  (adminDashboardComponent as any).closeDeleteBook();
  rerenderAdminApp();
};

(window as any).logoutAdmin = function() {
  authService.logout();
  toastService.success('Logged out successfully!');
  window.location.href = '/login';
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