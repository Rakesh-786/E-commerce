import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav aria-label="Pagination" *ngIf="totalPages > 1" class="pagination-nav">
      <ul class="pagination">
        <!-- Previous button -->
        <li class="page-item" [class.disabled]="!hasPrev">
          <button 
            class="page-link" 
            (click)="onPageChange(currentPage - 1)"
            [disabled]="!hasPrev"
            aria-label="Previous page">
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>

        <!-- Page numbers -->
        <li 
          *ngFor="let page of visiblePages" 
          class="page-item" 
          [class.active]="page === currentPage">
          <button 
            class="page-link" 
            (click)="onPageChange(page)"
            [attr.aria-label]="'Page ' + page"
            [attr.aria-current]="page === currentPage ? 'page' : null">
            {{ page }}
          </button>
        </li>

        <!-- Next button -->
        <li class="page-item" [class.disabled]="!hasNext">
          <button 
            class="page-link" 
            (click)="onPageChange(currentPage + 1)"
            [disabled]="!hasNext"
            aria-label="Next page">
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>

      <!-- Page info -->
      <div class="pagination-info">
        Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} results
      </div>
    </nav>
  `,
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() hasNext: boolean = false;
  @Input() hasPrev: boolean = false;
  @Input() maxVisiblePages: number = 5;

  @Output() pageChange = new EventEmitter<number>();

  visiblePages: number[] = [];
  startItem: number = 0;
  endItem: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateVisiblePages();
    this.calculateItemRange();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  private calculateVisiblePages(): void {
    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    if (end - start + 1 < this.maxVisiblePages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    this.visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  private calculateItemRange(): void {
    this.startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    this.endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
