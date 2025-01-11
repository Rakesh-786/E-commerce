import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, throwError, timer } from 'rxjs';
import { Router } from '@angular/router';
import {
  User,
  UpdateProfileRequest,
  UpdateAddressRequest,
  MerchantVerificationRequest,
  UserFilters,
  UserListResponse,
  UserAddress
} from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, retry } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'customer' | 'merchant' | 'admin';
  phone?: string;
  address?: UserAddress;
  businessName?: string;
  businessDescription?: string;
  businessLicense?: string;
  businessType?: string;
  website?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  expiresIn?: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  private tokenKey = 'ecommerce_token';
  private refreshTokenKey = 'ecommerce_refresh_token';
  private rememberMeKey = 'ecommerce_remember_me';
  private isBrowser: boolean;
  private tokenExpirationTimer: any;

  // Public observables
  public currentUser$ = this.currentUserSubject.asObservable();
  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.initializeAuth();
    }
  }

  private initializeAuth(): void {
    this.setLoading(true);
    this.loadUserFromStorage();
    this.setupTokenExpirationCheck();
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) {
      this.setLoading(false);
      return;
    }

    try {
      const token = this.getStoredToken();
      if (token && !this.isTokenExpired(token)) {
        this.getCurrentUser().subscribe({
          next: (response) => {
            this.setUser(response.user);
            this.setLoading(false);
          },
          error: (error) => {
            console.error('Error loading user from storage:', error);
            this.handleAuthError('Failed to load user session');
            this.logout();
          }
        });
      } else {
        this.setLoading(false);
        if (token) {
          // Token exists but is expired, try to refresh
          this.attemptTokenRefresh();
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      this.setLoading(false);
    }
  }

  private setupTokenExpirationCheck(): void {
    if (!this.isBrowser) return;

    // Check token expiration every 5 minutes
    timer(0, 5 * 60 * 1000).subscribe(() => {
      const token = this.getStoredToken();
      if (token && this.isTokenExpiringSoon(token)) {
        this.attemptTokenRefresh();
      }
    });
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      loading
    });
  }

  private setUser(user: User | null): void {
    this.currentUserSubject.next(user);
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      user,
      isAuthenticated: !!user,
      error: null
    });
  }

  private handleAuthError(error: string): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      error,
      loading: false
    });
  }

  private clearAuthError(): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      error: null
    });
  }

  // ===== PUBLIC AUTHENTICATION METHODS =====

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);
    this.clearAuthError();

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.handleSuccessfulAuth(response, credentials.rememberMe);
        }),
        catchError(error => {
          this.handleAuthError(this.getErrorMessage(error));
          this.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.setLoading(true);
    this.clearAuthError();

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          this.handleSuccessfulAuth(response, false);
        }),
        catchError(error => {
          this.handleAuthError(this.getErrorMessage(error));
          this.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  logout(redirectToLogin: boolean = true): void {
    this.setLoading(true);

    // Call logout endpoint if user is authenticated
    if (this.isAuthenticated()) {
      this.http.post(`${this.apiUrl}/logout`, {}).pipe(
        catchError(error => {
          console.warn('Logout endpoint failed:', error);
          return of(null);
        })
      ).subscribe(() => {
        this.performLogout(redirectToLogin);
      });
    } else {
      this.performLogout(redirectToLogin);
    }
  }

  private performLogout(redirectToLogin: boolean): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.rememberMeKey);
      } catch (error) {
        console.error('Error removing tokens from localStorage:', error);
      }
    }

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.setUser(null);
    this.setLoading(false);

    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }

  private handleSuccessfulAuth(response: AuthResponse, rememberMe?: boolean): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.tokenKey, response.token);
        if (rememberMe) {
          localStorage.setItem(this.rememberMeKey, 'true');
        }
      } catch (error) {
        console.error('Error saving token to localStorage:', error);
      }
    }

    this.setUser(response.user);
    this.setLoading(false);
    this.setupTokenExpirationTimer(response.token);
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, {})
      .pipe(
        tap(response => {
          if (this.isBrowser) {
            try {
              localStorage.setItem(this.tokenKey, response.token);
            } catch (error) {
              console.error('Error saving refreshed token to localStorage:', error);
            }
          }
          this.setupTokenExpirationTimer(response.token);
        }),
        catchError(error => {
          console.error('Token refresh failed:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // ===== PASSWORD MANAGEMENT =====

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    }).pipe(
      catchError(error => {
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/change-password`, passwordData)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  // ===== PROFILE MANAGEMENT =====

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/profile`)
      .pipe(
        tap(user => {
          this.setUser(user);
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  updateProfile(profileData: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/profile`, profileData)
      .pipe(
        tap(user => {
          this.setUser(user);
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  uploadAvatar(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<UploadResponse>(`${environment.apiUrl}/profile/avatar`, formData)
      .pipe(
        tap(response => {
          // Update current user with new avatar
          const currentUser = this.getCurrentUserValue();
          if (currentUser) {
            this.setUser({ ...currentUser, avatar: response.url });
          }
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  updateAddresses(addressData: UpdateAddressRequest): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/profile/addresses`, addressData)
      .pipe(
        tap(user => {
          this.setUser(user);
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/profile`)
      .pipe(
        tap(() => {
          this.logout(true);
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  // ===== MERCHANT VERIFICATION =====

  submitMerchantVerification(verificationData: MerchantVerificationRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/merchant/verify`, verificationData)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  getMerchantVerificationStatus(): Observable<{ isVerified: boolean; status: string; verificationDate?: string }> {
    return this.http.get<{ isVerified: boolean; status: string; verificationDate?: string }>(`${environment.apiUrl}/merchant/verification-status`)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  uploadBusinessDocument(file: File, documentType: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);

    return this.http.post<UploadResponse>(`${environment.apiUrl}/merchant/documents`, formData)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  // ===== EMAIL VERIFICATION =====

  sendEmailVerification(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-verification-email`, {})
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-email`, { token })
      .pipe(
        tap(() => {
          // Update current user email verification status
          const currentUser = this.getCurrentUserValue();
          if (currentUser) {
            this.setUser({ ...currentUser, emailVerified: true });
          }
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  // ===== TWO-FACTOR AUTHENTICATION =====

  setupTwoFactor(): Observable<TwoFactorSetupResponse> {
    return this.http.post<TwoFactorSetupResponse>(`${this.apiUrl}/2fa/setup`, {})
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  enableTwoFactor(verificationData: TwoFactorVerifyRequest): Observable<{ message: string; backupCodes: string[] }> {
    return this.http.post<{ message: string; backupCodes: string[] }>(`${this.apiUrl}/2fa/enable`, verificationData)
      .pipe(
        tap(() => {
          // Update current user 2FA status
          const currentUser = this.getCurrentUserValue();
          if (currentUser) {
            this.setUser({ ...currentUser, twoFactorEnabled: true });
          }
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  disableTwoFactor(verificationData: TwoFactorVerifyRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/2fa/disable`, verificationData)
      .pipe(
        tap(() => {
          // Update current user 2FA status
          const currentUser = this.getCurrentUserValue();
          if (currentUser) {
            this.setUser({ ...currentUser, twoFactorEnabled: false });
          }
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  verifyTwoFactor(verificationData: TwoFactorVerifyRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/2fa/verify`, verificationData)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  // ===== TOKEN MANAGEMENT =====

  getToken(): string | null {
    return this.getStoredToken();
  }

  private getStoredToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  private isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      const timeUntilExpiration = expirationTime - currentTime;
      return timeUntilExpiration < (minutesThreshold * 60);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  private setupTokenExpirationTimer(token: string): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // Set timer to refresh token 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiration - (5 * 60 * 1000), 0);

      this.tokenExpirationTimer = setTimeout(() => {
        this.attemptTokenRefresh();
      }, refreshTime);
    } catch (error) {
      console.error('Error setting up token expiration timer:', error);
    }
  }

  private attemptTokenRefresh(): void {
    if (!this.isAuthenticated()) {
      return;
    }

    this.refreshToken().subscribe({
      next: () => {
        console.log('Token refreshed successfully');
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
        this.logout();
      }
    });
  }

  // ===== USER STATE METHODS =====

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!(token && !this.isTokenExpired(token));
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  isMerchant(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'merchant';
  }

  isCustomer(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'customer';
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getAuthState(): AuthState {
    return this.authStateSubject.value;
  }

  // ===== UTILITY METHODS =====

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.details) {
      return error.error.details;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // Legacy compatibility methods
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // ===== SESSION MANAGEMENT =====

  extendSession(): Observable<RefreshTokenResponse> {
    return this.refreshToken();
  }

  getSessionInfo(): { isActive: boolean; expiresAt: Date | null; user: User | null } {
    const token = this.getStoredToken();
    const user = this.getCurrentUserValue();

    if (!token || this.isTokenExpired(token)) {
      return { isActive: false, expiresAt: null, user: null };
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = new Date(payload.exp * 1000);
      return { isActive: true, expiresAt, user };
    } catch (error) {
      return { isActive: false, expiresAt: null, user: null };
    }
  }

  clearAuthState(): void {
    this.performLogout(false);
  }

  // ===== ADMIN USER MANAGEMENT =====

  getUsersList(filters?: UserFilters): Observable<UserListResponse> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    }

    return this.http.get<UserListResponse>(`${environment.apiUrl}/admin/users${params}`)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  updateUserStatus(userId: string, isActive: boolean): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/admin/users/${userId}/status`, { isActive })
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  verifyMerchant(userId: string, approved: boolean, rejectionReason?: string): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/admin/users/${userId}/verify-merchant`, {
      approved,
      rejectionReason
    }).pipe(
      catchError(error => {
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/admin/users/${userId}`)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/admin/users/${userId}`)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  // ===== UTILITY METHODS FOR USER MANAGEMENT =====

  calculateProfileCompleteness(user: User): number {
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.avatar,
      user.address?.street,
      user.address?.city,
      user.address?.country
    ];

    if (user.role === 'merchant') {
      fields.push(
        user.merchantInfo?.businessName,
        user.merchantInfo?.businessDescription,
        user.merchantInfo?.businessLicense
      );
    }

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  isVerifiedMerchant(user: User): boolean {
    return user.role === 'merchant' && user.merchantInfo?.isVerified === true;
  }

  getDisplayName(user: User): string {
    if (user.fullName) {
      return user.fullName;
    }
    return `${user.firstName} ${user.lastName}`.trim();
  }

  hasCompleteProfile(user: User): boolean {
    return this.calculateProfileCompleteness(user) >= 80;
  }

  // ===== ENHANCED USER STATE METHODS =====

  isEmailVerified(): boolean {
    const user = this.getCurrentUserValue();
    return user?.emailVerified === true;
  }

  isPhoneVerified(): boolean {
    const user = this.getCurrentUserValue();
    return user?.phoneVerified === true;
  }

  isTwoFactorEnabled(): boolean {
    const user = this.getCurrentUserValue();
    return user?.twoFactorEnabled === true;
  }

  getUserStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/profile/stats`)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  // ===== ACCOUNT SECURITY =====

  getSecurityLog(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/profile/security-log`)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  getActiveSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/profile/sessions`)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  terminateSession(sessionId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/profile/sessions/${sessionId}`)
      .pipe(
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }

  terminateAllSessions(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/profile/sessions`)
      .pipe(
        tap(() => {
          // Current session will be terminated, so logout
          this.logout(true);
        }),
        catchError(error => {
          return throwError(() => this.getErrorMessage(error));
        })
      );
  }
}
