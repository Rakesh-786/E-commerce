import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Order Confirmation" 
      description="Thank you for your order! Here are your order details and tracking information.">
    </app-placeholder>
  `
})
export class OrderConfirmationComponent {}
