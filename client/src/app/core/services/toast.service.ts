import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast, ToastType } from '../../shared/components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private defaultDuration = 5000; // 5 seconds

  show(type: ToastType, message: string, title?: string, duration?: number): string {
    const id = this.generateId();
    const toast: Toast = {
      id,
      type,
      message,
      title,
      duration: duration ?? this.defaultDuration,
      dismissible: true
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    return id;
  }

  success(message: string, title?: string, duration?: number): string {
    return this.show('success', message, title, duration);
  }

  error(message: string, title?: string, duration?: number): string {
    return this.show('error', message, title, duration);
  }

  warning(message: string, title?: string, duration?: number): string {
    return this.show('warning', message, title, duration);
  }

  info(message: string, title?: string, duration?: number): string {
    return this.show('info', message, title, duration);
  }

  dismiss(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const filteredToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(filteredToasts);
  }

  dismissAll(): void {
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
