import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { ToastComponent, Toast } from '../toast/toast.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="toast-container">
      <app-toast
        *ngFor="let toast of toasts$ | async; trackBy: trackByToastId"
        [toast]="toast"
        (toastDismiss)="onToastDismiss($event)">
      </app-toast>
    </div>
  `,
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent implements OnInit {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void {}

  onToastDismiss(toastId: string): void {
    this.toastService.dismiss(toastId);
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }
}
