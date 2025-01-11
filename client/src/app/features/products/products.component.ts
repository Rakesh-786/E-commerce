import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Shop Products" 
      description="Browse our extensive collection of products with advanced filtering and search options.">
    </app-placeholder>
  `
})
export class ProductsComponent {}
