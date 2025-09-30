import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  success(message: string): void {
    this.showNotification(message, 'success');
  }

  error(message: string): void {
    this.showNotification(message, 'error');
  }

  warning(message: string): void {
    this.showNotification(message, 'warning');
  }

  info(message: string): void {
    this.showNotification(message, 'info');
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    // Por enquanto usar alert simples, mas pode ser expandido para toasts
    const icon = this.getIcon(type);
    alert(`${icon} ${message}`);
    
    // TODO: Implementar toast notifications mais sofisticadas
    // Exemplo: usar bibliotecas como ngx-toastr ou criar componente customizado
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  }

  confirm(message: string): boolean {
    return confirm(`❓ ${message}`);
  }
}