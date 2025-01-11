import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="Top Brands" 
      description="Explore products from your favorite brands and discover new ones.">
    </app-placeholder>
  `
})
export class BrandsComponent {}
