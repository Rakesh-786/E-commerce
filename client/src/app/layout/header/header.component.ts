import { Component, OnInit, HostListener, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyFormatPipe,
    SvgIconComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  // User and authentication
  currentUser: User | null = null;
  currentUser$!: Observable<User | null>;

  // Menu states
  showAccountMenu = false;
  showCategoriesMenu = false;
  isMobileMenuOpen = false;
  isMenuOpen = false;
  activeNavDropdown: string | null = null;
  isScrolled = false;

  // Search functionality
  searchQuery = '';
  showSuggestions = false;
  suggestions: string[] = [];

  // Cart and wishlist
  cartCount = 0;
  cartTotal = 0;
  wishlistCount = 0;
  compareCount = 0;

  // Categories data with SVG icons
  categories = [
    {
      name: 'Electronics',
      icon: 'electronics',
      subcategories: [
        { name: 'Smartphones', slug: 'smartphones' },
        { name: 'Laptops', slug: 'laptops' },
        { name: 'Tablets', slug: 'tablets' },
        { name: 'Accessories', slug: 'electronics-accessories' }
      ]
    },
    {
      name: 'Fashion',
      icon: 'fashion',
      subcategories: [
        { name: 'Men\'s Clothing', slug: 'mens-clothing' },
        { name: 'Women\'s Clothing', slug: 'womens-clothing' },
        { name: 'Shoes', slug: 'shoes' },
        { name: 'Accessories', slug: 'fashion-accessories' }
      ]
    },
    {
      name: 'Home & Kitchen',
      icon: 'home-kitchen',
      subcategories: [
        { name: 'Furniture', slug: 'furniture' },
        { name: 'Kitchen', slug: 'kitchen' },
        { name: 'Decor', slug: 'decor' },
        { name: 'Appliances', slug: 'appliances' }
      ]
    },
    {
      name: 'Beauty',
      icon: 'beauty',
      subcategories: [
        { name: 'Skincare', slug: 'skincare' },
        { name: 'Makeup', slug: 'makeup' },
        { name: 'Hair Care', slug: 'hair-care' },
        { name: 'Fragrances', slug: 'fragrances' }
      ]
    },
    {
      name: 'Sports',
      icon: 'sports',
      subcategories: [
        { name: 'Fitness', slug: 'fitness' },
        { name: 'Outdoor', slug: 'outdoor' },
        { name: 'Team Sports', slug: 'team-sports' },
        { name: 'Equipment', slug: 'sports-equipment' }
      ]
    },
    {
      name: 'Books',
      icon: 'books',
      subcategories: [
        { name: 'Fiction', slug: 'fiction' },
        { name: 'Non-Fiction', slug: 'non-fiction' },
        { name: 'Educational', slug: 'educational' },
        { name: 'Comics', slug: 'comics' }
      ]
    }
  ];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartService.getCartItems().subscribe(items => {
      this.cartCount = items.reduce((count, item) => count + item.quantity, 0);
      this.cartTotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    });

    // Subscribe to user changes
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Mock data for wishlist and compare counts
    this.wishlistCount = 3;
    this.compareCount = 1;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if click is outside the user menu
    const userMenuElement = this.elementRef.nativeElement.querySelector('.user-menu');
    const userIconElement = this.elementRef.nativeElement.querySelector('.user-icon');

    // Only close if the click is outside the menu AND not on the user icon (which toggles the menu)
    if (userMenuElement && !userMenuElement.contains(event.target as Node) &&
      !(userIconElement && userIconElement.contains(event.target as Node))) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu(event?: MouseEvent): void {
    // Prevent event propagation to avoid immediate closing by document click handler
    if (event) {
      event.stopPropagation();
    }

    this.isMenuOpen = !this.isMenuOpen;

    // Close mobile menu if open
    if (this.isMobileMenuOpen && this.isMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    // Toggle body scroll when mobile menu is open
    if (this.isMobileMenuOpen) {
      this.renderer.addClass(document.body, 'no-scroll');
    } else {
      this.renderer.removeClass(document.body, 'no-scroll');
    }

    // Close user dropdown if open
    if (this.isMenuOpen && this.isMobileMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  // Search functionality
  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Navigate to search results
      this.showSuggestions = false;

      // Close mobile menu after search on mobile
      if (this.isMobileMenuOpen) {
        this.toggleMobileMenu();
      }
    }
  }

  onSearchInput(): void {
    if (this.searchQuery.length > 2) {
      // Mock search suggestions
      this.suggestions = [
        'iPhone 15 Pro',
        'Samsung Galaxy S24',
        'MacBook Pro',
        'Nike Air Max',
        'Adidas Sneakers'
      ].filter(item =>
        item.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.showSuggestions = this.suggestions.length > 0;
    } else {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.onSearch();
  }

  // Menu controls
  toggleAccountMenu(): void {
    this.showAccountMenu = !this.showAccountMenu;
    this.showCategoriesMenu = false;
    this.activeNavDropdown = null;
  }

  closeAccountMenu(): void {
    this.showAccountMenu = false;
  }

  toggleCategoriesMenu(): void {
    this.showCategoriesMenu = !this.showCategoriesMenu;
    this.showAccountMenu = false;
    this.activeNavDropdown = null;
  }

  closeCategoriesMenu(): void {
    this.showCategoriesMenu = false;
  }

  toggleNavDropdown(dropdown: string): void {
    this.activeNavDropdown = this.activeNavDropdown === dropdown ? null : dropdown;
    this.showAccountMenu = false;
    this.showCategoriesMenu = false;
  }

  closeNavDropdown(dropdown: string): void {
    if (this.activeNavDropdown === dropdown) {
      this.activeNavDropdown = null;
    }
  }

  logout(): void {
    this.authService.logout();
    this.showAccountMenu = false;
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }
}
