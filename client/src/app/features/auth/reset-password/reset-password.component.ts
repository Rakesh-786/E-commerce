import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-card">
        <div class="reset-password-header">
          <div class="reset-password-icon">
            <i class="fa-solid fa-lock-open"></i>
          </div>
          <h1 class="reset-password-title">Reset Password</h1>
          <p class="reset-password-subtitle">
            Create a new password for your account. Make sure it's strong and secure.
          </p>
        </div>

        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="reset-password-form">
          <div class="form-group">
            <label for="newPassword">New Password *</label>
            <div class="input-container">
              <i class="fa-solid fa-lock input-icon"></i>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="newPassword" 
                formControlName="newPassword"
                placeholder="Enter new password"
                [ngClass]="{'is-invalid': resetPasswordForm.get('newPassword')?.invalid && resetPasswordForm.get('newPassword')?.touched}">
              <i class="password-toggle" 
                 [class]="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                 (click)="togglePasswordVisibility()"></i>
            </div>
            <div class="error-message" 
                 *ngIf="resetPasswordForm.get('newPassword')?.invalid && resetPasswordForm.get('newPassword')?.touched">
              <span *ngIf="resetPasswordForm.get('newPassword')?.errors?.['required']">Password is required</span>
              <span *ngIf="resetPasswordForm.get('newPassword')?.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <div class="input-container">
              <i class="fa-solid fa-lock input-icon"></i>
              <input 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                formControlName="confirmPassword"
                placeholder="Confirm new password"
                [ngClass]="{'is-invalid': resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched}">
              <i class="password-toggle" 
                 [class]="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                 (click)="toggleConfirmPasswordVisibility()"></i>
            </div>
            <div class="error-message" 
                 *ngIf="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched">
              <span *ngIf="resetPasswordForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
              <span *ngIf="resetPasswordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
            </div>
          </div>

          <div class="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li [class.valid]="hasMinLength">At least 6 characters</li>
              <li [class.valid]="hasUpperCase">One uppercase letter</li>
              <li [class.valid]="hasLowerCase">One lowercase letter</li>
              <li [class.valid]="hasNumber">One number</li>
            </ul>
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
            [disabled]="resetPasswordForm.invalid || isLoading">
            <i class="fa-solid fa-check" *ngIf="!isLoading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="isLoading"></i>
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div class="reset-password-footer">
          <div class="back-to-login">
            <i class="fa-solid fa-arrow-left"></i>
            <a routerLink="/auth/login">Back to Login</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .reset-password-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 500px;
      padding: 2.5rem;
      animation: slideInUp 0.6s ease-out;
    }

    .reset-password-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .reset-password-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1.5rem;
      box-shadow: 0 10px 25px rgba(40, 167, 69, 0.3);
    }

    .reset-password-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .reset-password-subtitle {
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
      color: #28a745;
      z-index: 2;
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #28a745;
      cursor: pointer;
      z-index: 2;
    }

    input {
      width: 100%;
      padding: 1rem 3rem 1rem 3rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;

      &:focus {
        outline: none;
        border-color: #28a745;
        box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
      }

      &.is-invalid {
        border-color: #dc3545;
      }
    }

    .password-requirements {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;

      h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        color: #333;
      }

      ul {
        margin: 0;
        padding-left: 1rem;
        list-style: none;

        li {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.25rem;
          position: relative;

          &::before {
            content: '✗';
            color: #dc3545;
            font-weight: bold;
            margin-right: 0.5rem;
          }

          &.valid {
            color: #28a745;

            &::before {
              content: '✓';
              color: #28a745;
            }
          }
        }
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
      background: linear-gradient(135deg, #28a745, #20c997);
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
        box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
    }

    .reset-password-footer {
      text-align: center;
    }

    .back-to-login {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      
      a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        
        &:hover {
          text-decoration: underline;
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
      .reset-password-container {
        padding: 1rem;
      }
      
      .reset-password-card {
        padding: 2rem 1.5rem;
      }
      
      .reset-password-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  resetToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getResetToken();
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private getResetToken(): void {
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (!this.resetToken) {
        this.errorMessage = 'Invalid reset token. Please request a new password reset.';
      }
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      const errors = confirmPassword?.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  get hasMinLength(): boolean {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    return password.length >= 6;
  }

  get hasUpperCase(): boolean {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  get hasLowerCase(): boolean {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    return /[a-z]/.test(password);
  }

  get hasNumber(): boolean {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';
    return /\d/.test(password);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.resetToken) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.resetPasswordForm.get('newPassword')?.value;

    this.authService.resetPassword(this.resetToken, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Password reset successfully!';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error || 'Failed to reset password. Please try again.';
      }
    });
  }
}
