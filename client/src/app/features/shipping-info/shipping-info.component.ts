import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-shipping-info',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Shipping Information" 
      description="Learn about our shipping options, delivery times, and shipping costs.">
    </app-placeholder>
  `
})
export class ShippingInfoComponent {}
