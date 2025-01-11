import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { RatingComponent } from '../rating/rating.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, RatingComponent, ButtonComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  getPrimaryImageUrl(): string {
    // Check if product has images
    if (this.product.images && this.product.images.length > 0) {
      // Try to find primary image
      const primaryImage = this.product.images.find(img => img.isPrimary);

      // If primary image exists and has a valid URL
      if (primaryImage && primaryImage.url && primaryImage.url.trim() !== '') {
        return primaryImage.url;
      }

      // If no primary image but first image has valid URL
      if (this.product.images[0].url && this.product.images[0].url.trim() !== '') {
        return this.product.images[0].url;
      }
    }

    // Return default placeholder if no valid images found - using base64 encoded SVG
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzZhMWI5YSIgZmlsbC1vcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  getInStockStatus(): boolean {
    return this.product.inventory.quantity > 0;
  }
}
