import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  adminCodeForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showAdminCode = false;
  currentStep = 1;
  accountType: 'customer' | 'merchant' | 'administrator' | null = null;
  adminCodeError = '';
  isVerifyingCode = false;
  isAdminCodeVerified = false;

  // Admin access code (in production, this should be stored securely)
  private readonly ADMIN_ACCESS_CODE = 'ADMIN2024@SECURE';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initAdminCodeForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer'],
      phone: [''],
      businessName: [''],
      businessDescription: ['']
    });
  }

  initAdminCodeForm(): void {
    this.adminCodeForm = this.fb.group({
      adminCode: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  selectAccountType(type: 'customer' | 'merchant' | 'administrator'): void {
    this.accountType = type;
    this.registerForm.patchValue({ role: type === 'administrator' ? 'admin' : type });

    // Add business name validation for merchants
    if (type === 'merchant') {
      this.registerForm.get('businessName')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('businessName')?.clearValidators();
    }
    this.registerForm.get('businessName')?.updateValueAndValidity();
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.accountType) {
      if (this.accountType === 'administrator') {
        this.currentStep = 2; // Go to admin verification
      } else {
        this.currentStep = 2; // Go directly to details for customer/merchant
      }
    } else if (this.currentStep === 2 && this.accountType === 'administrator' && this.isAdminCodeVerified) {
      this.currentStep = 3; // Go to details after admin verification
    }
  }

  previousStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.resetAccountSelection();
    } else if (this.currentStep === 3) {
      this.currentStep = 2;
    }
  }

  resetAccountSelection(): void {
    this.accountType = null;
    this.isAdminCodeVerified = false;
    this.adminCodeError = '';
    this.adminCodeForm.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleAdminCodeVisibility(): void {
    this.showAdminCode = !this.showAdminCode;
  }

  verifyAdminCode(): void {
    if (this.adminCodeForm.invalid) {
      return;
    }

    this.isVerifyingCode = true;
    this.adminCodeError = '';

    const enteredCode = this.adminCodeForm.get('adminCode')?.value;

    // Simulate API call delay
    setTimeout(() => {
      if (enteredCode === this.ADMIN_ACCESS_CODE) {
        this.isAdminCodeVerified = true;
        this.isVerifyingCode = false;
        this.nextStep(); // Proceed to account details
      } else {
        this.adminCodeError = 'Invalid admin access code. Please contact your system administrator.';
        this.isVerifyingCode = false;
      }
    }, 1500);
  }

  getAccountTypeIcon(): string {
    switch (this.accountType) {
      case 'customer':
        return 'fa-solid fa-user';
      case 'merchant':
        return 'fa-solid fa-store';
      case 'administrator':
        return 'fa-solid fa-user-shield';
      default:
        return 'fa-solid fa-user';
    }
  }

  getAccountTypeLabel(): string {
    switch (this.accountType) {
      case 'customer':
        return 'Customer';
      case 'merchant':
        return 'Merchant';
      case 'administrator':
        return 'Administrator';
      default:
        return '';
    }
  }

  getAccountTypeDescription(): string {
    switch (this.accountType) {
      case 'customer':
        return 'Shop products, track orders, and enjoy personalized shopping experience.';
      case 'merchant':
        return 'Sell products, manage inventory, and grow your business on our platform.';
      case 'administrator':
        return 'Manage platform operations, users, and system configurations.';
      default:
        return '';
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Remove unnecessary fields based on role
    const userData = { ...this.registerForm.value };
    if (userData.role !== 'merchant') {
      delete userData.businessName;
      delete userData.businessDescription;
    }

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
