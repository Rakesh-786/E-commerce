import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="toast" 
      [class]="'toast-' + toast.type"
      [attr.role]="toast.type === 'error' ? 'alert' : 'status'"
      [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'">
      
      <div class="toast-icon">
        <ng-container [ngSwitch]="toast.type">
          <span *ngSwitchCase="'success'" class="icon-success">✓</span>
          <span *ngSwitchCase="'error'" class="icon-error">✕</span>
          <span *ngSwitchCase="'warning'" class="icon-warning">⚠</span>
          <span *ngSwitchCase="'info'" class="icon-info">ℹ</span>
        </ng-container>
      </div>

      <div class="toast-content">
        <div class="toast-title" *ngIf="toast.title">{{ toast.title }}</div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>

      <button 
        *ngIf="toast.dismissible !== false"
        type="button" 
        class="toast-close" 
        (click)="dismiss()"
        aria-label="Close notification">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `,
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() toast!: Toast;
  @Output() toastDismiss = new EventEmitter<string>();

  private timeoutId?: number;

  ngOnInit(): void {
    if (this.toast.duration && this.toast.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.dismiss();
      }, this.toast.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  dismiss(): void {
    this.toastDismiss.emit(this.toast.id);
  }
}
