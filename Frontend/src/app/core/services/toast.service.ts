import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal<ToastMessage | null>(null);

  success(text: string): void {
    this.show('success', text);
  }

  error(text: string): void {
    this.show('error', text);
  }

  info(text: string): void {
    this.show('info', text);
  }

  warning(text: string): void {
    this.show('warning', text);
  }

  clear(): void {
    this.message.set(null);
  }

  private show(type: ToastType, text: string): void {
    this.message.set({ type, text });
    setTimeout(() => this.clear(), 3500);
  }
}
