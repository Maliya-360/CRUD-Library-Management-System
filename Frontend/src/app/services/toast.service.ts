export class ToastService {
  success(message: string, title: string = 'Success'): void {
    this.showToast(message, 'success');
  }

  error(message: string, title: string = 'Error'): void {
    this.showToast(message, 'error');
  }

  info(message: string, title: string = 'Info'): void {
    this.showToast(message, 'info');
  }

  warning(message: string, title: string = 'Warning'): void {
    this.showToast(message, 'warning');
  }

  private showToast(message: string, type: string): void {
    const colors: { [key: string]: string } = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b'
    };

    (window as any).Toastify({
      text: message,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: colors[type],
      stopOnFocus: true
    }).showToast();
  }
}