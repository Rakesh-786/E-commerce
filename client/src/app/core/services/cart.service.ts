import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../../shared/models/cart-item.model';
import { Product } from '../../shared/models/product.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Load cart from localStorage if available and in browser environment
    if (this.isBrowser) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.cartItems = JSON.parse(savedCart);
          this.updateCart(false); // Don't save back to localStorage
        } catch (e) {
          console.error('Error parsing cart data:', e);
          this.cartItems = [];
        }
      }
    }
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  getCartTotal(): Observable<number> {
    return this.cartTotalSubject.asObservable();
  }

  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.product._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }

    this.updateCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.cartItems.find(item => item.product._id === productId);

    if (item) {
      item.quantity = quantity;
      this.updateCart();
    }
  }

  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.product._id !== productId);
    this.updateCart();
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  private updateCart(saveToStorage: boolean = true): void {
    // Update observables
    this.cartItemsSubject.next([...this.cartItems]);

    // Calculate total
    const total = this.cartItems.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    this.cartTotalSubject.next(total);

    // Save to localStorage only if in browser environment
    if (this.isBrowser && saveToStorage) {
      try {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
      } catch (e) {
        console.error('Error saving cart to localStorage:', e);
      }
    }
  }
}
