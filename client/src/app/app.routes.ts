import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            {
                path: 'auth',
                children: [
                    {
                        path: 'login',
                        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
                        title: 'Login - MarketMingle',
                        data: {
                            description: 'Sign in to your MarketMingle account',
                            hideForAuthenticated: true
                        }
                    },
                    {
                        path: 'register',
                        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
                        title: 'Create Account - MarketMingle',
                        data: {
                            description: 'Join MarketMingle and start shopping',
                            hideForAuthenticated: true
                        }
                    },
                    {
                        path: 'forgot-password',
                        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
                        title: 'Forgot Password - MarketMingle',
                        data: {
                            description: 'Reset your MarketMingle password',
                            hideForAuthenticated: true
                        }
                    },
                    {
                        path: 'reset-password',
                        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
                        title: 'Reset Password - MarketMingle',
                        data: {
                            description: 'Create a new password for your account',
                            hideForAuthenticated: true
                        }
                    },
                    {
                        path: 'verify-email',
                        loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
                        title: 'Verify Email - MarketMingle',
                        data: {
                            description: 'Verify your email address to activate your account'
                        }
                    },
                    {
                        path: 'change-password',
                        loadComponent: () => import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent),
                        title: 'Change Password - MarketMingle',
                        data: {
                            description: 'Update your account password',
                            requiresAuth: true
                        }
                    },
                    {
                        path: 'logout',
                        loadComponent: () => import('./features/auth/logout/logout.component').then(m => m.LogoutComponent),
                        title: 'Logout - MarketMingle',
                        data: {
                            description: 'Sign out of your account',
                            requiresAuth: true
                        }
                    },
                    {
                        path: '',
                        redirectTo: 'login',
                        pathMatch: 'full'
                    }
                ]
            },
            // User Profile & Account Routes
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
            },
            // Shopping Routes
            {
                path: 'products',
                loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: 'product/:id',
                loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
            },
            {
                path: 'cart',
                loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
            },
            {
                path: 'wishlist',
                loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent)
            },
            {
                path: 'compare',
                loadComponent: () => import('./features/compare/compare.component').then(m => m.CompareComponent)
            },
            // Category & Brand Routes
            {
                path: 'deals',
                loadComponent: () => import('./features/deals/deals.component').then(m => m.DealsComponent)
            },
            {
                path: 'brands',
                loadComponent: () => import('./features/brands/brands.component').then(m => m.BrandsComponent)
            },
            {
                path: 'category/:slug',
                loadComponent: () => import('./features/category/category.component').then(m => m.CategoryComponent)
            },
            // Checkout Routes
            {
                path: 'checkout',
                loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
            },
            {
                path: 'order-confirmation/:id',
                loadComponent: () => import('./features/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
            },
            // Support & Info Routes
            {
                path: 'support',
                loadComponent: () => import('./features/support/support.component').then(m => m.SupportComponent)
            },
            {
                path: 'faq',
                loadComponent: () => import('./features/faq/faq.component').then(m => m.FaqComponent)
            },
            {
                path: 'shipping-info',
                loadComponent: () => import('./features/shipping-info/shipping-info.component').then(m => m.ShippingInfoComponent)
            },
            {
                path: 'returns',
                loadComponent: () => import('./features/returns/returns.component').then(m => m.ReturnsComponent)
            },
            {
                path: 'terms',
                loadComponent: () => import('./features/terms/terms.component').then(m => m.TermsComponent)
            },
            {
                path: 'privacy',
                loadComponent: () => import('./features/privacy/privacy.component').then(m => m.PrivacyComponent)
            },
            // Search Route
            {
                path: 'search',
                loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
            },
            { path: '**', redirectTo: '' }
        ]
    }
];
