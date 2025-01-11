import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Product Details" 
      description="View detailed product information, images, reviews, and specifications.">
    </app-placeholder>
  `
})
export class ProductDetailComponent {}
