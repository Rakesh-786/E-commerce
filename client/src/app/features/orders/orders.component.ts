import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="My Orders" 
      description="Track your order history, view order details, and manage returns.">
    </app-placeholder>
  `
})
export class OrdersComponent {}
