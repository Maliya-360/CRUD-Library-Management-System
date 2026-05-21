import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.password) {
      this.toast.warning('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }

    if (this.password.length < 8) {
      this.toast.error('Password must be at least 8 characters');
      return;
    }

    this.loading.set(true);
    try {
      await this.auth.register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        password: this.password
      });
      this.toast.success('Registration successful! Please login.');
      await this.router.navigate(['/login']);
    } catch {
      this.toast.error('Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
