import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Shopping Cart" 
      description="Review your selected items, update quantities, and proceed to checkout.">
    </app-placeholder>
  `
})
export class CartComponent {}
