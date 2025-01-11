import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Special Deals" 
      description="Discover amazing discounts, flash sales, and exclusive offers on top products.">
    </app-placeholder>
  `
})
export class DealsComponent {}
