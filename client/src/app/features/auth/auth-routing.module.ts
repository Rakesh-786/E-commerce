import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
        title: 'Login - MarketMingle',
        data: {
          description: 'Sign in to your MarketMingle account',
          hideForAuthenticated: true
        }
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
        title: 'Create Account - MarketMingle',
        data: {
          description: 'Join MarketMingle and start shopping',
          hideForAuthenticated: true
        }
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password - MarketMingle',
        data: {
          description: 'Reset your MarketMingle password',
          hideForAuthenticated: true
        }
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Reset Password - MarketMingle',
        data: {
          description: 'Create a new password for your account',
          hideForAuthenticated: true
        }
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        title: 'Verify Email - MarketMingle',
        data: {
          description: 'Verify your email address to activate your account'
        }
      },
      {
        path: 'change-password',
        loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
        canActivate: [AuthGuard],
        title: 'Change Password - MarketMingle',
        data: {
          description: 'Update your account password',
          requiresAuth: true
        }
      },
      {
        path: 'logout',
        loadComponent: () => import('./logout/logout.component').then(m => m.LogoutComponent),
        canActivate: [AuthGuard],
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
