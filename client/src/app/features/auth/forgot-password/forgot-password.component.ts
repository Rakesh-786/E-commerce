import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <div class="forgot-password-header">
          <div class="forgot-password-icon">
            <i class="fa-solid fa-key"></i>
          </div>
          <h1 class="forgot-password-title">Forgot Password?</h1>
          <p class="forgot-password-subtitle">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form">
          <div class="form-group">
            <label for="email">Email Address *</label>
            <div class="input-container">
              <i class="fa-solid fa-envelope input-icon"></i>
              <input 
                type="email" 
                id="email" 
                formControlName="email"
                placeholder="Enter your email address"
                [ngClass]="{'is-invalid': forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched}">
            </div>
            <div class="error-message" 
                 *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched">
              <span *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button 
            type="submit" 
            class="reset-button" 
            [disabled]="forgotPasswordForm.invalid || isLoading">
            <i class="fa-solid fa-paper-plane" *ngIf="!isLoading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="isLoading"></i>
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="forgot-password-footer">
          <div class="back-to-login">
            <i class="fa-solid fa-arrow-left"></i>
            <a routerLink="/auth/login">Back to Login</a>
          </div>
          
          <div class="help-text">
            <p>Remember your password? <a routerLink="/auth/login">Sign in</a></p>
            <p>Don't have an account? <a routerLink="/auth/register">Create one</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .forgot-password-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 450px;
      padding: 2.5rem;
      animation: slideInUp 0.6s ease-out;
    }

    .forgot-password-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .forgot-password-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1.5rem;
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .forgot-password-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .forgot-password-subtitle {
      color: #666;
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .input-container {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #667eea;
      z-index: 2;
    }

    input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      &.is-invalid {
        border-color: #dc3545;
      }
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .success-message {
      color: #28a745;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 1rem;
      background: rgba(40, 167, 69, 0.1);
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }

    .reset-button {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
    }

    .forgot-password-footer {
      text-align: center;
    }

    .back-to-login {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      
      a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .help-text {
      p {
        margin: 0.5rem 0;
        color: #666;
        font-size: 0.9rem;
        
        a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .forgot-password-container {
        padding: 1rem;
      }
      
      .forgot-password-card {
        padding: 2rem 1.5rem;
      }
      
      .forgot-password-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Password reset link sent to your email address.';
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error || 'Failed to send reset link. Please try again.';
      }
    });
  }
}
