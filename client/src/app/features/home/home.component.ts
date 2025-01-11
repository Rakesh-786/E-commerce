import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../shared/models/product.model';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';

declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, SvgIconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  featuredProducts: Product[] = [];
  isLoading = true;

  // Placeholder images for categories - using simple CSS gradients
  categoryImages = {
    electronics: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%236a1b9a;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23grad1)"/%3E%3Ctext x="200" y="150" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3EElectronics%3C/text%3E%3C/svg%3E',
    fashion: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%236a1b9a;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23grad2)"/%3E%3Ctext x="200" y="150" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3EFashion%3C/text%3E%3C/svg%3E',
    home: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Cdefs%3E%3ClinearGradient id="grad3" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%236a1b9a;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23grad3)"/%3E%3Ctext x="200" y="150" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3EHome and Kitchen%3C/text%3E%3C/svg%3E',
    beauty: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Cdefs%3E%3ClinearGradient id="grad4" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%236a1b9a;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="300" fill="url(%23grad4)"/%3E%3Ctext x="200" y="150" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3EBeauty%3C/text%3E%3C/svg%3E'
  };

  // Placeholder for hero image - using base64 encoded simple colored rectangle
  heroImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NTAiIGhlaWdodD0iNDUwIj48cmVjdCB3aWR0aD0iNDUwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzZhMWI5YSIgZmlsbC1vcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIyMjUiIHk9IjIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+RmFzaGlvbiBNb2RlbDwvdGV4dD48L3N2Zz4=';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  ngAfterViewInit(): void {
    // Initialize AOS animations
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 800,
          easing: 'ease-in-out',
          once: false,
          mirror: true
        });
      }
    }, 100);
  }

  loadFeaturedProducts(): void {
    this.isLoading = true;
    this.productService.getFeaturedProducts().subscribe(response => {
      this.featuredProducts = response.products;
      this.isLoading = false;

      // Refresh AOS when products are loaded
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }, 100);
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    // Show animation or notification here
  }
}