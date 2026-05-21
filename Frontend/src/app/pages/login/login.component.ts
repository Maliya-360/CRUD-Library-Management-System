import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.toast.warning('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    try {
      const response = await this.auth.login(this.email, this.password);
      this.auth.setUser(response, response.token);
      this.toast.success('Login successful!');

      if (response.memberType === 'Admin') {
        await this.router.navigate(['/admin-dashboard']);
      } else {
        await this.router.navigate(['/dashboard']);
      }
    } catch {
      this.toast.error('Invalid email or password');
    } finally {
      this.loading.set(false);
    }
  }
}
