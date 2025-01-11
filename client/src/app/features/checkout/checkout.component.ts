import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Checkout" 
      description="Complete your purchase with secure payment and shipping options.">
    </app-placeholder>
  `
})
export class CheckoutComponent {}
