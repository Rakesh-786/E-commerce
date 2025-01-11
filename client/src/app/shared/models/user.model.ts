export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
  label?: string; // Home, Work, etc.
}

export interface MerchantInfo {
  businessName?: string;
  businessDescription?: string;
  businessLicense?: string;
  isVerified: boolean;
  verificationDate?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  businessType?: string;
  taxId?: string;
  website?: string;
  businessAddress?: UserAddress;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  currency: string;
  timezone: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  wishlistCount: number;
  reviewsCount: number;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'merchant' | 'admin';
  isActive: boolean;
  avatar?: string;
  phone?: string;
  address?: UserAddress;
  addresses?: UserAddress[]; // Multiple addresses
  merchantInfo?: MerchantInfo;
  preferences?: UserPreferences;
  stats?: UserStats;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;

  // Virtual properties
  fullName?: string;
  profileCompleteness?: number;
  isVerifiedMerchant?: boolean;

  // Legacy compatibility
  id?: string;
  isAdmin?: boolean;
}

// Request/Response interfaces
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateAddressRequest {
  addresses: UserAddress[];
}

export interface MerchantVerificationRequest {
  businessLicense: string;
  businessType: string;
  taxId?: string;
  website?: string;
  businessAddress: UserAddress;
  additionalDocuments?: string[];
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}
