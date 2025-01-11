import { Component } from '@angular/core';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder 
      title="My Wishlist" 
      description="Save your favorite products and get notified when they go on sale.">
    </app-placeholder>
  `
})
export class WishlistComponent {}
