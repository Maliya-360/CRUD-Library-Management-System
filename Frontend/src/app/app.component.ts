import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    @if (toast.message(); as msg) {
      <div class="app-toast" [class]="msg.type">{{ msg.text }}</div>
    }
    <router-outlet />
  `,
  styles: `
    .app-toast {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      padding: 14px 18px;
      border-radius: 8px;
      color: #fff;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 360px;
    }
    .app-toast.success { background: #16a34a; }
    .app-toast.error { background: #dc2626; }
    .app-toast.info { background: #2563eb; }
    .app-toast.warning { background: #d97706; }
  `
})
export class AppComponent {
  readonly toast = inject(ToastService);
}
