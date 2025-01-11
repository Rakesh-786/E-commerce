import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div
        #modalContent
        class="modal-content"
        [class]="'modal-' + size"
        appClickOutside
        (clickOutside)="onClickOutside()"
        role="dialog"
        [attr.aria-labelledby]="title ? 'modal-title' : null"
        aria-modal="true">

        <!-- Header -->
        <div class="modal-header" *ngIf="title || showCloseButton">
          <h2 id="modal-title" class="modal-title" *ngIf="title">{{ title }}</h2>
          <button
            *ngIf="showCloseButton"
            type="button"
            class="modal-close"
            (click)="close()"
            aria-label="Close modal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() size: 'small' | 'medium' | 'large' | 'extra-large' = 'medium';
  @Input() showCloseButton: boolean = true;
  @Input() showFooter: boolean = false;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() closeOnEscape: boolean = true;

  @Output() modalClose = new EventEmitter<void>();

  @ViewChild('modalContent') modalContent!: ElementRef;

  private originalBodyOverflow: string = '';

  ngOnInit(): void {
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.onEscapeKey.bind(this));
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onEscapeKey.bind(this));
    this.restoreBodyOverflow();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.preventBodyScroll();
      setTimeout(() => this.focusModal(), 100);
    } else {
      this.restoreBodyOverflow();
    }
  }

  close(): void {
    this.modalClose.emit();
  }

  onOverlayClick(event: Event): void {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }

  onClickOutside(): void {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }

  private onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  private preventBodyScroll(): void {
    this.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  private restoreBodyOverflow(): void {
    document.body.style.overflow = this.originalBodyOverflow;
  }

  private focusModal(): void {
    if (this.modalContent) {
      this.modalContent.nativeElement.focus();
    }
  }
}
