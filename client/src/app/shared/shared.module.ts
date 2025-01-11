import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { PaginationComponent } from './components/pagination/pagination.component';
import { ModalComponent } from './components/modal/modal.component';
import { ToastComponent } from './components/toast/toast.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

// Pipes
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';

// Directives
import { LazyLoadImageDirective } from './directives/lazy-load-image.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    // Standalone components
    PaginationComponent,
    ModalComponent,
    ToastComponent,
    ToastContainerComponent,
    CurrencyFormatPipe,
    TruncatePipe,
    DateFormatPipe,
    LazyLoadImageDirective,
    ClickOutsideDirective
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    // Export standalone components for use in other modules
    PaginationComponent,
    ModalComponent,
    ToastComponent,
    ToastContainerComponent,
    CurrencyFormatPipe,
    TruncatePipe,
    DateFormatPipe,
    LazyLoadImageDirective,
    ClickOutsideDirective
  ]
})
export class SharedModule { }
