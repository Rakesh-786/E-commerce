import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Category Products" 
      description="Browse products in this category with filters and sorting options.">
    </app-placeholder>
  `
})
export class CategoryComponent {}
