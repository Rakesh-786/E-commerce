import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User, UpdateProfileRequest } from '../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar-section">
          <div class="avatar-container">
            <img [src]="user?.avatar || '/assets/images/default-avatar.png'"
                 [alt]="user?.fullName || 'User Avatar'"
                 class="avatar-image">
            <div class="avatar-overlay" (click)="triggerAvatarUpload()">
              <i class="fa-solid fa-camera"></i>
              <span>Change Photo</span>
            </div>
            <input #avatarInput type="file" accept="image/*"
                   (change)="onAvatarSelected($event)" style="display: none;">
          </div>

          <div class="profile-info">
            <h1 class="profile-name">{{ getDisplayName() }}</h1>
            <p class="profile-email">{{ user?.email }}</p>
            <div class="profile-badges">
              <span class="badge" [class]="getRoleBadgeClass()">
                <i [class]="getRoleIcon()"></i>
                {{ getRoleLabel() }}
              </span>
              <span class="badge verified" *ngIf="user?.emailVerified">
                <i class="fa-solid fa-check-circle"></i>
                Email Verified
              </span>
              <span class="badge verified" *ngIf="isVerifiedMerchant()">
                <i class="fa-solid fa-shield-check"></i>
                Verified Merchant
              </span>
            </div>
          </div>
        </div>

        <!-- Profile Completeness -->
        <div class="profile-completeness">
          <div class="completeness-header">
            <h3>Profile Completeness</h3>
            <span class="completeness-percentage">{{ profileCompleteness }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="profileCompleteness"></div>
          </div>
          <p class="completeness-text" *ngIf="profileCompleteness < 100">
            Complete your profile to unlock all features
          </p>
        </div>
      </div>

      <!-- Profile Tabs -->
      <div class="profile-tabs">
        <button class="tab-button"
                [class.active]="activeTab === 'personal'"
                (click)="setActiveTab('personal')">
          <i class="fa-solid fa-user"></i>
          Personal Info
        </button>
        <button class="tab-button"
                [class.active]="activeTab === 'security'"
                (click)="setActiveTab('security')">
          <i class="fa-solid fa-shield-alt"></i>
          Security
        </button>
        <button class="tab-button"
                [class.active]="activeTab === 'addresses'"
                (click)="setActiveTab('addresses')">
          <i class="fa-solid fa-map-marker-alt"></i>
          Addresses
        </button>
        <button class="tab-button"
                [class.active]="activeTab === 'preferences'"
                (click)="setActiveTab('preferences')">
          <i class="fa-solid fa-cog"></i>
          Preferences
        </button>
        <button class="tab-button"
                [class.active]="activeTab === 'merchant'"
                (click)="setActiveTab('merchant')"
                *ngIf="user?.role === 'merchant'">
          <i class="fa-solid fa-store"></i>
          Business
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Personal Information Tab -->
        <div class="tab-pane" *ngIf="activeTab === 'personal'">
          <div class="section-card">
            <div class="section-header">
              <h2>Personal Information</h2>
              <button class="btn btn-primary"
                      [disabled]="profileForm.invalid || isLoading"
                      (click)="updateProfile()">
                <i class="fa-solid fa-save" *ngIf="!isLoading"></i>
                <i class="fa-solid fa-spinner fa-spin" *ngIf="isLoading"></i>
                {{ isLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <form [formGroup]="profileForm" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name *</label>
                  <input type="text" id="firstName" formControlName="firstName"
                         [class.is-invalid]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched">
                  <div class="error-message"
                       *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched">
                    First name is required
                  </div>
                </div>

                <div class="form-group">
                  <label for="lastName">Last Name *</label>
                  <input type="text" id="lastName" formControlName="lastName"
                         [class.is-invalid]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched">
                  <div class="error-message"
                       *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched">
                    Last name is required
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" [value]="user?.email" readonly>
                <small class="form-text">Email cannot be changed. Contact support if needed.</small>
              </div>

              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" formControlName="phone"
                       placeholder="+1 (555) 123-4567">
              </div>
            </form>

            <div class="success-message" *ngIf="successMessage">
              <i class="fa-solid fa-check-circle"></i>
              {{ successMessage }}
            </div>

            <div class="error-message" *ngIf="errorMessage">
              <i class="fa-solid fa-exclamation-circle"></i>
              {{ errorMessage }}
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div class="tab-pane" *ngIf="activeTab === 'security'">
          <div class="section-card">
            <div class="section-header">
              <h2>Account Security</h2>
            </div>

            <!-- Email Verification -->
            <div class="security-item">
              <div class="security-info">
                <h3>Email Verification</h3>
                <p>Verify your email address to secure your account</p>
              </div>
              <div class="security-status">
                <span class="status-badge" [class.verified]="user?.emailVerified">
                  <i [class]="user?.emailVerified ? 'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-triangle'"></i>
                  {{ user?.emailVerified ? 'Verified' : 'Not Verified' }}
                </span>
                <button class="btn btn-outline"
                        *ngIf="!user?.emailVerified"
                        (click)="sendEmailVerification()">
                  Send Verification Email
                </button>
              </div>
            </div>

            <!-- Two-Factor Authentication -->
            <div class="security-item">
              <div class="security-info">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>
              </div>
              <div class="security-status">
                <span class="status-badge" [class.verified]="user?.twoFactorEnabled">
                  <i [class]="user?.twoFactorEnabled ? 'fa-solid fa-shield-check' : 'fa-solid fa-shield'"></i>
                  {{ user?.twoFactorEnabled ? 'Enabled' : 'Disabled' }}
                </span>
                <button class="btn"
                        [class]="user?.twoFactorEnabled ? 'btn-danger' : 'btn-primary'"
                        (click)="toggleTwoFactor()">
                  {{ user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA' }}
                </button>
              </div>
            </div>

            <!-- Change Password -->
            <div class="security-item">
              <div class="security-info">
                <h3>Password</h3>
                <p>Change your account password</p>
              </div>
              <div class="security-status">
                <button class="btn btn-outline" routerLink="/auth/change-password">
                  Change Password
                </button>
              </div>
            </div>

            <!-- Active Sessions -->
            <div class="security-item">
              <div class="security-info">
                <h3>Active Sessions</h3>
                <p>Manage your active login sessions</p>
              </div>
              <div class="security-status">
                <button class="btn btn-outline" (click)="viewActiveSessions()">
                  View Sessions
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Other tabs will be implemented in next chunks -->
        <div class="tab-pane" *ngIf="activeTab === 'addresses'">
          <div class="section-card">
            <div class="section-header">
              <h2>Shipping Addresses</h2>
              <button class="btn btn-primary" (click)="addNewAddress()">
                <i class="fa-solid fa-plus"></i>
                Add New Address
              </button>
            </div>
            <p class="coming-soon">Address management coming in next update...</p>
          </div>
        </div>

        <div class="tab-pane" *ngIf="activeTab === 'preferences'">
          <div class="section-card">
            <div class="section-header">
              <h2>Account Preferences</h2>
            </div>
            <p class="coming-soon">Preferences management coming in next update...</p>
          </div>
        </div>

        <div class="tab-pane" *ngIf="activeTab === 'merchant' && user?.role === 'merchant'">
          <div class="section-card">
            <div class="section-header">
              <h2>Business Information</h2>
            </div>
            <p class="coming-soon">Merchant verification coming in next update...</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 2rem;
      color: white;
      margin-bottom: 2rem;
    }

    .profile-avatar-section {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .avatar-container {
      position: relative;
      cursor: pointer;
    }

    .avatar-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.2);
    }

    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-size: 0.8rem;
      text-align: center;
    }

    .avatar-container:hover .avatar-overlay {
      opacity: 1;
    }

    .profile-info h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .profile-email {
      margin: 0 0 1rem 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .profile-badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .badge.customer { background: rgba(52, 152, 219, 0.3); }
    .badge.merchant { background: rgba(230, 126, 34, 0.3); }
    .badge.admin { background: rgba(231, 76, 60, 0.3); }
    .badge.verified { background: rgba(46, 204, 113, 0.3); }

    .profile-completeness {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .completeness-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .completeness-percentage {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .progress-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #8BC34A);
      transition: width 0.3s ease;
    }

    .profile-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #e1e5e9;
      overflow-x: auto;
    }

    .tab-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border: none;
      background: none;
      color: #666;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .tab-button:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .tab-button.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .section-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      margin-bottom: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f1f3f4;
    }

    .section-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .profile-form {
      max-width: 600px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input.is-invalid {
      border-color: #dc3545;
    }

    .form-group input[readonly] {
      background: #f8f9fa;
      color: #666;
    }

    .form-text {
      font-size: 0.8rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border: 2px solid #f1f3f4;
      border-radius: 12px;
      margin-bottom: 1rem;
    }

    .security-info h3 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .security-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .security-status {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #f8f9fa;
      color: #666;
    }

    .status-badge.verified {
      background: #d4edda;
      color: #155724;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a6fd8;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .success-message, .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .coming-soon {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-avatar-section {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .security-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .security-status {
        width: 100%;
        justify-content: space-between;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  activeTab = 'personal';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  profileCompleteness = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['']
    });
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || ''
        });
        this.calculateProfileCompleteness();
      }
    });
  }

  private calculateProfileCompleteness(): void {
    if (this.user) {
      this.profileCompleteness = this.authService.calculateProfileCompleteness(this.user);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getDisplayName(): string {
    return this.user ? this.authService.getDisplayName(this.user) : 'User';
  }

  getRoleLabel(): string {
    if (!this.user) return '';
    return this.user.role.charAt(0).toUpperCase() + this.user.role.slice(1);
  }

  getRoleIcon(): string {
    if (!this.user) return 'fa-solid fa-user';
    switch (this.user.role) {
      case 'customer': return 'fa-solid fa-user';
      case 'merchant': return 'fa-solid fa-store';
      case 'admin': return 'fa-solid fa-user-shield';
      default: return 'fa-solid fa-user';
    }
  }

  getRoleBadgeClass(): string {
    return this.user?.role || 'customer';
  }

  isVerifiedMerchant(): boolean {
    return this.user ? this.authService.isVerifiedMerchant(this.user) : false;
  }

  triggerAvatarUpload(): void {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadAvatar(file);
    }
  }

  private uploadAvatar(file: File): void {
    this.isLoading = true;
    this.clearMessages();

    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Profile picture updated successfully!';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error || 'Failed to upload profile picture';
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    this.clearMessages();

    const profileData: UpdateProfileRequest = this.profileForm.value;

    this.authService.updateProfile(profileData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        this.calculateProfileCompleteness();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error || 'Failed to update profile';
      }
    });
  }

  sendEmailVerification(): void {
    this.authService.sendEmailVerification().subscribe({
      next: () => {
        this.successMessage = 'Verification email sent! Check your inbox.';
      },
      error: (error) => {
        this.errorMessage = error || 'Failed to send verification email';
      }
    });
  }

  toggleTwoFactor(): void {
    // This will be implemented in the next chunk
    this.errorMessage = 'Two-factor authentication setup coming in next update...';
  }

  viewActiveSessions(): void {
    // This will be implemented in the next chunk
    this.errorMessage = 'Session management coming in next update...';
  }

  addNewAddress(): void {
    // This will be implemented in the next chunk
    this.errorMessage = 'Address management coming in next update...';
  }
}
